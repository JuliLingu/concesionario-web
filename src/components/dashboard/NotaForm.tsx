"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { agregarNota } from "@/actions/contactos";

/**
 * Formulario de nota interna en la ficha de un contacto. Al guardar se vacía y
 * la lista de notas se rearma desde el servidor con `router.refresh()`.
 */
export const NotaForm = ({ contactoId }: { contactoId: string }) => {
  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, start] = useTransition();
  const router = useRouter();

  const guardar = (evento: React.FormEvent) => {
    evento.preventDefault();
    start(async () => {
      const resultado = await agregarNota({ contactoId, texto });
      if ("error" in resultado && resultado.error) {
        setError(resultado.error);
        return;
      }
      setError(null);
      setTexto("");
      router.refresh();
    });
  };

  return (
    <form onSubmit={guardar} className="flex flex-col gap-2">
      <label htmlFor="nota" className="sr-only">
        Nueva nota
      </label>
      <textarea
        id="nota"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={3}
        maxLength={2000}
        placeholder="Ej: llamé, no atendió. Volver a probar el jueves a la tarde."
        className="w-full rounded border border-[#e5e7eb] bg-white p-3 text-sm focus:outline-none focus:border-[hsl(var(--primary))]"
      />
      {error && <p className="text-xs font-bold text-[hsl(var(--primary))]">{error}</p>}
      <button
        type="submit"
        disabled={guardando || texto.trim().length === 0}
        className="self-end bg-[hsl(var(--foreground))] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded hover:bg-[hsl(var(--primary))] transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {guardando ? "Guardando…" : "Guardar nota"}
      </button>
    </form>
  );
};
