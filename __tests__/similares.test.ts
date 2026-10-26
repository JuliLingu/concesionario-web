/**
 * "Unidades similares" al pie de la ficha.
 *
 * Lo que se cuida es que la sugerencia tenga sentido para quien está mirando:
 * primero su misma categoría, y fuera de ella solo lo que cae en su rango de
 * precio, sin comparar pesos contra dólares cuando no hay cotización.
 */
import { describe, expect, it } from "vitest";
import { elegirSimilares, type UnidadComparable } from "@/lib/similares";

const unidad = (
  id: string,
  categoriaId: string,
  precio: number,
  moneda: "USD" | "ARS" = "USD",
): UnidadComparable => ({ id, categoriaId, precio, moneda });

const referencia = unidad("ref", "suv", 20_000);

describe("elegirSimilares", () => {
  it("prefiere la misma categoría, de la más cercana en precio a la más lejana", () => {
    const candidatos = [
      unidad("suv-lejos", "suv", 40_000),
      unidad("auto-cerca", "auto", 20_500),
      unidad("suv-cerca", "suv", 21_000),
      unidad("suv-medio", "suv", 15_000),
    ];
    expect(elegirSimilares(referencia, candidatos, null)).toEqual(["suv-cerca", "suv-medio", "suv-lejos"]);
  });

  it("si la categoría no alcanza, completa solo con otras dentro de la banda de precio", () => {
    const candidatos = [
      unidad("suv", "suv", 30_000),
      unidad("auto-fuera", "auto", 30_000),
      unidad("auto-dentro", "auto", 23_000),
    ];
    expect(elegirSimilares(referencia, candidatos, null)).toEqual(["suv", "auto-dentro"]);
  });

  it("nunca se sugiere a sí misma", () => {
    expect(elegirSimilares(referencia, [referencia, unidad("otra", "suv", 20_000)], null)).toEqual(["otra"]);
  });

  it("pasa los pesos a dólares con la cotización", () => {
    const candidatos = [unidad("en-pesos", "auto", 21_000_000, "ARS")];
    expect(elegirSimilares(referencia, candidatos, 1_000)).toEqual(["en-pesos"]);
  });

  it("sin cotización, una en pesos no entra por precio pero sí por categoría, al final", () => {
    const candidatos = [
      unidad("pesos-otra-cat", "auto", 20_000_000, "ARS"),
      unidad("pesos-suv", "suv", 20_000_000, "ARS"),
      unidad("suv-lejos", "suv", 60_000),
    ];
    expect(elegirSimilares(referencia, candidatos, null)).toEqual(["suv-lejos", "pesos-suv"]);
  });

  it("corta en la cantidad pedida", () => {
    const candidatos = ["a", "b", "c", "d", "e"].map((id, i) => unidad(id, "suv", 20_000 + i * 100));
    expect(elegirSimilares(referencia, candidatos, null)).toEqual(["a", "b", "c"]);
  });
});
