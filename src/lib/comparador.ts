/**
 * Reglas de la tabla del comparador.
 *
 * Lo único que se decide acá es qué celda se resalta como "la mejor" de cada
 * fila. Es una afirmación —"este es el más barato", "este tiene menos km"— y
 * como tal solo se hace cuando es cierta y comparable: con un solo dato en la
 * fila, con todos iguales o con importes en monedas que no se pueden llevar a
 * una misma, no se resalta nada.
 */
import { precioEnPesos } from "@/lib/precio";
import type { Moneda } from "../../generated/prisma";

export type Criterio = "menor" | "mayor";

/**
 * Para cada valor, si es el mejor de la fila. Puede haber empate: si dos
 * unidades tienen el mismo año y es el más nuevo, se resaltan las dos.
 */
export function mejoresDeLaFila(valores: (number | null)[], criterio: Criterio): boolean[] {
  const conDato = valores.filter((v): v is number => v !== null);
  const distintos = new Set(conDato);
  if (conDato.length < 2 || distintos.size < 2) return valores.map(() => false);

  const mejor = criterio === "menor" ? Math.min(...conDato) : Math.max(...conDato);
  return valores.map((v) => v === mejor);
}

/**
 * Precios llevados a una misma moneda para poder compararlos, o null en cada
 * posición si no se puede.
 *
 * Si todos están en la misma moneda se comparan tal cual, haya cotización o no.
 * Si se mezclan, se pasan a pesos; y si falta la cotización para hacerlo, la
 * fila entera queda sin comparar en vez de comparar pesos contra dólares.
 */
export function preciosComparables(
  precios: { precio: number; moneda: Moneda }[],
  cotizacionDolar: number | null | undefined,
): (number | null)[] {
  const monedas = new Set(precios.map((p) => p.moneda));
  if (monedas.size <= 1) return precios.map((p) => p.precio);

  const enPesos = precios.map((p) => precioEnPesos(p.precio, p.moneda, cotizacionDolar));
  return enPesos.some((p) => p === null) ? precios.map(() => null) : enPesos;
}
