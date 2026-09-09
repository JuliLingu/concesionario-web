/**
 * Flujo crítico: un visitante ofrece su usado desde /tasacion.
 *
 * Tres cosas que no pueden romperse. La primera es el interruptor del módulo:
 * una función exportada de un archivo "use server" es un endpoint alcanzable
 * por sí mismo, así que apagar el formulario no apaga la acción — si el chequeo
 * se cayera, una instalación con la tasación desactivada seguiría juntando
 * propuestas en una bandeja que nadie mira. La segunda es que el esquema pueda
 * validar su propia salida, porque eso es exactamente lo que le manda el
 * formulario. La tercera es que el aviso salga después de guardar y nunca antes.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ipUnica, type ResultadoAccion } from "./helpers/entorno";

const mocks = vi.hoisted(() => ({
  crearTasacion: vi.fn(),
  buscarVehiculo: vi.fn(),
  avisarTasacion: vi.fn(),
  getConfiguracion: vi.fn(),
  ip: "10.0.0.0",
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    tasacion: { create: mocks.crearTasacion },
    vehiculo: { findFirst: mocks.buscarVehiculo },
  },
}));

vi.mock("@/services/avisos.service", () => ({
  avisarTasacion: mocks.avisarTasacion,
}));

vi.mock("@/services/configuracion.service", () => ({
  getConfiguracion: mocks.getConfiguracion,
}));

vi.mock("@/auth", () => ({ auth: vi.fn() }));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

/** Mismo criterio que en consulta.test.ts: `after` corre al instante. */
vi.mock("next/server", () => ({
  after: (fn: () => unknown) => {
    const resultado = fn();
    if (resultado instanceof Promise) resultado.catch(() => {});
  },
}));

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": mocks.ip }),
}));

import { createTasacion } from "@/actions/tasacion";
import { TasacionSchema } from "@/schemas/tasacion";

/** Lo que manda el formulario ya transformado por el resolver. */
const TASACION_VALIDA = {
  nombre: "Ana Gómez",
  email: "ana@ejemplo.com",
  telefono: "1155550000",
  marca: "Toyota",
  modelo: "Corolla",
  anio: 2018,
  kilometraje: 80000,
  version: null,
  combustible: null,
  transmision: null,
  precioPretendido: null,
  moneda: "USD" as const,
  observaciones: null,
  vehiculoInteresId: null,
};

const enviar = (valores: Parameters<typeof createTasacion>[0]) =>
  createTasacion(valores) as Promise<ResultadoAccion>;

beforeEach(() => {
  vi.clearAllMocks();
  mocks.ip = ipUnica();
  mocks.getConfiguracion.mockResolvedValue({ tasacionActiva: true });
  mocks.crearTasacion.mockResolvedValue({ id: "tas_1" });
  mocks.buscarVehiculo.mockResolvedValue(null);
});

describe("interruptor del módulo", () => {
  it("rechaza sin tocar la base cuando la tasación está apagada", async () => {
    mocks.getConfiguracion.mockResolvedValue({ tasacionActiva: false });

    const resultado = await enviar(TASACION_VALIDA);

    expect(resultado.error).toBeDefined();
    expect(mocks.crearTasacion).not.toHaveBeenCalled();
    expect(mocks.avisarTasacion).not.toHaveBeenCalled();
  });
});

describe("validación", () => {
  it("acepta la salida de su propio esquema", () => {
    // El formulario manda los opcionales vacíos como null, no como "". Si el
    // esquema no pudiera releerlos, toda tasación sin versión ni comentarios
    // se rechazaría por inválida.
    expect(TasacionSchema.safeParse(TASACION_VALIDA).success).toBe(true);
  });

  it("no guarda con email inválido", async () => {
    const resultado = await enviar({ ...TASACION_VALIDA, email: "no-es-un-email" });

    expect(resultado.error).toBeDefined();
    expect(mocks.crearTasacion).not.toHaveBeenCalled();
  });

  it("no guarda con kilometraje negativo", async () => {
    const resultado = await enviar({ ...TASACION_VALIDA, kilometraje: -1 });

    expect(resultado.error).toBeDefined();
    expect(mocks.crearTasacion).not.toHaveBeenCalled();
  });

  it("no guarda con un año del futuro", async () => {
    const resultado = await enviar({
      ...TASACION_VALIDA,
      anio: new Date().getFullYear() + 5,
    });

    expect(resultado.error).toBeDefined();
    expect(mocks.crearTasacion).not.toHaveBeenCalled();
  });

  it("no confunde 'no sé cuánto vale' con 'lo regalo'", () => {
    // Con z.coerce.number() la cadena vacía se convertiría en 0 y quedaría
    // guardada como precio pretendido cero.
    const parseado = TasacionSchema.safeParse({
      ...TASACION_VALIDA,
      precioPretendido: "",
    });

    expect(parseado.success).toBe(true);
    expect(parseado.success && parseado.data.precioPretendido).toBeNull();
  });

  it("normaliza a null el enum que el desplegable manda vacío", () => {
    const parseado = TasacionSchema.safeParse({
      ...TASACION_VALIDA,
      combustible: "",
      transmision: "",
    });

    expect(parseado.success).toBe(true);
    expect(parseado.success && parseado.data.combustible).toBeNull();
    expect(parseado.success && parseado.data.transmision).toBeNull();
  });
});

describe("unidad de interés", () => {
  it("guarda el vínculo cuando la unidad existe y está publicada", async () => {
    mocks.buscarVehiculo.mockResolvedValue({ id: "veh_1" });

    await enviar({ ...TASACION_VALIDA, vehiculoInteresId: "veh_1" });

    expect(mocks.crearTasacion).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ vehiculoInteresId: "veh_1" }) }),
    );
  });

  it("guarda la tasación igual si la unidad no existe o no está publicada", async () => {
    mocks.buscarVehiculo.mockResolvedValue(null);

    const resultado = await enviar({ ...TASACION_VALIDA, vehiculoInteresId: "veh_borrado" });

    expect(resultado.success).toBeDefined();
    expect(mocks.crearTasacion).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ vehiculoInteresId: null }) }),
    );
  });
});

describe("aviso al concesionario", () => {
  it("se programa después de guardar", async () => {
    const resultado = await enviar(TASACION_VALIDA);

    expect(resultado.success).toBeDefined();
    expect(mocks.avisarTasacion).toHaveBeenCalledWith(
      expect.objectContaining({ marca: "Toyota", modelo: "Corolla", anio: 2018 }),
    );
  });

  it("no se manda si guardar falló", async () => {
    mocks.crearTasacion.mockRejectedValue(new Error("base caída"));

    const resultado = await enviar(TASACION_VALIDA);

    expect(resultado.error).toBeDefined();
    expect(mocks.avisarTasacion).not.toHaveBeenCalled();
  });
});

describe("cupo por origen", () => {
  it("corta la cuarta tasación de la misma IP", async () => {
    for (let intento = 0; intento < 3; intento += 1) {
      const resultado = await enviar(TASACION_VALIDA);
      expect(resultado.success).toBeDefined();
    }

    const cuarta = await enviar(TASACION_VALIDA);

    expect(cuarta.error).toBeDefined();
    expect(mocks.crearTasacion).toHaveBeenCalledTimes(3);
  });
});
