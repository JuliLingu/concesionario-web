/**
 * Flujo crítico: un visitante manda una consulta desde el catálogo.
 *
 * Es el único camino por el que entra un cliente potencial, así que lo que se
 * comprueba acá no es sólo que guarde: que valide antes de tocar la base, que
 * el cupo por origen siga cortando el spam, y que el aviso al concesionario
 * salga después de guardar y nunca antes.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ipUnica, type ResultadoAccion } from "./helpers/entorno";

const mocks = vi.hoisted(() => ({
  crearConsulta: vi.fn(),
  avisarConsulta: vi.fn(),
  ip: "10.0.0.0",
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { consulta: { create: mocks.crearConsulta } },
}));

vi.mock("@/services/avisos.service", () => ({
  avisarConsulta: mocks.avisarConsulta,
}));

vi.mock("@/auth", () => ({ auth: vi.fn() }));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

/**
 * `after` difiere el trabajo hasta después de la respuesta. Acá se ejecuta al
 * instante —es lo que permite afirmar que el aviso se programó y con qué— y se
 * le tapa el rechazo, igual que hace Next: un aviso que falla se registra, no
 * se propaga.
 */
vi.mock("next/server", () => ({
  after: (fn: () => unknown) => {
    const resultado = fn();
    if (resultado instanceof Promise) resultado.catch(() => {});
  },
}));

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": mocks.ip }),
}));

import { createConsulta } from "@/actions/consulta";

const CONSULTA_VALIDA = {
  nombre: "Ana Gómez",
  email: "ana@ejemplo.com",
  telefono: "1155550000",
  mensaje: "¿Sigue disponible?",
  vehiculoId: "veh_1",
};

/** Llama a la acción y expone las dos ramas de la respuesta. */
const enviar = (valores: Parameters<typeof createConsulta>[0]) =>
  createConsulta(valores) as Promise<ResultadoAccion>;

beforeEach(() => {
  mocks.ip = ipUnica();
  mocks.crearConsulta.mockResolvedValue({ id: "c_1" });
  mocks.avisarConsulta.mockResolvedValue(undefined);
});

describe("createConsulta", () => {
  it("guarda la consulta y confirma al visitante", async () => {
    const resultado = await enviar(CONSULTA_VALIDA);

    expect(resultado.success).toBeTruthy();
    expect(mocks.crearConsulta).toHaveBeenCalledTimes(1);
    expect(mocks.crearConsulta.mock.calls[0][0].data).toMatchObject({
      nombre: "Ana Gómez",
      email: "ana@ejemplo.com",
      vehiculoId: "veh_1",
    });
  });

  it("rechaza un email inválido sin llegar a la base", async () => {
    const resultado = await enviar({ ...CONSULTA_VALIDA, email: "no-es-un-email" });

    expect(resultado.error).toBeTruthy();
    expect(mocks.crearConsulta).not.toHaveBeenCalled();
  });

  it("guarda la consulta general cuando no viene una unidad", async () => {
    await enviar({ ...CONSULTA_VALIDA, vehiculoId: undefined });

    expect(mocks.crearConsulta.mock.calls[0][0].data.vehiculoId).toBeNull();
  });

  it("avisa al concesionario con los datos de la consulta", async () => {
    await enviar(CONSULTA_VALIDA);

    expect(mocks.avisarConsulta).toHaveBeenCalledWith({
      nombre: "Ana Gómez",
      email: "ana@ejemplo.com",
      telefono: "1155550000",
      mensaje: "¿Sigue disponible?",
      vehiculoId: "veh_1",
    });
  });

  it("no avisa de una consulta que no se pudo guardar", async () => {
    mocks.crearConsulta.mockRejectedValue(new Error("base caída"));

    const resultado = await enviar(CONSULTA_VALIDA);

    expect(resultado.error).toBeTruthy();
    expect(mocks.avisarConsulta).not.toHaveBeenCalled();
  });

  it("no espera al aviso para contestarle al visitante", async () => {
    // Si alguien reemplazara el `after` por un `await`, el rechazo caería en el
    // catch de la acción y el visitante vería un error por un correo que no
    // salió, con la consulta ya guardada.
    mocks.avisarConsulta.mockRejectedValue(new Error("proveedor de correo caído"));

    const resultado = await enviar(CONSULTA_VALIDA);

    expect(resultado.success).toBeTruthy();
  });

  it("corta al sexto envío desde el mismo origen", async () => {
    // El cupo es de 5 por hora: los cinco primeros pasan y el sexto espera.
    for (let intento = 0; intento < 5; intento += 1) {
      const resultado = await enviar(CONSULTA_VALIDA);
      expect(resultado.success).toBeTruthy();
    }

    const sexto = await enviar(CONSULTA_VALIDA);

    expect(sexto.error).toMatch(/demasiados intentos/i);
    expect(mocks.crearConsulta).toHaveBeenCalledTimes(5);
  });

  it("el cupo es por origen: otra IP no arrastra el bloqueo", async () => {
    for (let intento = 0; intento < 6; intento += 1) {
      await enviar(CONSULTA_VALIDA);
    }

    mocks.ip = ipUnica();
    const resultado = await enviar(CONSULTA_VALIDA);

    expect(resultado.success).toBeTruthy();
  });
});
