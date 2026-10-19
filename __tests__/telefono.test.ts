/**
 * El teléfono es lo que usa el vendedor para cerrar: si queda mal guardado, el
 * enlace de WhatsApp del panel abre un chat con nadie. Acá se prueban las
 * formas en que la gente lo escribe de verdad.
 */
import { describe, expect, it } from "vitest";
import {
  ERROR_SIN_AREA,
  normalizarTelefonoAr,
  whatsappDeCliente,
} from "@/lib/telefono";

const valor = (texto: string) => {
  const r = normalizarTelefonoAr(texto);
  return r.ok ? r.valor : r.error;
};

describe("normalizarTelefonoAr", () => {
  it.each([
    ["11 2345-6789", "+5491123456789"],
    ["1123456789", "+5491123456789"],
    ["011 2345-6789", "+5491123456789"],
    ["11 15 2345-6789", "+5491123456789"],
    ["011 15 2345 6789", "+5491123456789"],
    ["+54 9 11 2345-6789", "+5491123456789"],
    ["+54 11 2345 6789", "+5491123456789"],
    ["5491123456789", "+5491123456789"],
    ["(0351) 15-555-1234", "+5493515551234"],
    ["351 555-1234", "+5493515551234"],
    ["2944 15 12-3456", "+5492944123456"],
    ["0221 423-4567", "+5492214234567"],
  ])("%s → %s", (entrada, esperado) => {
    expect(valor(entrada)).toBe(esperado);
  });

  it("es idempotente: lo ya normalizado vuelve igual", () => {
    expect(valor("+5491123456789")).toBe("+5491123456789");
    expect(valor("+5493515551234")).toBe("+5493515551234");
  });

  it.each(["2345-6789", "15 2345-6789", "155551234"])(
    "pide el código de área si falta (%s)",
    (entrada) => {
      expect(valor(entrada)).toBe(ERROR_SIN_AREA);
    },
  );

  it.each(["", "abc", "12345678901234567", "4123456789", "1923456789"])(
    "rechaza lo que no es un número argentino (%s)",
    (entrada) => {
      expect(normalizarTelefonoAr(entrada).ok).toBe(false);
    },
  );
});

describe("whatsappDeCliente", () => {
  it("arma el enlace con el número internacional", () => {
    expect(whatsappDeCliente("11 15 2345-6789")).toBe("https://wa.me/5491123456789");
  });

  it("no inventa un enlace para un número que no se entiende", () => {
    expect(whatsappDeCliente("2345-6789")).toBeNull();
    expect(whatsappDeCliente(null)).toBeNull();
  });
});
