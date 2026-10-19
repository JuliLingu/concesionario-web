/**
 * Que la bandeja de tasaciones no tenga "vw", "VOLKSWAGEN" y "Wolsvagen" para
 * el mismo auto, sin cambiarle la marca a nadie por una corrección de más.
 */
import { describe, expect, it } from "vitest";
import { armarSugerencias, canonizarMarca, canonizarModelo } from "@/lib/marcas";

describe("canonizarMarca", () => {
  it.each([
    ["vw", "Volkswagen"],
    ["VW", "Volkswagen"],
    ["volkswagen", "Volkswagen"],
    ["VOLKSWAGEN", "Volkswagen"],
    ["Wolsvagen", "Volkswagen"],
    ["volkswagem", "Volkswagen"],
    ["chevy", "Chevrolet"],
    ["chevrolet", "Chevrolet"],
    ["Chevrolete", "Chevrolet"],
    ["citroen", "Citroën"],
    ["mercedes", "Mercedes-Benz"],
    ["mercedes benz", "Mercedes-Benz"],
    ["toyta", "Toyota"],
    ["  ford  ", "Ford"],
    ["peugot", "Peugeot"],
  ])("%s → %s", (entrada, esperado) => {
    expect(canonizarMarca(entrada)).toBe(esperado);
  });

  it("no corrige por aproximación las marcas cortas", () => {
    expect(canonizarMarca("Mia")).toBe("Mia");
    expect(canonizarMarca("kia")).toBe("Kia");
  });

  it("deja tal cual una marca que no conoce", () => {
    expect(canonizarMarca("Lada")).toBe("Lada");
    expect(canonizarMarca("Dacia  Sandero")).toBe("Dacia Sandero");
  });
});

describe("canonizarModelo", () => {
  it("corrige la grafía de un modelo conocido de la marca", () => {
    expect(canonizarModelo("toyota", "HILUX")).toBe("Hilux");
    expect(canonizarModelo("vw", "tcross")).toBe("T-Cross");
  });

  it("no confunde modelos parecidos", () => {
    expect(canonizarModelo("Peugeot", "2008")).toBe("2008");
    expect(canonizarModelo("Peugeot", "208")).toBe("208");
  });

  it("deja tal cual un modelo que no conoce", () => {
    expect(canonizarModelo("Toyota", "Supra")).toBe("Supra");
  });
});

describe("armarSugerencias", () => {
  it("pone primero lo del stock y no repite grafías", () => {
    const sugerencias = armarSugerencias([
      { marca: "VW", modelo: "Amarok V6" },
      { marca: "Volkswagen", modelo: "amarok" },
    ]);

    expect(sugerencias.Volkswagen[0]).toBe("Amarok V6");
    expect(sugerencias.Volkswagen.filter((m) => m === "Amarok")).toHaveLength(1);
    expect(sugerencias.VW).toBeUndefined();
  });
});
