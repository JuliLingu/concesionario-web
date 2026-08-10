import { Moneda } from "../../generated/prisma";

/**
 * El precio de un vehículo se guarda en la moneda que eligió el administrador
 * (`precio` + `moneda`), pero en la web siempre se muestra en pesos argentinos.
 * La conversión usa la cotización cargada en Configuración.
 */

const formatoArs = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

const formatoUsd = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const formatoNumero = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 0,
});

/** Ej: 15000000 → "$ 15.000.000" */
export function formatArs(valor: number): string {
  return formatoArs.format(valor);
}

/** Ej: 20000 → "US$ 20.000" */
export function formatUsd(valor: number): string {
  return formatoUsd.format(valor);
}

/** Formato argentino sin símbolo, para inputs. Ej: 15000000 → "15.000.000" */
export function formatNumeroAr(valor: number): string {
  return formatoNumero.format(valor);
}

/** Lee un número escrito con separadores de miles argentinos ("15.000.000"). */
export function parseNumeroAr(texto: string): number {
  const soloDigitos = texto.replace(/\D/g, "");
  return soloDigitos ? Number(soloDigitos) : 0;
}

/**
 * Precio del vehículo expresado en pesos.
 * Devuelve null cuando está en dólares y todavía no se cargó la cotización:
 * en ese caso no hay forma de mostrar un importe en pesos que sea real.
 */
export function precioEnPesos(
  precio: number,
  moneda: Moneda,
  cotizacionDolar?: number | null,
): number | null {
  if (moneda === Moneda.ARS) return precio;
  if (!cotizacionDolar || cotizacionDolar <= 0) return null;
  return precio * cotizacionDolar;
}

/**
 * Texto listo para mostrar en pantalla, siempre en pesos.
 * Si el precio está en dólares y falta la cotización, se muestra en dólares
 * para no inventar un valor en pesos.
 */
export function formatPrecio(
  precio: number,
  moneda: Moneda,
  cotizacionDolar?: number | null,
): string {
  const pesos = precioEnPesos(precio, moneda, cotizacionDolar);
  return pesos === null ? formatUsd(precio) : formatArs(pesos);
}

/** Importe tal cual lo cargó el administrador, con su moneda. Uso interno del panel. */
export function formatPrecioOriginal(precio: number, moneda: Moneda): string {
  return moneda === Moneda.ARS ? formatArs(precio) : formatUsd(precio);
}
