"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useTransition } from "react";
import { ConsultaSchema } from "@/schemas/consulta";
import { createConsulta } from "@/actions/consulta";
import { Send, CheckCircle2 } from "lucide-react";

interface ContactFormProps {
  vehiculoId?: string;
  vehiculoNombre?: string;
}

export const ContactForm = ({ vehiculoId, vehiculoNombre }: ContactFormProps) => {
  const [error, setError]     = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, start]    = useTransition();

  const form = useForm<z.infer<typeof ConsultaSchema>>({
    resolver: zodResolver(ConsultaSchema),
    defaultValues: {
      nombre:     "",
      email:      "",
      telefono:   "",
      mensaje:    vehiculoNombre ? `Hola, me interesa el ${vehiculoNombre}. ` : "",
      vehiculoId: vehiculoId || "",
    },
  });

  const onSubmit = (values: z.infer<typeof ConsultaSchema>) => {
    setError(undefined);
    setSuccess(undefined);

    start(async () => {
      const result = await createConsulta(values);
      if (result.error)   setError(result.error);
      if (result.success) {
        setSuccess(result.success);
        form.reset();
      }
    });
  };

  // If success, show confirmation state
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 bg-surface-low text-center gap-4">
        <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle2 size={28} className="text-green-600" />
        </div>
        <h3 className="font-black text-foreground text-lg font-space uppercase tracking-tight">
          ¡Consulta enviada!
        </h3>
        <p className="text-sm text-foreground/60 font-medium max-w-sm leading-relaxed">
          {success}
        </p>
        <button
          onClick={() => setSuccess(undefined)}
          className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline mt-2"
        >
          Enviar otra consulta
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Nombre + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
            Nombre *
          </label>
          <input
            {...form.register("nombre")}
            placeholder="Tu nombre"
            disabled={isPending}
            className="bg-surface-low px-4 py-3 outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium text-sm"
          />
          {form.formState.errors.nombre && (
            <span className="text-primary text-[10px] font-black uppercase">
              {form.formState.errors.nombre.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
            Email *
          </label>
          <input
            {...form.register("email")}
            type="email"
            placeholder="tu@email.com"
            disabled={isPending}
            className="bg-surface-low px-4 py-3 outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium text-sm"
          />
          {form.formState.errors.email && (
            <span className="text-primary text-[10px] font-black uppercase">
              {form.formState.errors.email.message}
            </span>
          )}
        </div>
      </div>

      {/* Teléfono */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
          Teléfono <span className="text-foreground/20 normal-case font-medium">(opcional)</span>
        </label>
        <input
          {...form.register("telefono")}
          placeholder="+54 223 421-4414"
          disabled={isPending}
          className="bg-surface-low px-4 py-3 outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium text-sm"
        />
      </div>

      {/* Mensaje */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
          Mensaje <span className="text-foreground/20 normal-case font-medium">(opcional)</span>
        </label>
        <textarea
          {...form.register("mensaje")}
          rows={4}
          disabled={isPending}
          placeholder="¿Tenés alguna pregunta específica sobre el vehículo?"
          className="bg-surface-low px-4 py-3 outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium text-sm resize-none"
        />
      </div>

      {/* Hidden vehiculoId */}
      <input type="hidden" {...form.register("vehiculoId")} />

      {error && (
        <div className="bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest p-3">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-foreground text-white py-4 text-[11px] font-black uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isPending ? (
          <>
            <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Send size={13} />
            Enviar Consulta
          </>
        )}
      </button>
    </form>
  );
};
