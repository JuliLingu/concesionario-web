"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { EstadoPublicacion } from "../../../generated/prisma";

/**
 * Visibilidad de una unidad, cambiable desde la fila del inventario.
 *
 * Hermano de `EstadoButton`, no una copia: aquel recorre los estados de una
 * bandeja de mensajes (pendiente → vista → respondida) y este los de una
 * publicación. Comparten la forma —una etiqueta y los siguientes pasos
 * posibles— pero ni el enum ni las transiciones tienen nada que ver, y unirlos
 * en un componente genérico dejaría dos tablas de configuración enfrentadas
 * dentro del mismo archivo para no repetir seis líneas de JSX.
 *
 * "Marcar vendida" es la razón de que exista: es la acción que escribe la fecha
 * de venta, y de esa fecha sale la rotación del stock.
 */

const PUBLICACION_CONFIG: Record<EstadoPublicacion, { label: string; colorClass: string }> = {
  PUBLICADO: { label: "Publicado", colorClass: "bg-green-100 text-green-700" },
  BORRADOR:  { label: "Borrador",  colorClass: "bg-red-50 text-[hsl(var(--primary))]" },
  PAUSADO:   { label: "Pausado",   colorClass: "bg-amber-100 text-amber-700" },
  VENDIDO:   { label: "Vendido",   colorClass: "bg-gray-100 text-gray-500" },
};

const SIGUIENTES: Record<EstadoPublicacion, { value: EstadoPublicacion; label: string }[]> = {
  BORRADOR:  [{ value: "PUBLICADO", label: "Publicar" }],
  PUBLICADO: [
    { value: "VENDIDO", label: "Marcar vendida" },
    { value: "PAUSADO", label: "Pausar" },
  ],
  PAUSADO: [
    { value: "PUBLICADO", label: "Publicar" },
    { value: "VENDIDO", label: "Marcar vendida" },
  ],
  // Deshacer una venta caída. La fecha de venta se borra sola al salir de
  // VENDIDO, así que el histórico no queda con una venta que no pasó.
  VENDIDO: [{ value: "PUBLICADO", label: "Volver a publicar" }],
};

interface PublicacionButtonProps {
  vehiculoId: string;
  estadoActual: EstadoPublicacion;
  /**
   * Server action que persiste el cambio. Se ignora lo que devuelve: la
   * pantalla se rearma con `router.refresh()`, que trae el estado real.
   */
  cambiarPublicacionAction: (id: string, estado: EstadoPublicacion) => Promise<unknown>;
}

export const PublicacionButton = ({
  vehiculoId,
  estadoActual,
  cambiarPublicacionAction,
}: PublicacionButtonProps) => {
  const [isPending, start] = useTransition();
  const router = useRouter();

  const cambiar = (estado: EstadoPublicacion) => {
    start(async () => {
      await cambiarPublicacionAction(vehiculoId, estado);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <span
        className={`text-[10px] font-black uppercase tracking-widest inline-block px-2 py-1 rounded ${PUBLICACION_CONFIG[estadoActual].colorClass}`}
      >
        {PUBLICACION_CONFIG[estadoActual].label}
      </span>
      <div className="flex flex-wrap gap-2">
        {SIGUIENTES[estadoActual].map((siguiente) => (
          <button
            key={siguiente.value}
            onClick={() => cambiar(siguiente.value)}
            disabled={isPending}
            className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))] underline underline-offset-2 hover:text-[hsl(var(--primary))] p-0 disabled:opacity-50"
          >
            {isPending ? "..." : siguiente.label}
          </button>
        ))}
      </div>
    </div>
  );
};
