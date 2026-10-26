"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useSeleccion } from "@/components/catalog/useSeleccion";

/**
 * Acceso a "Mis guardados" desde el encabezado, con cuántas hay.
 *
 * El número aparece recién después de hidratar (ver `useSeleccion`): en el HTML
 * del servidor no se sabe qué guardó cada visitante.
 */
export const EnlaceGuardados = ({
  className,
  onClick,
  conTexto = false,
}: {
  className?: string;
  onClick?: () => void;
  /** En el menú mobile va con la palabra; en escritorio alcanza el ícono. */
  conTexto?: boolean;
}) => {
  const { ids } = useSeleccion("guardados");
  const cantidad = ids.length;

  return (
    <Link
      href="/guardados"
      onClick={onClick}
      aria-label={cantidad > 0 ? `Mis guardados (${cantidad})` : "Mis guardados"}
      title="Mis guardados"
      className={`relative inline-flex items-center gap-2 ${className ?? ""}`}
    >
      <Heart size={18} fill={cantidad > 0 ? "currentColor" : "none"} aria-hidden />
      {conTexto && <span>Mis guardados</span>}
      {cantidad > 0 && (
        <span
          className={`bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-[9px] font-black rounded-full min-w-4 h-4 px-1 flex items-center justify-center tabular-nums ${conTexto ? "" : "absolute -top-1.5 -right-2"}`}
        >
          {cantidad}
        </span>
      )}
    </Link>
  );
};
