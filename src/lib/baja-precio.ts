/**
 * "Bajó USD 1.000": cuándo se dice y cuándo se deja de decir.
 *
 * Anunciar una baja es mostrar un precio anterior, y eso es una promesa al
 * comprador: tiene que ser cierta, reciente y de un monto que valga la pena
 * nombrar. Las reglas viven acá, sin base de datos, para poder leerlas y
 * probarlas. Quien escribe es `updateVehicle`; quien lee, la tarjeta y la ficha.
 *
 * Qué se guarda en la unidad (`precioAnterior`, `precioBajoAt`):
 *  - Una baja anota el precio de antes y la fecha.
 *  - Bajas seguidas dentro de la ventana se acumulan contra el primer precio:
 *    quien vio el auto a 20.000 y lo ve a 18.500 después de dos bajas de 750
 *    lo que quiere saber es que bajó 1.500.
 *  - Una suba, o un cambio de moneda, borra la baja: dejó de ser cierta, o ya
 *    no se puede comparar.
 */
import type { Moneda } from "../../generated/prisma";

/** Días durante los que una baja se anuncia. Pasado eso, el precio es el precio. */
export const DIAS_BAJA_VISIBLE = 30;

/**
 * Baja mínima para anunciarla: una proporción del precio y un monto absoluto
 * por moneda. "Bajó USD 50" sobre un auto de 20.000 es ruido, y uno de pesos
 * tiene que bajar bastante más que uno de dólares para decir lo mismo.
 */
export const BAJA_MINIMA_RELATIVA = 0.01;
export const BAJA_MINIMA: Record<Moneda, number> = { USD: 200, ARS: 200_000 };

const UN_DIA_MS = 24 * 60 * 60 * 1000;

export interface SeguimientoDeBaja {
  precioAnterior: number | null;
  precioBajoAt: Date | null;
}

export interface PrecioActual extends SeguimientoDeBaja {
  precio: number;
  moneda: Moneda;
}

function dentroDeLaVentana(fecha: Date | null, ahora: Date): fecha is Date {
  // `instanceof` y no `!== null`: ver el `== null` de `conPreciosEnNumero`.
  return fecha instanceof Date && ahora.getTime() - fecha.getTime() < DIAS_BAJA_VISIBLE * UN_DIA_MS;
}

/** Si el precio o la moneda cambian: es lo que se registra en el historial. */
export function cambioElPrecio(
  actual: { precio: number; moneda: Moneda },
  nuevo: { precio: number; moneda: Moneda },
): boolean {
  return actual.precio !== nuevo.precio || actual.moneda !== nuevo.moneda;
}

/** Cómo queda el seguimiento de la baja después de guardar un precio nuevo. */
export function seguimientoTrasCambio(
  actual: PrecioActual,
  nuevo: { precio: number; moneda: Moneda },
  ahora: Date = new Date(),
): SeguimientoDeBaja {
  const sinBaja = { precioAnterior: null, precioBajoAt: null };

  if (nuevo.moneda !== actual.moneda) return sinBaja;
  if (nuevo.precio > actual.precio) return sinBaja;
  if (nuevo.precio === actual.precio) {
    return { precioAnterior: actual.precioAnterior, precioBajoAt: actual.precioBajoAt };
  }

  // Bajó. Si venía de otra baja todavía a la vista, se cuenta desde el precio
  // de antes de aquella; si no, desde el que tenía hasta ahora.
  const venia =
    actual.precioAnterior !== null &&
    actual.precioAnterior > actual.precio &&
    dentroDeLaVentana(actual.precioBajoAt, ahora);

  return {
    precioAnterior: venia ? actual.precioAnterior : actual.precio,
    precioBajoAt: ahora,
  };
}

/**
 * Cuánto bajó, si corresponde anunciarlo; null si no. Una vendida no anuncia
 * nada: ya no se puede comprar a ningún precio.
 */
export function bajaVigente(
  v: PrecioActual & { publicacion: string },
  ahora: Date = new Date(),
): number | null {
  if (v.publicacion === "VENDIDO") return null;
  if (v.precioAnterior === null || !dentroDeLaVentana(v.precioBajoAt, ahora)) return null;

  const baja = v.precioAnterior - v.precio;
  if (baja < BAJA_MINIMA[v.moneda]) return null;
  if (baja / v.precioAnterior < BAJA_MINIMA_RELATIVA) return null;
  return baja;
}
