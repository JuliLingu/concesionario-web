/**
 * Flujo crítico: el administrador da de alta una unidad.
 *
 * Dos cosas que no pueden romperse en una actualización. La primera es el
 * control de acceso: toda función exportada de un archivo "use server" es un
 * endpoint alcanzable por sí mismo, así que si el control se cayera, cualquiera
 * podría publicar vehículos en el sitio de un cliente. La segunda es el filtro
 * de URLs de imagen, que es lo único que separa a la ficha de un `javascript:`
 * cargado desde el panel.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EstadoPublicacion, EstadoVehiculo, Moneda } from "../generated/prisma";
import { Combustible, Transmision } from "../generated/prisma";
import type { ResultadoAccion } from "./helpers/entorno";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  crearVehiculo: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));

vi.mock("@/lib/prisma", () => ({
  prisma: { vehiculo: { create: mocks.crearVehiculo } },
}));

/**
 * `unstable_cache` hace falta acá aunque el alta no lo use: la acción importa
 * las etiquetas de caché desde `cache.service`, y ese módulo lo llama al
 * evaluarse. Se reemplaza por la función tal cual, sin caché.
 */
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  updateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}));

import { createVehicle } from "@/actions/vehicle";

const VEHICULO_VALIDO = {
  categoriaId: "cat_1",
  marca: "Toyota",
  modelo: "Corolla",
  anio: 2021,
  precio: 25000,
  moneda: Moneda.USD,
  kilometraje: 45000,
  combustible: Combustible.NAFTA,
  transmision: Transmision.AUTOMATICA,
  estado: EstadoVehiculo.USADO,
  publicacion: EstadoPublicacion.PUBLICADO,
  imagenes: [
    "https://res.cloudinary.com/demo/image/upload/uno.jpg",
    "https://res.cloudinary.com/demo/image/upload/dos.jpg",
  ],
};

const alta = (valores: Parameters<typeof createVehicle>[0]) =>
  createVehicle(valores) as Promise<ResultadoAccion>;

const sesionAdmin = { user: { role: "ADMIN" } };

beforeEach(() => {
  mocks.auth.mockResolvedValue(sesionAdmin);
  mocks.crearVehiculo.mockResolvedValue({ id: "veh_1" });
});

describe("createVehicle", () => {
  it("crea la unidad cuando la pide un administrador", async () => {
    const resultado = await alta(VEHICULO_VALIDO);

    expect(resultado.success).toBeTruthy();
    expect(mocks.crearVehiculo.mock.calls[0][0].data).toMatchObject({
      marca: "Toyota",
      modelo: "Corolla",
      anio: 2021,
    });
  });

  it("marca como principal la primera imagen y respeta el orden", async () => {
    await alta(VEHICULO_VALIDO);

    const imagenes = mocks.crearVehiculo.mock.calls[0][0].data.imagenes.create;

    expect(imagenes).toEqual([
      {
        url: "https://res.cloudinary.com/demo/image/upload/uno.jpg",
        esPrincipal: true,
        orden: 0,
      },
      {
        url: "https://res.cloudinary.com/demo/image/upload/dos.jpg",
        esPrincipal: false,
        orden: 1,
      },
    ]);
  });

  it("rechaza a quien no es administrador sin tocar la base", async () => {
    mocks.auth.mockResolvedValue({ user: { role: "USER" } });

    const resultado = await alta(VEHICULO_VALIDO);

    expect(resultado.error).toBe("No autorizado");
    expect(mocks.crearVehiculo).not.toHaveBeenCalled();
  });

  it("rechaza a quien no inició sesión", async () => {
    mocks.auth.mockResolvedValue(null);

    const resultado = await alta(VEHICULO_VALIDO);

    expect(resultado.error).toBe("No autorizado");
    expect(mocks.crearVehiculo).not.toHaveBeenCalled();
  });

  it("rechaza una imagen que no es del Cloudinary de la cuenta", async () => {
    const resultado = await alta({
      ...VEHICULO_VALIDO,
      imagenes: ["javascript:alert(1)"],
    });

    expect(resultado.error).toBe("Campos inválidos");
    expect(mocks.crearVehiculo).not.toHaveBeenCalled();
  });

  it("acepta una ruta del propio sitio como imagen", async () => {
    const resultado = await alta({ ...VEHICULO_VALIDO, imagenes: ["/banner.png"] });

    expect(resultado.success).toBeTruthy();
  });

  it("rechaza un precio negativo", async () => {
    const resultado = await alta({ ...VEHICULO_VALIDO, precio: -1 });

    expect(resultado.error).toBe("Campos inválidos");
    expect(mocks.crearVehiculo).not.toHaveBeenCalled();
  });

  it("no se queda sin respuesta si la base falla", async () => {
    mocks.crearVehiculo.mockRejectedValue(new Error("base caída"));

    const resultado = await alta(VEHICULO_VALIDO);

    expect(resultado.error).toBeTruthy();
  });
});
