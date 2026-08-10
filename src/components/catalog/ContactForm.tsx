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
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, start] = useTransition();

  const form = useForm<z.infer<typeof ConsultaSchema>>({
    resolver: zodResolver(ConsultaSchema),
    defaultValues: {
      nombre: "",
      email: "",
      telefono: "",
      mensaje: vehiculoNombre ? `Hola, me interesa el ${vehiculoNombre}. ` : "",
      vehiculoId: vehiculoId || "",
    },
  });

  const onSubmit = (values: z.infer<typeof ConsultaSchema>) => {
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
        <div className="flex-1 flex flex-col gap-1">
          <input
            {...form.register("nombre")}
            placeholder="Nombre *"
            disabled={isPending}
            className={`bg-[hsl(var(--input))] px-4 py-3 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]/20 w-full disabled:opacity-50 ${form.formState.errors.nombre ? 'ring-1 ring-red-500 bg-red-50' : ''}`}
          />
          {form.formState.errors.nombre && (
            <span className="text-xs font-bold text-red-500 px-1">{form.formState.errors.nombre.message}</span>
          )}
        </div>

        <div className="flex-1 flex flex-col gap-1">
          <input
            {...form.register("email")}
            type="email"
            placeholder="Email *"
            disabled={isPending}
            className={`bg-[hsl(var(--input))] px-4 py-3 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]/20 w-full disabled:opacity-50 ${form.formState.errors.email ? 'ring-1 ring-red-500 bg-red-50' : ''}`}
          />
          {form.formState.errors.email && (
            <span className="text-xs font-bold text-red-500 px-1">{form.formState.errors.email.message}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <input
          {...form.register("telefono")}
          placeholder="Teléfono (opcional)"
          disabled={isPending}
          className={`bg-[hsl(var(--input))] px-4 py-3 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]/20 w-full disabled:opacity-50`}
        />
      </div>

      <div className="flex flex-col gap-1">
        <textarea
          {...form.register("mensaje")}
          placeholder="Mensaje (opcional)"
          disabled={isPending}
          rows={4}
          className={`bg-[hsl(var(--input))] px-4 py-3 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]/20 w-full resize-none disabled:opacity-50`}
        />
      </div>

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
