"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { CheckCircle2, MessageCircle, Send } from "lucide-react";
import { TasacionSchema, type TasacionData, type TasacionInput } from "@/schemas/tasacion";
import { createTasacion } from "@/actions/tasacion";
import { whatsappUrl } from "@/lib/whatsapp";

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
}

const CLASE_CAMPO =
  "bg-[hsl(var(--surface-low))] px-4 py-3 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]/20 w-full disabled:opacity-50";

/** Campo con su mensaje de error debajo. Evita repetir la clase larga en cada input. */
const Campo = ({
  error,
  children,
  className = "",
}: {
  error?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    {children}
    {error && <span className="text-xs font-bold text-red-500 px-1">{error}</span>}
  </div>
);

const Leyenda = ({ children }: { children: React.ReactNode }) => (
  <div className="text-[10px] font-black uppercase tracking-[0.1em] text-[hsl(var(--primary))] mt-2">
    {children}
  </div>
);

export const TasacionForm = ({ unidades, unidadInicial, telefono }: TasacionFormProps) => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  // Se guarda lo enviado para poder armar el mensaje de WhatsApp con el auto
  // concreto: el formulario ya no está montado cuando se muestra la confirmación.
  const [enviado, setEnviado] = useState<{ marca: string; modelo: string; anio: number }>();
  const [isPending, start] = useTransition();

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

  const errores = form.formState.errors;

  const onSubmit = (values: TasacionData) => {
    setError(undefined);

    start(async () => {
      const result = await createTasacion(values);
      if (result.error) setError(result.error);
      if (result.success) {
        setEnviado({ marca: values.marca, modelo: values.modelo, anio: values.anio });
        setSuccess(result.success);
      }
    });
  };

  if (success) {
    // El formulario no pide fotos a propósito (ver PLAN-TASACION.md § 2.4): la
    // subida pública abriría la cuenta de Cloudinary del cliente a cualquiera.
    // Este botón las encamina por WhatsApp, que es donde el vendedor trabaja.
    const auto = enviado ? `${enviado.marca} ${enviado.modelo} ${enviado.anio}` : "mi usado";
    const enlaceWhatsapp = whatsappUrl(
      telefono,
      `Hola, acabo de enviar la tasación de mi ${auto}. Te paso las fotos.`,
    );

    return (
      <div className="py-12 px-6 bg-[hsl(var(--card))] text-center flex flex-col items-center justify-center gap-4 rounded border border-black/5">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle2 size={28} className="text-green-600" />
        </div>
        <h3 className="font-black text-lg uppercase tracking-[-0.02em] text-[hsl(var(--foreground))] mt-2">
          ¡Tasación enviada!
        </h3>
        <p className="text-[hsl(var(--muted-foreground))] font-medium max-w-[340px] leading-relaxed">
          {success}
        </p>

        {enlaceWhatsapp && (
          <>
            <p className="text-sm text-[hsl(var(--muted-foreground))] font-medium max-w-[340px] leading-relaxed">
              Si nos pasás fotos por WhatsApp, la cotización sale más precisa.
            </p>
            <a
              href={enlaceWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 text-[11px] font-black uppercase tracking-[0.1em] rounded hover:brightness-95 transition"
            >
              <MessageCircle size={16} />
              Mandar fotos por WhatsApp
            </a>
          </>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Leyenda>Tu usado</Leyenda>

      <div className="flex flex-col sm:flex-row gap-4">
        <Campo error={errores.marca?.message} className="flex-1">
          <input {...form.register("marca")} placeholder="Marca *" disabled={isPending} className={CLASE_CAMPO} />
        </Campo>
        <Campo error={errores.modelo?.message} className="flex-1">
          <input {...form.register("modelo")} placeholder="Modelo *" disabled={isPending} className={CLASE_CAMPO} />
        </Campo>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Campo error={errores.anio?.message} className="flex-1">
          <input {...form.register("anio")} type="number" inputMode="numeric" placeholder="Año *" disabled={isPending} className={CLASE_CAMPO} />
        </Campo>
        <Campo error={errores.kilometraje?.message} className="flex-1">
          <input {...form.register("kilometraje")} type="number" inputMode="numeric" placeholder="Kilómetros *" disabled={isPending} className={CLASE_CAMPO} />
        </Campo>
      </div>

      <Campo error={errores.version?.message}>
        <input {...form.register("version")} placeholder="Versión (opcional). Ej: XEI 1.8 CVT" disabled={isPending} className={CLASE_CAMPO} />
      </Campo>

      <div className="flex flex-col sm:flex-row gap-4">
        <Campo error={errores.combustible?.message} className="flex-1">
          <select {...form.register("combustible")} disabled={isPending} className={CLASE_CAMPO}>
            <option value="">Combustible (opcional)</option>
            <option value="NAFTA">Nafta</option>
            <option value="DIESEL">Diesel</option>
            <option value="GNC">GNC</option>
            <option value="HIBRIDO">Híbrido</option>
            <option value="ELECTRICO">Eléctrico</option>
          </select>
        </Campo>
        <Campo error={errores.transmision?.message} className="flex-1">
          <select {...form.register("transmision")} disabled={isPending} className={CLASE_CAMPO}>
            <option value="">Transmisión (opcional)</option>
            <option value="MANUAL">Manual</option>
            <option value="AUTOMATICA">Automática</option>
            <option value="CVT">CVT</option>
          </select>
        </Campo>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Campo error={errores.precioPretendido?.message} className="flex-1">
          <input {...form.register("precioPretendido")} type="number" inputMode="numeric" placeholder="Cuánto pretendés (opcional)" disabled={isPending} className={CLASE_CAMPO} />
        </Campo>
        <Campo error={errores.moneda?.message} className="sm:w-32">
          <select {...form.register("moneda")} disabled={isPending} className={CLASE_CAMPO}>
            <option value="USD">USD</option>
            <option value="ARS">ARS</option>
          </select>
        </Campo>
      </div>

      <Campo error={errores.observaciones?.message}>
        <textarea
          {...form.register("observaciones")}
          rows={3}
          placeholder="Contanos el estado general, service al día, detalles a mencionar…"
          disabled={isPending}
          className={`${CLASE_CAMPO} resize-none`}
        />
      </Campo>

      {unidades.length > 0 && (
        <Campo error={errores.vehiculoInteresId?.message}>
          <select {...form.register("vehiculoInteresId")} disabled={isPending} className={CLASE_CAMPO}>
            <option value="">¿Te interesa alguna unidad nuestra? (opcional)</option>
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>
                {u.marca} {u.modelo} {u.anio}
              </option>
            ))}
          </select>
        </Campo>
      )}

      <Leyenda>Tus datos</Leyenda>

      <Campo error={errores.nombre?.message}>
        <input {...form.register("nombre")} placeholder="Nombre y apellido *" disabled={isPending} className={CLASE_CAMPO} />
      </Campo>

      <div className="flex flex-col sm:flex-row gap-4">
        <Campo error={errores.email?.message} className="flex-1">
          <input {...form.register("email")} type="email" placeholder="Email *" disabled={isPending} className={CLASE_CAMPO} />
        </Campo>
        <Campo error={errores.telefono?.message} className="flex-1">
          <input {...form.register("telefono")} placeholder="Teléfono *" disabled={isPending} className={CLASE_CAMPO} />
        </Campo>
      </div>

      {error && (
        <div className="bg-red-50 text-[hsl(var(--primary))] text-[10px] font-black uppercase tracking-[0.1em] p-3 rounded border-l-4 border-[hsl(var(--primary))]">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] py-4 text-[11px] font-black uppercase tracking-[0.1em] rounded hover:brightness-90 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
      >
        {isPending ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Enviando…</span>
          </>
        ) : (
          <>
            <Send size={16} />
            <span>Pedir cotización</span>
          </>
        )}
      </button>
    </form>
  );
};
