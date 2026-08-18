"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { SortOption } from "@/lib/catalogo";

/**
 * Desplegable de orden del catálogo.
 *
 * Antes eran dos piezas: la página renderizaba un `<select>` con un `onChange`
 * vacío y un segundo componente lo buscaba por `document.getElementById` para
 * engancharle el listener. Un solo componente controlado hace lo mismo sin el
 * acoplamiento por id ni el aviso de React por el campo controlado sin handler.
 */
export const SortSelect = ({
  currentSort,
  opciones,
}: {
  currentSort: string;
  /** Las arma la página: con los precios ocultos vienen sin los dos órdenes por importe. */
  opciones: readonly SortOption[];
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const onChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    // Al cambiar el orden la paginación deja de tener sentido: se vuelve a la 1.
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  return (
    <div className="flex items-center gap-2 bg-[hsl(var(--card))] p-1 border border-black/5 rounded">
      <select
        aria-label="Ordenar resultados"
        disabled={isPending}
        className="bg-transparent text-[hsl(var(--foreground))] text-[11px] font-black uppercase tracking-[0.1em] border-none border-r border-black/10 pr-2 mr-1 outline-none cursor-pointer focus:ring-0 disabled:opacity-60"
        value={currentSort}
        onChange={(e) => onChange(e.target.value)}
      >
        {opciones.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
};
