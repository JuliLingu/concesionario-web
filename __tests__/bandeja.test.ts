/**
 * Bandeja unificada y contactos.
 *
 * Lo que se cuida: que la misma persona no quede partida en dos contactos por
 * cómo tipeó el email, que un pedido nuevo no le borre el teléfono que ya
 * había dejado, y que mezclar tres tablas y paginar no pierda ni repita pedidos.
 */
import { describe, expect, it } from "vitest";
import { datosAActualizar, normalizarEmail } from "@/lib/contacto";
import { cursorDeUrl, paginaMezclada, tipoDeUrl, tiposActivos } from "@/lib/bandeja";

describe("normalizarEmail", () => {
  it("ignora mayúsculas y espacios", () => {
    expect(normalizarEmail("  Juan.Perez@Mail.COM ")).toBe("juan.perez@mail.com");
  });
});

describe("datosAActualizar", () => {
  it("actualiza nombre y teléfono cuando el pedido trae los dos", () => {
    expect(datosAActualizar({ email: "a@b.com", nombre: " Ana ", telefono: " +5491155550000 " })).toEqual({
      nombre: "Ana",
      telefono: "+5491155550000",
    });
  });

  it("un pedido sin teléfono no borra el que ya tenía", () => {
    expect(datosAActualizar({ email: "a@b.com", nombre: "Ana", telefono: null })).toEqual({ nombre: "Ana" });
    expect(datosAActualizar({ email: "a@b.com", nombre: "Ana", telefono: "  " })).toEqual({ nombre: "Ana" });
  });
});

describe("tiposActivos y tipoDeUrl", () => {
  it("lista solo los módulos encendidos", () => {
    expect(tiposActivos({ tasacionActiva: false, financiacionActiva: false })).toEqual(["CONSULTA"]);
    expect(tiposActivos({ tasacionActiva: true, financiacionActiva: true })).toEqual([
      "CONSULTA",
      "TASACION",
      "SOLICITUD",
    ]);
  });

  it("un tipo apagado o inventado en la URL cae a 'todos'", () => {
    const activos = tiposActivos({ tasacionActiva: false, financiacionActiva: true });
    expect(tipoDeUrl("SOLICITUD", activos)).toBe("SOLICITUD");
    expect(tipoDeUrl("TASACION", activos)).toBeUndefined();
    expect(tipoDeUrl("BORRAR", activos)).toBeUndefined();
  });
});

describe("cursorDeUrl", () => {
  it("acepta una fecha y descarta lo que no lo es", () => {
    expect(cursorDeUrl("2026-10-20T10:00:00.000Z")?.toISOString()).toBe("2026-10-20T10:00:00.000Z");
    expect(cursorDeUrl("ayer")).toBeUndefined();
    expect(cursorDeUrl(undefined)).toBeUndefined();
  });
});

describe("paginaMezclada", () => {
  const pedido = (id: string, dia: number) => ({ id, createdAt: new Date(Date.UTC(2026, 9, dia)) });

  it("mezcla las tablas de la más nueva a la más vieja", () => {
    const { items, siguiente } = paginaMezclada(
      [
        [pedido("c3", 20), pedido("c1", 10)],
        [pedido("t2", 15)],
        [],
      ],
      10,
    );
    expect(items.map((p) => p.id)).toEqual(["c3", "t2", "c1"]);
    expect(siguiente).toBeNull();
  });

  it("si sobra alguno, el cursor es la fecha del último que se muestra", () => {
    const { items, siguiente } = paginaMezclada(
      [
        [pedido("c3", 20), pedido("c1", 10)],
        [pedido("t2", 15)],
      ],
      2,
    );
    expect(items.map((p) => p.id)).toEqual(["c3", "t2"]);
    expect(siguiente?.toISOString()).toBe(pedido("t2", 15).createdAt.toISOString());
  });
});
