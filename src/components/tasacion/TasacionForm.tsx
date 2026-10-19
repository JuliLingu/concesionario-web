"use client";

import { Controller, useForm, useWatch, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, MessageCircle, Send } from "lucide-react";
import { TasacionSchema, type TasacionData, type TasacionInput } from "@/schemas/tasacion";
import { createTasacion } from "@/actions/tasacion";
import { whatsappUrl } from "@/lib/whatsapp";
import { canonizarMarca, canonizarModelo } from "@/lib/marcas";
import { AYUDA_TELEFONO, Campo, claseCampo } from "@/components/forms/Campo";
import { InputNumero } from "@/components/forms/InputNumero";
import { useBorrador } from "@/components/forms/useBorrador";

export interface UnidadDeInteres {
  id: string;
  marca: string;
  modelo: string;
  anio: number;
}

interface TasacionFormProps {
  unidades: UnidadDeInteres[];
  /** Unidad preseleccionada, cuando se llega desde la ficha de un vehículo. */
  unidadInicial?: string;
  /** Teléfono de la concesionaria, para el botón de WhatsApp de la confirmación. */
  telefono: string;
  /** Modelos sugeridos por marca: los del stock primero, después los comunes. */
  sugerencias: Record<string, string[]>;
}

/**
 * El formulario va en tres pasos y no en una sola pantalla larga. En el
 * celular, una lista de quince campos se abandona antes de empezar; tres
 * pantallas cortas con una barra que muestra cuánto falta se terminan.
 *
 * Cada paso valida solo sus campos antes de dejar avanzar, así el error
 * aparece donde está el campo y no tres pantallas después.
 */
const PASOS = [
  {
    titulo: "Tu auto",
    campos: ["marca", "modelo", "anio", "kilometraje", "version", "combustible", "transmision"],
  },
  {
    titulo: "Estado y precio",
    campos: ["observaciones", "precioPretendido", "moneda", "vehiculoInteresId"],
  },
  {
    titulo: "Tus datos",
    campos: ["nombre", "email", "telefono"],
  },
] as const satisfies readonly { titulo: string; campos: readonly Path<TasacionInput>[] }[];

const ULTIMO_PASO = PASOS.length - 1;

/**
 * Lo que se guarda como borrador: el auto y su estado, no los datos de
 * contacto. Ver `useBorrador`.
 */
const CAMPOS_DEL_BORRADOR = [...PASOS[0].campos, ...PASOS[1].campos];

const CLAVE_BORRADOR = "tasacion:borrador:v1";

const BarraDePasos = ({ paso }: { paso: number }) => (
  <div className="flex flex-col gap-2">
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={PASOS.length}
      aria-valuenow={paso + 1}
      aria-valuetext={`Paso ${paso + 1} de ${PASOS.length}: ${PASOS[paso].titulo}`}
      className="h-1.5 w-full rounded-full bg-[hsl(var(--surface-low))] overflow-hidden"
    >
      <div
        className="h-full bg-[hsl(var(--primary))] transition-[width] duration-300"
        style={{ width: `${((paso + 1) / PASOS.length) * 100}%` }}
      />
    </div>
    <ol className="flex justify-between text-[10px] font-black uppercase tracking-[0.1em]">
      {PASOS.map((p, i) => (
        <li
          key={p.titulo}
          aria-current={i === paso ? "step" : undefined}
          className={
            i === paso
              ? "text-[hsl(var(--primary))]"
              : i < paso
                ? "text-[hsl(var(--foreground))]"
                : "text-[hsl(var(--muted-foreground))]"
          }
        >
          <span className="sm:hidden">{i + 1}</span>
          <span className="hidden sm:inline">
            {i + 1}. {p.titulo}
          </span>
        </li>
      ))}
    </ol>
  </div>
);

