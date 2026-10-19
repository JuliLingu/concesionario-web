"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { ConsultaSchema, type ConsultaData, type ConsultaInput } from "@/schemas/consulta";
import { createConsulta } from "@/actions/consulta";
import { Send, CheckCircle2 } from "lucide-react";
import { AYUDA_TELEFONO, Campo, claseCampo } from "@/components/forms/Campo";
import { Opciones } from "@/components/forms/Opciones";
import { FRANJAS_HORARIAS, MEDIOS_CONTACTO } from "@/lib/preferencia-contacto";

interface ContactFormProps {
  vehiculoId?: string;
  vehiculoNombre?: string;
}

export const ContactForm = ({ vehiculoId, vehiculoNombre }: ContactFormProps) => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, start] = useTransition();

  const form = useForm<ConsultaInput, unknown, ConsultaData>({
    resolver: zodResolver(ConsultaSchema),
    defaultValues: {
      nombre: "",
      email: "",
      telefono: "",
      // WhatsApp de entrada: es por donde se cierra la mayoría de las ventas.
      medioContacto: "WHATSAPP",
      franjaHoraria: "CUALQUIERA",
      mensaje: vehiculoNombre ? `Hola, me interesa el ${vehiculoNombre}. ` : "",
      vehiculoId: vehiculoId || "",
    },
  });

  const errores = form.formState.errors;
  const medio = useWatch({ control: form.control, name: "medioContacto" });

  const etiquetaTelefono =
    medio === "WHATSAPP" ? "Celular con WhatsApp *" : medio === "LLAMADA" ? "Teléfono *" : "Teléfono (opcional)";

  const onSubmit = (values: ConsultaData) => {
    setError(undefined);
    setSuccess(undefined);

    start(async () => {
      const result = await createConsulta(values);
      if (result.error) setError(result.error);
      if (result.success) {
        setSuccess(result.success);
        form.reset();
      }
    });
  };

  if (success) {
    return (
      <div className="py-12 px-6 bg-[hsl(var(--card))] text-center flex flex-col items-center justify-center gap-4 rounded border border-black/5">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle2 size={28} className="text-green-600" />
        </div>
        <h3 className="font-black text-lg uppercase tracking-[-0.02em] text-[hsl(var(--foreground))] mt-2">
          ¡Consulta enviada!
        </h3>
        <p className="text-[hsl(var(--muted-foreground))] font-medium max-w-[300px] leading-relaxed">
          {success}
        </p>
        <button
          onClick={() => setSuccess(undefined)}
          className="text-[10px] font-black uppercase tracking-[0.1em] text-[hsl(var(--primary))] hover:text-[hsl(var(--foreground))] transition-colors mt-2"
        >
          Enviar otra consulta
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Campo label="Nombre *" error={errores.nombre?.message} className="flex-1">
          <input
            {...form.register("nombre")}
            autoComplete="name"
            disabled={isPending}
            className={claseCampo({ error: !!errores.nombre, fondo: "input" })}
          />
        </Campo>

        <Campo label="Email *" error={errores.email?.message} className="flex-1">
          <input
            {...form.register("email")}
            type="email"
            autoComplete="email"
            disabled={isPending}
            className={claseCampo({ error: !!errores.email, fondo: "input" })}
          />
        </Campo>
      </div>

      <Opciones
        leyenda="¿Cómo preferís que te contactemos?"
        opciones={MEDIOS_CONTACTO}
        registro={form.register("medioContacto")}
        error={errores.medioContacto?.message}
        disabled={isPending}
      />

      <Campo label={etiquetaTelefono} error={errores.telefono?.message} ayuda={AYUDA_TELEFONO}>
        <input
          {...form.register("telefono")}
          type="tel"
          autoComplete="tel"
          placeholder="Ej: 11 2345-6789"
          disabled={isPending}
          className={claseCampo({ error: !!errores.telefono, fondo: "input" })}
        />
      </Campo>

      {/* Con email la franja no aplica: el correo se lee cuando se puede. */}
      {medio !== "EMAIL" && (
        <Opciones
          leyenda="¿En qué horario?"
          opciones={FRANJAS_HORARIAS}
          registro={form.register("franjaHoraria")}
          error={errores.franjaHoraria?.message}
          disabled={isPending}
        />
      )}

      <Campo label="Mensaje (opcional)" error={errores.mensaje?.message}>
        <textarea
          {...form.register("mensaje")}
          disabled={isPending}
          rows={4}
          className={`${claseCampo({ error: !!errores.mensaje, fondo: "input" })} resize-none`}
        />
      </Campo>

      {error && (
        <div className="bg-red-50 text-[hsl(var(--primary))] text-[10px] font-black uppercase tracking-[0.1em] p-3 rounded border-l-4 border-[hsl(var(--primary))]">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-[hsl(var(--foreground))] text-[hsl(var(--background))] py-4 text-[11px] font-black uppercase tracking-[0.1em] rounded hover:bg-[hsl(var(--primary))] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Enviando...</span>
          </>
        ) : (
          <>
            <Send size={16} />
            <span>Enviar Consulta</span>
          </>
        )}
      </button>
    </form>
  );
};
