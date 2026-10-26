"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GitCompareArrows, X } from "lucide-react";
import { MINIMO_COMPARAR, urlConIds } from "@/lib/seleccion";
import { useSeleccion } from "./useSeleccion";

/** Rutas donde la bandeja sobra: el panel, la sesión y el propio comparador. */
const SIN_BANDEJA = ["/dashboard", "/login", "/register", "/comparar"];

/**
 * Pastilla flotante con las unidades elegidas para comparar.
 *
 * Es lo que hace visible la selección mientras se recorre el catálogo: sin
 * esto, tocar "Comparar" en una tarjeta no tendría ninguna consecuencia a la
 * vista hasta que el visitante adivine dónde ir.
 */
export const BandejaComparar = () => {
  const pathname = usePathname();
  const { ids, reemplazar, maximo } = useSeleccion("comparar");

  if (ids.length === 0 || SIN_BANDEJA.some((ruta) => pathname.startsWith(ruta))) return null;

  // La ficha tiene en mobile una barra fija de WhatsApp abajo: la bandeja va
  // encima en vez de taparla.
  const enFicha = pathname.startsWith("/catalogo/");
  const alcanza = ids.length >= MINIMO_COMPARAR;

  return (
    <div
      className={`fixed inset-x-0 z-40 flex justify-center px-4 pointer-events-none ${enFicha ? "bottom-24 lg:bottom-4" : "bottom-4"}`}
    >
      <div className="pointer-events-auto flex items-center gap-2 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] rounded-full pl-4 pr-1.5 py-1.5 shadow-[0_12px_40px_rgba(26,28,30,0.3)] animate-fade-in">
        <GitCompareArrows size={16} aria-hidden />
        <span className="text-xs font-bold whitespace-nowrap tabular-nums">
          {alcanza
            ? `${ids.length} de ${maximo} elegidas`
            : "Elegí otra para comparar"}
        </span>
        {alcanza && (
          <Link
            href={urlConIds("/comparar", ids)}
            className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-[11px] font-black uppercase tracking-[0.1em] px-4 py-2 rounded-full hover:brightness-90 transition"
          >
            Comparar
          </Link>
        )}
        <button
          type="button"
          onClick={() => reemplazar([])}
          aria-label="Vaciar la comparación"
          title="Vaciar la comparación"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/15 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
