/**
 * Guardados y comparador: lo que llega del navegador y de la URL.
 *
 * Todo esto es entrada no confiable que termina en un `IN` de Prisma, así que
 * lo que se cuida es que salga acotado, sin basura y sin perder el orden en que
 * el visitante eligió.
 */
import { describe, expect, it } from "vitest";
import {
  alternarId,
  depurarIds,
  idsDeUrl,
  idsGuardados,
  mismasListas,
  urlConIds,
} from "@/lib/seleccion";
import { mejoresDeLaFila, preciosComparables } from "@/lib/comparador";

const id = (n: number) => `cm${String(n).padStart(23, "0")}`;

describe("depurarIds", () => {
  it("descarta lo que no tiene forma de id, los repetidos y lo que pasa el tope", () => {
    expect(depurarIds([id(1), "x", 42, id(1), "<script>", id(2), id(3)], 2)).toEqual([id(1), id(2)]);
  });
});

describe("idsGuardados", () => {
  it("lee un arreglo guardado", () => {
    expect(idsGuardados(JSON.stringify([id(1), id(2)]), 30)).toEqual([id(1), id(2)]);
  });

  it("ante cualquier otra cosa devuelve vacío en lugar de romper", () => {
    expect(idsGuardados(null, 30)).toEqual([]);
    expect(idsGuardados("{roto", 30)).toEqual([]);
    expect(idsGuardados(JSON.stringify({ ids: [id(1)] }), 30)).toEqual([]);
  });
});

describe("idsDeUrl", () => {
  it("acepta separados por coma y repetidos en la query", () => {
    expect(idsDeUrl(`${id(1)},${id(2)}`, 3)).toEqual([id(1), id(2)]);
    expect(idsDeUrl([id(1), `${id(2)},${id(3)}`], 3)).toEqual([id(1), id(2), id(3)]);
  });

  it("corta en el máximo", () => {
    expect(idsDeUrl([id(1), id(2), id(3), id(4)].join(","), 3)).toHaveLength(3);
  });

  it("sin parámetro es vacío", () => {
    expect(idsDeUrl(undefined, 3)).toEqual([]);
  });
});

describe("alternarId", () => {
  it("agrega al principio y quita si ya estaba", () => {
    const una = alternarId([id(1)], id(2), 3);
    expect(una).toEqual([id(2), id(1)]);
    expect(alternarId(una, id(1), 3)).toEqual([id(2)]);
  });

  it("con la lista llena no agrega ni saca otra en silencio", () => {
    const llena = [id(1), id(2), id(3)];
    expect(alternarId(llena, id(4), 3)).toBe(llena);
    expect(alternarId(llena, id(2), 3)).toEqual([id(1), id(3)]);
  });
});

describe("urlConIds y mismasListas", () => {
  it("arma el enlace y compara con orden", () => {
    expect(urlConIds("/comparar", [id(1), id(2)])).toBe(`/comparar?ids=${id(1)},${id(2)}`);
    expect(urlConIds("/guardados", [])).toBe("/guardados");
    expect(mismasListas([id(1), id(2)], [id(2), id(1)])).toBe(false);
  });
});

describe("mejoresDeLaFila", () => {
  it("marca el menor o el mayor, con empates", () => {
    expect(mejoresDeLaFila([90_000, 40_000, 40_000], "menor")).toEqual([false, true, true]);
    expect(mejoresDeLaFila([2018, 2021, null], "mayor")).toEqual([false, true, false]);
  });

  it("no marca nada si son todos iguales o hay un solo dato", () => {
    expect(mejoresDeLaFila([2020, 2020], "mayor")).toEqual([false, false]);
    expect(mejoresDeLaFila([150, null, null], "mayor")).toEqual([false, false, false]);
  });
});

describe("preciosComparables", () => {
  it("en una sola moneda compara los importes tal cual", () => {
    expect(
      preciosComparables(
        [
          { precio: 20_000, moneda: "USD" },
          { precio: 18_000, moneda: "USD" },
        ],
        null,
      ),
    ).toEqual([20_000, 18_000]);
  });

  it("mezcladas, las pasa a pesos con la cotización", () => {
    expect(
      preciosComparables(
        [
          { precio: 10, moneda: "USD" },
          { precio: 12_000, moneda: "ARS" },
        ],
        1_000,
      ),
    ).toEqual([10_000, 12_000]);
  });

  it("mezcladas y sin cotización, no compara", () => {
    expect(
      preciosComparables(
        [
          { precio: 10, moneda: "USD" },
          { precio: 12_000, moneda: "ARS" },
        ],
        null,
      ),
    ).toEqual([null, null]);
  });
});
