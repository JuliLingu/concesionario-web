/**
 * Búsqueda por texto del catálogo.
 *
 * Lo que se cuida acá son las dos formas en que una búsqueda deja de servir sin
 * que nadie se entere: que escribir una palabra más amplíe el resultado en vez
 * de achicarlo —el error clásico de cruzar los términos con O— y que lo tipeado
 * llegue crudo a un `LIKE`, donde un `%` suelto devuelve el catálogo entero.
 *
 * La normalización se prueba con el mismo cuidado porque no es solo cosmética:
 * el cuadro de búsqueda la aplica del lado del cliente para decidir si un cambio
 * de URL es suyo o de afuera. Si las dos puntas dejaran de coincidir, el input
 * se borraría solo mientras alguien escribe.
 */
import { describe, expect, it } from "vitest";
import {
  MAXIMO_TERMINOS,
  condicionesDeBusqueda,
  terminosDeBusqueda,
  textoDeBusqueda,
} from "@/lib/busqueda";

describe("terminosDeBusqueda", () => {
  it("parte la búsqueda en palabras", () => {
    expect(terminosDeBusqueda("ford ranger")).toEqual(["ford", "ranger"]);
  });

  it("ignora los espacios de más", () => {
    expect(terminosDeBusqueda("  vw   amarok ")).toEqual(["vw", "amarok"]);
  });

  it("trata la falta de búsqueda como una búsqueda vacía", () => {
    expect(terminosDeBusqueda(undefined)).toEqual([]);
    expect(terminosDeBusqueda("")).toEqual([]);
    expect(terminosDeBusqueda("   ")).toEqual([]);
  });

  it("se queda con el primer valor si el parámetro viene repetido", () => {
    expect(terminosDeBusqueda(["amarok", "hilux"])).toEqual(["amarok"]);
  });

  // Con los comodines vivos, `?q=%` traería todo el stock y `?q=____` cualquier
  // palabra de cuatro letras: dos formas de convertir la búsqueda en ruido.
  it("descarta los comodines de LIKE", () => {
    expect(terminosDeBusqueda("%")).toEqual([]);
    expect(terminosDeBusqueda("ama%rok")).toEqual(["ama", "rok"]);
    expect(terminosDeBusqueda("____")).toEqual([]);
    expect(terminosDeBusqueda("a\\b")).toEqual(["a", "b"]);
  });

  it("pone un techo a lo que puede pedir una URL escrita a mano", () => {
    const muchas = Array.from({ length: 30 }, (_, i) => `t${i}`).join(" ");
    expect(terminosDeBusqueda(muchas)).toHaveLength(MAXIMO_TERMINOS);

    expect(terminosDeBusqueda("a".repeat(500))[0]).toHaveLength(60);
  });
});

describe("textoDeBusqueda", () => {
  // El cuadro de búsqueda compara lo que escribió en la URL con lo que le
  // vuelve del servidor. Si normalizar no fuera idempotente, esa comparación
  // fallaría y el input se pisaría solo entre tecla y tecla.
  it("es estable: normalizar lo ya normalizado no cambia nada", () => {
    const una = textoDeBusqueda("  Ford   Ranger  ");
    expect(una).toBe("Ford Ranger");
    expect(textoDeBusqueda(una)).toBe(una);
  });
});

describe("condicionesDeBusqueda", () => {
  it("cruza los términos con Y, así cada palabra achica el resultado", () => {
    const condiciones = condicionesDeBusqueda(["ford", "ranger"]);

    // Una condición por término: la página las combina con `AND`. Un único
    // `OR` con las dos palabras adentro devolvería también las Ford que no son
    // Ranger y las Ranger que no son Ford.
    expect(condiciones).toHaveLength(2);
    expect(condiciones.every((c) => Array.isArray(c.OR))).toBe(true);
  });

  it("busca cada término en marca, modelo y versión", () => {
    const [condicion] = condicionesDeBusqueda(["amarok"]);

    expect(condicion.OR).toEqual([
      { marca: { contains: "amarok" } },
      { modelo: { contains: "amarok" } },
      { version: { contains: "amarok" } },
    ]);
  });

  // "Amarok 2020" es de las búsquedas más normales que hay, y sin esto el año
  // no coincide con ninguna columna de texto y la consulta vuelve vacía.
  it("compara contra el año cuando el término tiene pinta de serlo", () => {
    const [condicion] = condicionesDeBusqueda(["2020"]);

    expect(condicion.OR).toContainEqual({ anio: 2020 });
  });

  it("no confunde con un año cualquier número", () => {
    for (const termino of ["202", "20200", "1500", "4x4"]) {
      const [condicion] = condicionesDeBusqueda([termino]);
      expect(condicion.OR).toHaveLength(3);
    }
  });

  it("sin términos no agrega ninguna condición", () => {
    expect(condicionesDeBusqueda([])).toEqual([]);
  });
});
