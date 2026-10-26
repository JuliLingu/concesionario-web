/**
 * Qué unidades se ofrecen como "similares" al pie de una ficha.
 *
 * Hoy la ficha termina en el formulario de consulta: quien no se convenció con
 * ese auto no tiene a dónde seguir más que volver al catálogo y empezar de
 * nuevo. Lo que se le ofrece acá es lo que más se parece a lo que ya estaba
 * mirando, con dos criterios en este orden:
 *
 *  1. Misma categoría, de la más cercana en precio a la más lejana. Quien mira
 *     una SUV quiere otra SUV aunque cueste bastante más o menos.
 *  2. Si la categoría no alcanza, otras categorías, pero solo dentro de la
 *     banda de precio: una pickup de otro rango no es "similar" a nada.
 *
 * Función pura sobre datos ya leídos, para poder probarla sin base.
 */
import type { Moneda } from "../../generated/prisma";

/** Cuántas se muestran: una fila de la grilla en escritorio. */
export const CANTIDAD_SIMILARES = 3;

/** Banda de precio para salir de la categoría: ±25% del precio de la unidad. */
export const BANDA_PRECIO = 0.25;

export interface UnidadComparable {
  id: string;
  categoriaId: string;
  precio: number;
  moneda: Moneda;
}

/**
 * Precio en dólares, que es como se compara un usado. Null si está en pesos y
 * no hay cotización: esa unidad no se puede ubicar en ningún rango.
 */
function enDolares(precio: number, moneda: Moneda, cotizacionDolar: number | null): number | null {
  if (moneda === "USD") return precio;
  return cotizacionDolar && cotizacionDolar > 0 ? precio / cotizacionDolar : null;
}

/**
 * Ids de las similares, de la más parecida a la menos. Nunca incluye la propia
 * unidad, aunque venga entre los candidatos.
 */
export function elegirSimilares(
  referencia: UnidadComparable,
  candidatos: UnidadComparable[],
  cotizacionDolar: number | null,
  cantidad: number = CANTIDAD_SIMILARES,
): string[] {
  const precioReferencia = enDolares(referencia.precio, referencia.moneda, cotizacionDolar);

  /** Distancia relativa de precio; infinita si alguno de los dos no se puede pasar a dólares. */
  const distancia = (c: UnidadComparable) => {
    const precio = enDolares(c.precio, c.moneda, cotizacionDolar);
    if (precio === null || precioReferencia === null || precioReferencia <= 0) return Infinity;
    return Math.abs(precio - precioReferencia) / precioReferencia;
  };

  const otros = candidatos
    .filter((c) => c.id !== referencia.id)
    .map((c) => ({ id: c.id, mismaCategoria: c.categoriaId === referencia.categoriaId, distancia: distancia(c) }));

  // `sort` es estable: a igual distancia se respeta el orden en que llegaron
  // los candidatos, que el servicio trae de la más nueva a la más vieja.
  const porCercania = (a: { distancia: number }, b: { distancia: number }) =>
    a.distancia === b.distancia ? 0 : a.distancia - b.distancia;

  const deLaCategoria = otros.filter((c) => c.mismaCategoria).sort(porCercania);
  const enLaBanda = otros
    .filter((c) => !c.mismaCategoria && c.distancia <= BANDA_PRECIO)
    .sort(porCercania);

  return [...deLaCategoria, ...enLaBanda].slice(0, cantidad).map((c) => c.id);
}
