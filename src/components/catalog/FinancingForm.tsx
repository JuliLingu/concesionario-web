"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useTransition } from "react";
import { SolicitudFinanciacionSchema } from "@/schemas/financiacion";
import { createSolicitud } from "@/actions/financiacion";
import { Send, CheckCircle2 } from "lucide-react";

interface FinancingFormProps {
  vehiculoId: string;
  anticipo: number;
  cuotas: number;
}

export const FinancingForm = ({ vehiculoId, anticipo, cuotas }: FinancingFormProps) => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, start] = useTransition();

  const form = useForm<z.input<typeof SolicitudFinanciacionSchema>, any, z.infer<typeof SolicitudFinanciacionSchema>>({
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
      <div className="py-12 px-6 bg-white text-center flex flex-col items-center justify-center gap-4 rounded border border-black/5">
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
        <div className="flex-1 flex flex-col gap-1">
          <input
            {...form.register("nombre")}
            placeholder="Nombre *"
            disabled={isPending}
            className={`bg-[hsl(var(--surface-low))] px-4 py-3 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#b5000b]/20 w-full disabled:opacity-50 ${form.formState.errors.nombre ? 'ring-1 ring-red-500 bg-red-50' : ''}`}
          />
          {form.formState.errors.nombre && (
            <span className="text-xs font-bold text-red-500 px-1">{form.formState.errors.nombre.message}</span>
          )}
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <input
            {...form.register("apellido")}
            placeholder="Apellido *"
            disabled={isPending}
            className={`bg-[hsl(var(--surface-low))] px-4 py-3 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#b5000b]/20 w-full disabled:opacity-50 ${form.formState.errors.apellido ? 'ring-1 ring-red-500 bg-red-50' : ''}`}
          />
          {form.formState.errors.apellido && (
            <span className="text-xs font-bold text-red-500 px-1">{form.formState.errors.apellido.message}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex flex-col gap-1">
          <input
            {...form.register("dni")}
            placeholder="DNI *"
            disabled={isPending}
            className={`bg-[hsl(var(--surface-low))] px-4 py-3 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#b5000b]/20 w-full disabled:opacity-50 ${form.formState.errors.dni ? 'ring-1 ring-red-500 bg-red-50' : ''}`}
          />
          {form.formState.errors.dni && (
            <span className="text-xs font-bold text-red-500 px-1">{form.formState.errors.dni.message}</span>
          )}
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <input
            {...form.register("telefono")}
            placeholder="Teléfono *"
            disabled={isPending}
            className={`bg-[hsl(var(--surface-low))] px-4 py-3 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#b5000b]/20 w-full disabled:opacity-50 ${form.formState.errors.telefono ? 'ring-1 ring-red-500 bg-red-50' : ''}`}
          />
          {form.formState.errors.telefono && (
            <span className="text-xs font-bold text-red-500 px-1">{form.formState.errors.telefono.message}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <input
          {...form.register("email")}
          type="email"
          placeholder="Email *"
          disabled={isPending}
          className={`bg-[hsl(var(--surface-low))] px-4 py-3 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#b5000b]/20 w-full disabled:opacity-50 ${form.formState.errors.email ? 'ring-1 ring-red-500 bg-red-50' : ''}`}
        />
        {form.formState.errors.email && (
          <span className="text-xs font-bold text-red-500 px-1">{form.formState.errors.email.message}</span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <input
          {...form.register("ingresos")}
          type="number"
          placeholder="Ingresos demostrables (opcional)"
          disabled={isPending}
          className={`bg-[hsl(var(--surface-low))] px-4 py-3 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#b5000b]/20 w-full disabled:opacity-50 ${form.formState.errors.ingresos ? 'ring-1 ring-red-500 bg-red-50' : ''}`}
        />
        {form.formState.errors.ingresos && (
          <span className="text-xs font-bold text-red-500 px-1">{form.formState.errors.ingresos.message}</span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <textarea
          {...form.register("mensaje")}
          placeholder="Comentarios adicionales"
          disabled={isPending}
          rows={3}
          className={`bg-[hsl(var(--surface-low))] px-4 py-3 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#b5000b]/20 w-full resize-none disabled:opacity-50`}
        />
      </div>

      {error && (
        <div className="bg-red-50 text-[#b5000b] text-[10px] font-black uppercase tracking-[0.1em] p-3 rounded border-l-4 border-[#b5000b]">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#b5000b] text-white py-4 text-[11px] font-black uppercase tracking-[0.1em] rounded hover:bg-red-800 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
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
