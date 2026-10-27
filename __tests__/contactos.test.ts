/**
 * `vincularContacto` y `agregarNota`: lo que agenda a la persona detrás de un
 * pedido y lo que el equipo anota de ella.
 *
 * Lo que se cuida: que vincular nunca haga fallar el formulario público, que
 * dos pedidos simultáneos del mismo email no terminen en dos contactos ni en un
 * error, y que las notas internas solo las escriba un administrador.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ResultadoAccion } from "./helpers/entorno";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  upsert: vi.fn(),
  buscarContacto: vi.fn(),
  crearNota: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/log", () => ({ registrarError: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    contacto: { upsert: mocks.upsert, findUnique: mocks.buscarContacto },
    notaContacto: { create: mocks.crearNota },
  },
}));

import { Prisma } from "../generated/prisma";
import { vincularContacto } from "@/services/contactos.service";
import { agregarNota } from "@/actions/contactos";

const duplicado = () =>
  new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
    code: "P2002",
    clientVersion: "test",
  });

beforeEach(() => {
  mocks.auth.mockResolvedValue({ user: { role: "ADMIN", name: "Julián" } });
  mocks.upsert.mockResolvedValue({ id: "cto_1" });
  mocks.buscarContacto.mockResolvedValue({ id: "cto_1" });
  mocks.crearNota.mockResolvedValue({ id: "nota_1" });
});

describe("vincularContacto", () => {
  it("busca por el email normalizado", async () => {
    const id = await vincularContacto({ email: " Ana@Ejemplo.com", nombre: "Ana", telefono: "+5491155550000" });

    expect(id).toBe("cto_1");
    expect(mocks.upsert.mock.calls[0][0].where).toEqual({ email: "ana@ejemplo.com" });
  });

  it("si otro pedido lo creó al mismo tiempo, devuelve ese contacto", async () => {
    mocks.upsert.mockRejectedValue(duplicado());
    mocks.buscarContacto.mockResolvedValue({ id: "cto_otro" });

    expect(await vincularContacto({ email: "ana@ejemplo.com", nombre: "Ana" })).toBe("cto_otro");
  });

  it("ante cualquier otra falla devuelve null en vez de lanzar", async () => {
    mocks.upsert.mockRejectedValue(new Error("base caída"));

    await expect(vincularContacto({ email: "ana@ejemplo.com", nombre: "Ana" })).resolves.toBeNull();
  });
});

describe("agregarNota", () => {
  const nota = (texto = "Llamé, no atendió") =>
    agregarNota({ contactoId: "cto_1", texto }) as Promise<ResultadoAccion>;

  it("guarda la nota con el nombre de quien la escribió", async () => {
    const resultado = await nota("  Viene el sábado  ");

    expect(resultado.success).toBe(true);
    expect(mocks.crearNota.mock.calls[0][0].data).toEqual({
      contactoId: "cto_1",
      texto: "Viene el sábado",
      autor: "Julián",
    });
  });

  it("rechaza a quien no es administrador sin tocar la base", async () => {
    mocks.auth.mockResolvedValue({ user: { role: "USER" } });

    expect((await nota()).error).toBe("No autorizado");
    expect(mocks.crearNota).not.toHaveBeenCalled();
  });

  it("no guarda una nota vacía", async () => {
    expect((await nota("   ")).error).toBeTruthy();
    expect(mocks.crearNota).not.toHaveBeenCalled();
  });

  it("no cuelga una nota de un contacto que no existe", async () => {
    mocks.buscarContacto.mockResolvedValue(null);

    expect((await nota()).error).toBeTruthy();
    expect(mocks.crearNota).not.toHaveBeenCalled();
  });
});
