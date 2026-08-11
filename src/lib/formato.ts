/**
 * Formateadores de fecha del panel.
 *
 * Los objetos `Intl` se construyen una sola vez a nivel de módulo: crearlos
 * dentro de la función significaba armar uno nuevo por cada fila de cada tabla,
 * que es la parte cara de `Intl`. Mismo criterio que en `lib/precio.ts`.
 */

const fechaCorta = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const fechaLarga = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** Ej: "10 ago, 14:30". Para listados compactos. */
export function formatFechaCorta(fecha: string | Date): string {
  return fechaCorta.format(new Date(fecha));
}

/** Ej: "10 ago 2026, 14:30". Para tablas donde importa el año. */
export function formatFechaLarga(fecha: string | Date): string {
  return fechaLarga.format(new Date(fecha));
}