export const TasacionForm = ({ unidades, unidadInicial, telefono, sugerencias }: TasacionFormProps) => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  // Se guarda lo enviado para poder armar el mensaje de WhatsApp con el auto
  // concreto: el formulario ya no está montado cuando se muestra la confirmación.
  const [enviado, setEnviado] = useState<{ marca: string; modelo: string; anio: number }>();
  /** Código que devuelve la acción; se repite en el mensaje de WhatsApp. */
  const [referencia, setReferencia] = useState<string>();
  const [isPending, start] = useTransition();
  const [paso, setPaso] = useState(0);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  /** Para no robar el foco al cargar la página: solo al cambiar de paso. */
  const cambioDePaso = useRef(false);

  const form = useForm<TasacionInput, unknown, TasacionData>({
    resolver: zodResolver(TasacionSchema),
    defaultValues: {
      nombre: "",
      email: "",
      telefono: "",
      marca: "",
      modelo: "",
      anio: "",
      kilometraje: "",
      version: "",
      combustible: "",
      transmision: "",
      precioPretendido: "",
      moneda: "USD",
      observaciones: "",
      vehiculoInteresId: unidadInicial ?? "",
    },
  });

  const { recuperado, descartar } = useBorrador({
    clave: CLAVE_BORRADOR,
    form,
    campos: CAMPOS_DEL_BORRADOR,
    paso,
    // Con un borrador recuperado se vuelve al paso en el que había quedado.
    alRecuperar: (pasoGuardado) => setPaso(Math.min(Math.max(pasoGuardado, 0), ULTIMO_PASO)),
  });

  useEffect(() => {
    if (!cambioDePaso.current) return;
    cambioDePaso.current = false;
    // En el celular el paso nuevo arranca abajo de la pantalla si no se sube.
    tituloRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    tituloRef.current?.focus({ preventScroll: true });
  }, [paso]);

  const errores = form.formState.errors;
  const marca = useWatch({ control: form.control, name: "marca" });
  const modelosSugeridos = sugerencias[canonizarMarca(marca ?? "")] ?? [];

  const irA = (destino: number) => {
    cambioDePaso.current = true;
    setPaso(destino);
  };

  const avanzar = async () => {
    const valido = await form.trigger([...PASOS[paso].campos], { shouldFocus: true });
    if (valido) irA(paso + 1);
  };

  const empezarDeCero = () => {
    descartar();
    form.reset();
    irA(0);
  };

  const onSubmit = (values: TasacionData) => {
    setError(undefined);

    start(async () => {
      const result = await createTasacion(values);
      if (result.error) setError(result.error);
      if (result.success) {
        descartar({ dejarDeGuardar: true });
        setEnviado({ marca: values.marca, modelo: values.modelo, anio: values.anio });
        setReferencia(result.referencia);
        setSuccess(result.success);
      }
    });
  };

  if (success) {
    // El formulario no pide fotos a propósito (ver PLAN-TASACION.md § 2.4): la
    // subida pública abriría la cuenta de Cloudinary del cliente a cualquiera.
    //
    // Esta pantalla es la que las consigue igual, y por eso no dice "listo".
    // Presentada como confirmación, el visitante lee "ya está" y se va, y el
    // vendedor termina escribiéndole para pedirle las fotos — el ida y vuelta
    // que el módulo venía a sacar. Presentada como un paso que falta, con el
    // detalle de qué sacar, las fotos llegan solas y completas.
    const auto = enviado ? `${enviado.marca} ${enviado.modelo} ${enviado.anio}` : "mi usado";
    const enlaceWhatsapp = whatsappUrl(
      telefono,
      `Hola, mandé la tasación de mi ${auto}${
        referencia ? ` (código ${referencia})` : ""
      }. Te paso las fotos.`,
    );

    return (
      <div className="py-10 px-6 bg-[hsl(var(--card))] flex flex-col items-center text-center gap-4 rounded border border-black/5">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle2 size={28} className="text-green-600" />
        </div>

        <div>
          <h3 className="font-black text-lg uppercase tracking-[-0.02em] text-[hsl(var(--foreground))]">
            Recibimos tu tasación
          </h3>
          {referencia && (
            <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium mt-1">
              Código{" "}
              <span className="font-black tracking-widest text-[hsl(var(--foreground))]">
                {referencia}
              </span>
            </p>
          )}
        </div>

        {enlaceWhatsapp ? (
          <>
            <div className="w-full max-w-[380px] bg-[hsl(var(--surface-low))] rounded p-5 flex flex-col gap-3 text-left">
              <div className="text-[10px] font-black uppercase tracking-[0.1em] text-[hsl(var(--primary))]">
                Falta un paso
              </div>
              <p className="text-sm text-[hsl(var(--foreground))] font-medium leading-relaxed">
                Sin fotos la cotización es una estimación. Mandanos estas cuatro
                por WhatsApp y te pasamos un número firme:
              </p>
              <ul className="text-sm text-[hsl(var(--muted-foreground))] font-medium flex flex-col gap-1">
                <li>1. Frente, en diagonal</li>
                <li>2. Lateral completo</li>
                <li>3. Interior desde la puerta</li>
                <li>4. Tablero con el kilometraje</li>
              </ul>
            </div>

            <a
              href={enlaceWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full max-w-[380px] inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-4 text-[11px] font-black uppercase tracking-[0.1em] rounded hover:brightness-95 transition"
            >
              <MessageCircle size={16} />
              Mandar las fotos por WhatsApp
            </a>

            <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium max-w-[340px] leading-relaxed">
              El mensaje ya va escrito con tu código. Si preferís, un asesor te
              contacta igual para coordinar.
            </p>
          </>
        ) : (
          // Sin teléfono cargado en Configuración no hay a dónde mandarlas: se
          // muestra la confirmación a secas en lugar de un botón roto.
          <p className="text-[hsl(var(--muted-foreground))] font-medium max-w-[340px] leading-relaxed">
            {success}
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      // Enter en los primeros pasos avanza en vez de mandar un formulario a medias.
      onSubmit={paso === ULTIMO_PASO ? form.handleSubmit(onSubmit) : (e) => { e.preventDefault(); void avanzar(); }}
      className="flex flex-col gap-4"
      noValidate
    >
      <BarraDePasos paso={paso} />

      {recuperado && (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-[hsl(var(--surface-low))] rounded px-4 py-3 text-xs font-medium text-[hsl(var(--muted-foreground))]">
          <span>Recuperamos lo que habías cargado.</span>
          <button
            type="button"
            onClick={empezarDeCero}
            className="font-black uppercase tracking-[0.1em] text-[10px] text-[hsl(var(--primary))] hover:underline"
          >
            Empezar de cero
          </button>
        </div>
      )}

      <h2
        ref={tituloRef}
        tabIndex={-1}
        className="text-[10px] font-black uppercase tracking-[0.1em] text-[hsl(var(--primary))] mt-2 scroll-mt-28 focus:outline-none"
      >
        {PASOS[paso].titulo}
      </h2>

      {paso === 0 && (
        <>
          <div className="flex flex-col sm:flex-row gap-4">
            <Campo label="Marca *" error={errores.marca?.message} className="flex-1">
              <input
                {...form.register("marca", {
                  // Al salir del campo se corrige a la forma conocida: así lo
                  // ve quien escribe "vw" y no le sorprende ver "Volkswagen".
                  onBlur: (e) => {
                    const corregida = canonizarMarca(e.target.value);
                    if (corregida !== e.target.value) form.setValue("marca", corregida);
                  },
                })}
                list="marcas-sugeridas"
                autoComplete="off"
                autoCapitalize="words"
                placeholder="Ej: Toyota"
                disabled={isPending}
                className={claseCampo({ error: !!errores.marca })}
              />
              <datalist id="marcas-sugeridas">
                {Object.keys(sugerencias).map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </Campo>
            <Campo label="Modelo *" error={errores.modelo?.message} className="flex-1">
              <input
                {...form.register("modelo", {
                  onBlur: (e) => {
                    const corregido = canonizarModelo(form.getValues("marca") ?? "", e.target.value);
                    if (corregido !== e.target.value) form.setValue("modelo", corregido);
                  },
                })}
                list="modelos-sugeridos"
                autoComplete="off"
                autoCapitalize="words"
                placeholder="Ej: Corolla"
                disabled={isPending}
                className={claseCampo({ error: !!errores.modelo })}
              />
              <datalist id="modelos-sugeridos">
                {modelosSugeridos.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </Campo>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Campo label="Año *" error={errores.anio?.message} className="flex-1">
              <input {...form.register("anio")} type="number" inputMode="numeric" placeholder="Ej: 2018" disabled={isPending} className={claseCampo({ error: !!errores.anio })} />
            </Campo>
            <Campo label="Kilómetros *" error={errores.kilometraje?.message} className="flex-1">
              <Controller
                control={form.control}
                name="kilometraje"
                render={({ field }) => (
                  <InputNumero
                    name={field.name}
                    value={field.value as string}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    inputRef={field.ref}
                    maxDigitos={7}
                    placeholder="Ej: 85.000"
                    disabled={isPending}
                    className={claseCampo({ error: !!errores.kilometraje })}
                  />
                )}
              />
            </Campo>
          </div>

          <Campo label="Versión (opcional)" error={errores.version?.message}>
            <input {...form.register("version")} placeholder="Ej: XEI 1.8 CVT" disabled={isPending} className={claseCampo({ error: !!errores.version })} />
          </Campo>

          <div className="flex flex-col sm:flex-row gap-4">
            <Campo label="Combustible (opcional)" error={errores.combustible?.message} className="flex-1">
              <select {...form.register("combustible")} disabled={isPending} className={claseCampo({ error: !!errores.combustible })}>
                <option value="">Sin especificar</option>
                <option value="NAFTA">Nafta</option>
                <option value="DIESEL">Diesel</option>
                <option value="GNC">GNC</option>
                <option value="HIBRIDO">Híbrido</option>
                <option value="ELECTRICO">Eléctrico</option>
              </select>
            </Campo>
            <Campo label="Transmisión (opcional)" error={errores.transmision?.message} className="flex-1">
              <select {...form.register("transmision")} disabled={isPending} className={claseCampo({ error: !!errores.transmision })}>
                <option value="">Sin especificar</option>
                <option value="MANUAL">Manual</option>
                <option value="AUTOMATICA">Automática</option>
                <option value="CVT">CVT</option>
              </select>
            </Campo>
          </div>
        </>
      )}

      {paso === 1 && (
        <>
          <Campo label="Estado general (opcional)" error={errores.observaciones?.message}>
            <textarea
              {...form.register("observaciones")}
              rows={4}
              placeholder="Service al día, único dueño, detalles de chapa o pintura, cubiertas…"
              disabled={isPending}
              className={`${claseCampo({ error: !!errores.observaciones })} resize-none`}
            />
          </Campo>

          <div className="flex flex-col sm:flex-row gap-4">
            <Campo label="Cuánto pretendés (opcional)" error={errores.precioPretendido?.message} className="flex-1">
              <Controller
                control={form.control}
                name="precioPretendido"
                render={({ field }) => (
                  <InputNumero
                    name={field.name}
                    value={field.value as string}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    inputRef={field.ref}
                    maxDigitos={10}
                    disabled={isPending}
                    className={claseCampo({ error: !!errores.precioPretendido })}
                  />
                )}
              />
            </Campo>
            <Campo label="Moneda" error={errores.moneda?.message} className="sm:w-32">
              <select {...form.register("moneda")} disabled={isPending} className={claseCampo({ error: !!errores.moneda })}>
                <option value="USD">USD</option>
                <option value="ARS">ARS</option>
              </select>
            </Campo>
          </div>

          {unidades.length > 0 && (
            <Campo label="¿Te interesa alguna unidad nuestra? (opcional)" error={errores.vehiculoInteresId?.message}>
              <select {...form.register("vehiculoInteresId")} disabled={isPending} className={claseCampo({ error: !!errores.vehiculoInteresId })}>
                <option value="">Ninguna por ahora</option>
                {unidades.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.marca} {u.modelo} {u.anio}
                  </option>
                ))}
              </select>
            </Campo>
          )}
        </>
      )}

      {paso === 2 && (
        <>
          <Campo label="Nombre y apellido *" error={errores.nombre?.message}>
            <input {...form.register("nombre")} autoComplete="name" disabled={isPending} className={claseCampo({ error: !!errores.nombre })} />
          </Campo>

          <div className="flex flex-col sm:flex-row gap-4">
            <Campo label="Email *" error={errores.email?.message} className="flex-1">
              <input {...form.register("email")} type="email" autoComplete="email" disabled={isPending} className={claseCampo({ error: !!errores.email })} />
            </Campo>
            <Campo label="Celular *" error={errores.telefono?.message} ayuda={AYUDA_TELEFONO} className="flex-1">
              <input {...form.register("telefono")} type="tel" autoComplete="tel" placeholder="Ej: 11 2345-6789" disabled={isPending} className={claseCampo({ error: !!errores.telefono })} />
            </Campo>
          </div>
        </>
      )}

      {error && (
        <div className="bg-red-50 text-[hsl(var(--primary))] text-[10px] font-black uppercase tracking-[0.1em] p-3 rounded border-l-4 border-[hsl(var(--primary))]">
          {error}
        </div>
      )}

      <div className="flex gap-3 mt-2">
        {paso > 0 && (
          <button
            type="button"
            onClick={() => irA(paso - 1)}
            disabled={isPending}
            className="flex items-center justify-center gap-2 px-5 py-4 text-[11px] font-black uppercase tracking-[0.1em] rounded bg-[hsl(var(--surface-low))] text-[hsl(var(--foreground))] hover:brightness-95 transition disabled:opacity-70"
          >
            <ArrowLeft size={16} />
            <span>Atrás</span>
          </button>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] py-4 text-[11px] font-black uppercase tracking-[0.1em] rounded hover:brightness-90 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Enviando…</span>
            </>
          ) : paso < ULTIMO_PASO ? (
            <>
              <span>Siguiente</span>
              <ArrowRight size={16} />
            </>
          ) : (
            <>
              <Send size={16} />
              <span>Pedir cotización</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
