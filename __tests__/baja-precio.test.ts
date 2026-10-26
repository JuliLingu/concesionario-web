/**
 * Historial de precio y el "Bajó USD 1.000" de la vitrina.
 *
 * Anunciar una baja es mostrar un precio anterior: lo que se cuida es que solo
 * se anuncie cuando es cierta, reciente y de un monto que valga la pena, y que
 * desaparezca en cuanto deja de serlo.
 */
import { describe, expect, it } from "vitest";
import {
  DIAS_BAJA_VISIBLE,
  bajaVigente,
  cambioElPrecio,
  seguimientoTrasCambio,
  type PrecioActual,
} from "@/lib/baja-precio";

const ahora = new Date("2026-10-26T12:00:00Z");
const haceDias = (dias: number) => new Date(ahora.getTime() - dias * 86_400_000);

const sinBaja: PrecioActual = { precio: 20_000, moneda: "USD", precioAnterior: null, precioBajoAt: null };

describe("seguimientoTrasCambio", () => {
  it("una baja anota el precio de antes y la fecha", () => {
    expect(seguimientoTrasCambio(sinBaja, { precio: 19_000, moneda: "USD" }, ahora)).toEqual({
      precioAnterior: 20_000,
      precioBajoAt: ahora,
    });
  });

  it("bajas seguidas dentro de la ventana se cuentan desde el primer precio", () => {
    const yaBajo: PrecioActual = { precio: 19_000, moneda: "USD", precioAnterior: 20_000, precioBajoAt: haceDias(10) };
    expect(seguimientoTrasCambio(yaBajo, { precio: 18_500, moneda: "USD" }, ahora)).toEqual({
      precioAnterior: 20_000,
      precioBajoAt: ahora,
    });
  });

  it("una baja después de vencida la anterior arranca de nuevo", () => {
    const vieja: PrecioActual = {
      precio: 19_000,
      moneda: "USD",
      precioAnterior: 20_000,
      precioBajoAt: haceDias(DIAS_BAJA_VISIBLE + 1),
    };
    expect(seguimientoTrasCambio(vieja, { precio: 18_500, moneda: "USD" }, ahora).precioAnterior).toBe(19_000);
  });

  it("una suba o un cambio de moneda borra la baja", () => {
    const yaBajo: PrecioActual = { precio: 19_000, moneda: "USD", precioAnterior: 20_000, precioBajoAt: haceDias(5) };
    const sinNada = { precioAnterior: null, precioBajoAt: null };
    expect(seguimientoTrasCambio(yaBajo, { precio: 19_500, moneda: "USD" }, ahora)).toEqual(sinNada);
    expect(seguimientoTrasCambio(yaBajo, { precio: 18_000_000, moneda: "ARS" }, ahora)).toEqual(sinNada);
  });

  it("guardar sin tocar el precio conserva la baja tal cual", () => {
    const yaBajo: PrecioActual = { precio: 19_000, moneda: "USD", precioAnterior: 20_000, precioBajoAt: haceDias(5) };
    expect(seguimientoTrasCambio(yaBajo, { precio: 19_000, moneda: "USD" }, ahora)).toEqual({
      precioAnterior: 20_000,
      precioBajoAt: haceDias(5),
    });
  });
});

describe("cambioElPrecio", () => {
  it("cuenta el precio y la moneda", () => {
    expect(cambioElPrecio({ precio: 1, moneda: "USD" }, { precio: 1, moneda: "USD" })).toBe(false);
    expect(cambioElPrecio({ precio: 1, moneda: "USD" }, { precio: 2, moneda: "USD" })).toBe(true);
    expect(cambioElPrecio({ precio: 1, moneda: "USD" }, { precio: 1, moneda: "ARS" })).toBe(true);
  });
});

describe("bajaVigente", () => {
  const conBaja = (precioAnterior: number, precio: number, dias: number, extra: Partial<PrecioActual & { publicacion: string }> = {}) => ({
    precio,
    moneda: "USD" as const,
    precioAnterior,
    precioBajoAt: haceDias(dias),
    publicacion: "PUBLICADO",
    ...extra,
  });

  it("devuelve cuánto bajó si es reciente y alcanza el mínimo", () => {
    expect(bajaVigente(conBaja(20_000, 19_000, 3), ahora)).toBe(1_000);
  });

  it("no anuncia bajas chicas, ni en monto ni en proporción", () => {
    expect(bajaVigente(conBaja(20_000, 19_900, 3), ahora)).toBeNull(); // USD 100
    expect(bajaVigente(conBaja(80_000_000, 79_500_000, 3, { moneda: "ARS" }), ahora)).toBeNull(); // 0,6%
  });

  it("deja de anunciarse pasada la ventana", () => {
    expect(bajaVigente(conBaja(20_000, 19_000, DIAS_BAJA_VISIBLE), ahora)).toBeNull();
  });

  it("una vendida no anuncia nada", () => {
    expect(bajaVigente(conBaja(20_000, 19_000, 3, { publicacion: "VENDIDO" }), ahora)).toBeNull();
  });

  it("sin baja registrada es null", () => {
    expect(bajaVigente({ ...sinBaja, publicacion: "PUBLICADO" }, ahora)).toBeNull();
  });
});
