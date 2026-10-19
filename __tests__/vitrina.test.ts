/**
 * Etiquetas, precio y cuota de la tarjeta del catálogo.
 *
 * Cada etiqueta es una promesa comercial —"bajo km", "nuevo ingreso"— y lo que
 * se cuida acá es que no la lleve una unidad que no la cumple: un auto viejo con
 * muchos kilómetros por tener buen promedio, o una vendida anunciada como
 * financiable.
 */
import { describe, expect, it } from "vitest";
import {
  ANTICIPO_POR_DEFECTO,
  cuotaDesde,
  cuotaMensual,
  insigniasDeVehiculo,
  precioDeVitrina,
} from "@/lib/vitrina";

const ahora = new Date("2026-10-15T12:00:00Z");
const haceDias = (dias: number) => new Date(ahora.getTime() - dias * 86_400_000);

const base = {
  publicacion: "PUBLICADO",
  estado: "USADO",
  anio: 2020,
  kilometraje: 90_000,
  financiable: false,
  createdAt: haceDias(60),
};

describe("insigniasDeVehiculo", () => {
  it("marca como nuevo ingreso lo dado de alta hace poco", () => {
    expect(insigniasDeVehiculo({ ...base, createdAt: haceDias(3) }, false, ahora)).toContain(
      "NUEVO_INGRESO",
    );
    expect(insigniasDeVehiculo(base, false, ahora)).not.toContain("NUEVO_INGRESO");
  });

  it("solo anuncia financiable con el módulo encendido", () => {
    const v = { ...base, financiable: true };
    expect(insigniasDeVehiculo(v, true, ahora)).toContain("FINANCIABLE");
    expect(insigniasDeVehiculo(v, false, ahora)).not.toContain("FINANCIABLE");
  });

  it("exige poco kilometraje en total y por año para bajo km", () => {
    expect(insigniasDeVehiculo({ ...base, kilometraje: 30_000 }, false, ahora)).toContain("BAJO_KM");
    // Buen promedio, pero demasiados kilómetros en total.
    expect(
      insigniasDeVehiculo({ ...base, anio: 2008, kilometraje: 150_000 }, false, ahora),
    ).not.toContain("BAJO_KM");
    // Pocos en total, pero muchos para un año de uso.
    expect(
      insigniasDeVehiculo({ ...base, anio: 2025, kilometraje: 45_000 }, false, ahora),
    ).not.toContain("BAJO_KM");
  });

  it("no anuncia bajo km en un 0 km", () => {
    expect(
      insigniasDeVehiculo({ ...base, estado: "NUEVO", kilometraje: 0 }, false, ahora),
    ).not.toContain("BAJO_KM");
  });

  it("una vendida lleva solo esa etiqueta", () => {
    const v = { ...base, publicacion: "VENDIDO", financiable: true, createdAt: haceDias(1) };
    expect(insigniasDeVehiculo(v, true, ahora)).toEqual(["VENDIDO"]);
  });
});

describe("precioDeVitrina", () => {
  it("muestra los dólares y debajo la referencia en pesos", () => {
    const { principal, secundario } = precioDeVitrina(15_000, "USD", 1_000);
    expect(principal).toContain("15.000");
    expect(secundario).toContain("15.000.000");
  });

  it("sin cotización no inventa el importe en pesos", () => {
    expect(precioDeVitrina(15_000, "USD", null).secundario).toBeNull();
  });

  it("una unidad en pesos no lleva secundario", () => {
    expect(precioDeVitrina(15_000_000, "ARS", 1_000).secundario).toBeNull();
  });
});

describe("cuotaDesde", () => {
  const planes = [
    { cuotas: 12, tasaAnual: 40 },
    { cuotas: 36, tasaAnual: 60 },
  ];

  it("devuelve la cuota más baja con el anticipo por defecto", () => {
    const esperada = Math.min(
      ...planes.map((p) => cuotaMensual(1_000_000, ANTICIPO_POR_DEFECTO, p)),
    );
    expect(cuotaDesde(1_000_000, planes)).toBeCloseTo(esperada);
  });

  it("calcula interés simple sobre el saldo", () => {
    // 1.000.000 con 50% de anticipo: 500.000 a 12 meses al 40% → 700.000 / 12.
    expect(cuotaMensual(1_000_000, 50, { cuotas: 12, tasaAnual: 40 })).toBeCloseTo(700_000 / 12);
  });

  it("es null sin planes o sin precio en pesos", () => {
    expect(cuotaDesde(1_000_000, [])).toBeNull();
    expect(cuotaDesde(null, planes)).toBeNull();
  });
});
