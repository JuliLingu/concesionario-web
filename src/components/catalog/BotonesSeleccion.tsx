"use client";

import { GitCompareArrows, Heart } from "lucide-react";
import { useSeleccion } from "./useSeleccion";

/**
 * Guardar y comparar, los dos botones con los que el visitante arma sus listas
 * sin cuenta. Ver `useSeleccion`.
 *
 * Una vendida se puede quitar de guardados —si no, quedaría para siempre en la
 * lista— pero no se ofrece para comparar: ya no se puede comprar.
 */

interface Props {
  vehiculoId: string;
  vendido?: boolean;
}

/** Superpuestos sobre la foto de la tarjeta, arriba a la izquierda. */
export const AccionesTarjeta = ({ vehiculoId, vendido = false }: Props) => {
  const guardados = useSeleccion("guardados");
  const comparar = useSeleccion("comparar");
  const guardado = guardados.tiene(vehiculoId);
  const enComparacion = comparar.tiene(vehiculoId);
  const sinLugar = comparar.lleno && !enComparacion;

  const base =
    "w-9 h-9 flex items-center justify-center rounded-full backdrop-blur-sm shadow transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="absolute top-3 left-3 z-10 flex gap-1.5">
      <button
        type="button"
        onClick={() => guardados.alternar(vehiculoId)}
        aria-pressed={guardado}
        aria-label={guardado ? "Quitar de guardados" : "Guardar"}
        title={guardado ? "Quitar de guardados" : "Guardar"}
        className={`${base} ${guardado ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]" : "bg-white/85 text-[hsl(var(--foreground))] hover:bg-white"}`}
      >
        <Heart size={16} fill={guardado ? "currentColor" : "none"} />
      </button>
      {!vendido && (
        <button
          type="button"
          onClick={() => comparar.alternar(vehiculoId)}
          disabled={sinLugar}
          aria-pressed={enComparacion}
          aria-label={enComparacion ? "Quitar de la comparación" : "Comparar"}
          title={
            sinLugar
              ? `Ya elegiste ${comparar.maximo} para comparar`
              : enComparacion
                ? "Quitar de la comparación"
                : "Comparar"
          }
          className={`${base} ${enComparacion ? "bg-[hsl(var(--foreground))] text-[hsl(var(--background))]" : "bg-white/85 text-[hsl(var(--foreground))] hover:bg-white"}`}
        >
          <GitCompareArrows size={16} />
        </button>
      )}
    </div>
  );
};

/** En la ficha, debajo de los botones de contacto: con texto, no solo ícono. */
export const AccionesFicha = ({ vehiculoId, vendido = false }: Props) => {
  const guardados = useSeleccion("guardados");
  const comparar = useSeleccion("comparar");
  const guardado = guardados.tiene(vehiculoId);
  const enComparacion = comparar.tiene(vehiculoId);
  const sinLugar = comparar.lleno && !enComparacion;

  const base =
    "flex-1 py-2 px-3 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.1em] rounded border transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const activo = "bg-[hsl(var(--foreground))] text-[hsl(var(--background))] border-transparent";
  const inactivo =
    "border-black/10 text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]";

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => guardados.alternar(vehiculoId)}
        aria-pressed={guardado}
        className={`${base} ${guardado ? activo : inactivo}`}
      >
        <Heart size={14} fill={guardado ? "currentColor" : "none"} />
        {guardado ? "Guardado" : "Guardar"}
      </button>
      {!vendido && (
        <button
          type="button"
          onClick={() => comparar.alternar(vehiculoId)}
          disabled={sinLugar}
          aria-pressed={enComparacion}
          title={sinLugar ? `Ya elegiste ${comparar.maximo} para comparar` : undefined}
          className={`${base} ${enComparacion ? activo : inactivo}`}
        >
          <GitCompareArrows size={14} />
          {enComparacion ? "En comparación" : "Comparar"}
        </button>
      )}
    </div>
  );
};
