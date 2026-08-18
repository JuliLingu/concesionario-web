/**
 * Flujo crítico: el panel pide permiso para subir una foto a Cloudinary.
 *
 * Esta acción existe porque antes el panel subía con un preset sin firmar cuyo
 * nombre viajaba en el bundle: cualquier visitante podía leerlo y escribir en
 * la cuenta del cliente. Lo que se protege acá es que eso no vuelva — que la
 * firma siga siendo por administrador, que el api_secret no salga nunca en la
 * respuesta, y que cada permiso valga para un único destino.
 */
import { createHash } from "crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ auth: vi.fn() }));

vi.mock("@/auth", () => ({ auth: mocks.auth }));

import { firmarSubida } from "@/actions/upload";

const CREDENCIALES = {
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "concesionaria-demo",
  CLOUDINARY_API_KEY: "123456789",
  CLOUDINARY_API_SECRET: "secreto-que-no-debe-salir",
};

beforeEach(() => {
  mocks.auth.mockResolvedValue({ user: { role: "ADMIN" } });
  Object.assign(process.env, CREDENCIALES);
});

afterEach(() => {
  for (const clave of Object.keys(CREDENCIALES)) delete process.env[clave];
});

describe("firmarSubida", () => {
  it("le da credenciales al administrador", async () => {
    const resultado = await firmarSubida();

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.credenciales.cloudName).toBe("concesionaria-demo");
    expect(resultado.credenciales.apiKey).toBe("123456789");
    expect(resultado.credenciales.publicId).toMatch(/^concesionario\//);
  });

  it("no firma para quien no es administrador", async () => {
    mocks.auth.mockResolvedValue({ user: { role: "USER" } });

    const resultado = await firmarSubida();

    expect(resultado).toEqual({ ok: false, error: "No autorizado" });
  });

  it("no firma para quien no inició sesión", async () => {
    mocks.auth.mockResolvedValue(null);

    const resultado = await firmarSubida();

    expect(resultado.ok).toBe(false);
  });

  it("el api_secret no aparece en la respuesta", async () => {
    const resultado = await firmarSubida();

    expect(JSON.stringify(resultado)).not.toContain(CREDENCIALES.CLOUDINARY_API_SECRET);
  });

  it("la firma es la que Cloudinary va a validar", async () => {
    const resultado = await firmarSubida();
    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    const { allowedFormats, publicId, timestamp, signature } = resultado.credenciales;

    // Se recalcula con el mismo criterio que documenta Cloudinary: parámetros
    // firmados ordenados alfabéticamente, unidos por &, con el api_secret
    // pegado al final. Si alguien cambia qué se firma, esto lo detecta.
    const esperada = createHash("sha1")
      .update(
        `allowed_formats=${allowedFormats}&public_id=${publicId}&timestamp=${timestamp}` +
          CREDENCIALES.CLOUDINARY_API_SECRET,
      )
      .digest("hex");

    expect(signature).toBe(esperada);
  });

  it("cada permiso vale para un destino distinto", async () => {
    const primera = await firmarSubida();
    const segunda = await firmarSubida();

    expect(primera.ok && segunda.ok).toBe(true);
    if (!primera.ok || !segunda.ok) return;

    expect(primera.credenciales.publicId).not.toBe(segunda.credenciales.publicId);
    expect(primera.credenciales.signature).not.toBe(segunda.credenciales.signature);
  });

  it("avisa en lugar de firmar con credenciales a medias", async () => {
    delete process.env.CLOUDINARY_API_SECRET;
    const silencio = vi.spyOn(console, "error").mockImplementation(() => {});

    const resultado = await firmarSubida();

    expect(resultado.ok).toBe(false);
    silencio.mockRestore();
  });
});
