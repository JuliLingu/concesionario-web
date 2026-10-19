"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useTransition } from "react";
import { SolicitudFinanciacionSchema } from "@/schemas/financiacion";
import { createSolicitud } from "@/actions/financiacion";
import { Send, CheckCircle2 } from "lucide-react";
import { AYUDA_TELEFONO, Campo, claseCampo } from "@/components/forms/Campo";

interface FinancingFormProps {
  vehiculoId: string;
  anticipo: number;
  cuotas: number;
}

export const FinancingForm = ({ vehiculoId, anticipo, cuotas }: FinancingFormProps) => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, start] = useTransition();

  const form = useForm<z.input<typeof SolicitudFinanciacionSchema>, unknown,z.infer<typeof SolicitudFinanciacionSchema>>({
    resolver: zodResolver(SolicitudFinanciacionSchema),
    defaultValues: {
      vehiculoId,
      anticipo,
      cuotas,
      nombre: "",
      apellido: "",
      dni: "",
      email: "",
      telefono: "",
      ingresos: undefined,
      mensaje: "",
    },
  });

  const errores = form.formState.errors;

  const onSubmit = (values: z.infer<typeof SolicitudFinanciacionSchema>) => {
    setError(undefined);
    setSuccess(undefined);

    start(async () => {
      // Re-assign the dynamic values just in case they changed in the parent before submit
      const result = await createSolicitud({
        ...values,
        anticipo,
        cuotas,
      });
      if (result.error) setError(result.error);
      if (result.success) {
        setSuccess(result.success);
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
          ¡Solicitud enviada!
        </h3>
        <p className="text-[hsl(var(--muted-foreground))] font-medium max-w-[300px] leading-relaxed">
          {success}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Campo label="Nombre *" error={errores.nombre?.message} className="flex-1">
          <input
            {...form.register("nombre")}
            autoComplete="given-name"
            disabled={isPending}
            className={claseCampo({ error: !!errores.nombre })}
          />
        </Campo>
        <Campo label="Apellido *" error={errores.apellido?.message} className="flex-1">
          <input
            {...form.register("apellido")}
            autoComplete="family-name"
            disabled={isPending}
            className={claseCampo({ error: !!errores.apellido })}
          />
        </Campo>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Campo label="DNI *" error={errores.dni?.message} className="flex-1">
          <input
            {...form.register("dni")}
            inputMode="numeric"
            autoComplete="off"
            placeholder="Sin puntos"
            disabled={isPending}
            className={claseCampo({ error: !!errores.dni })}
          />
        </Campo>
        <Campo label="Teléfono *" error={errores.telefono?.message} ayuda={AYUDA_TELEFONO} className="flex-1">
          <input
            {...form.register("telefono")}
            type="tel"
            autoComplete="tel"
            placeholder="Ej: 11 2345-6789"
            disabled={isPending}
            className={claseCampo({ error: !!errores.telefono })}
          />
        </Campo>
      </div>

      <Campo label="Email *" error={errores.email?.message}>
        <input
          {...form.register("email")}
          type="email"
          autoComplete="email"
          disabled={isPending}
          className={claseCampo({ error: !!errores.email })}
        />
      </Campo>

      <Campo label="Ingresos demostrables (opcional)" error={errores.ingresos?.message}>
        <input
          {...form.register("ingresos")}
          type="number"
          inputMode="numeric"
          disabled={isPending}
          className={claseCampo({ error: !!errores.ingresos })}
        />
      </Campo>

      <Campo label="Comentarios (opcional)" error={errores.mensaje?.message}>
        <textarea
          {...form.register("mensaje")}
          disabled={isPending}
          rows={3}
          className={`${claseCampo({ error: !!errores.mensaje })} resize-none`}
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
        className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] py-4 text-[11px] font-black uppercase tracking-[0.1em] rounded hover:brightness-90 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
      >
        {isPending ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Enviando Solicitud...</span>
          </>
        ) : (
          <>
            <Send size={16} />
            <span>Solicitar Pre-Aprobación</span>
          </>
        )}
      </button>
    </form>
  );
};
