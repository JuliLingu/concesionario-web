/**
 * Búsqueda con IA, del lado de Next.
 *
 * El servicio de IA es otro despliegue, se paga por uso y puede estar caído o
 * arrancando en frío. Lo que se prueba acá es que nada de eso le llegue al
 * visitante como una página rota, que no se pueda gastar la cuenta de AWS a
 * fuerza de recargar, y que el inventario que se le entrega al servicio no
 * diga más de lo que el sitio decidió mostrar.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ipUnica } from "./helpers/entorno";

const mocks = vi.hoisted(() => ({
  ip: "10.0.0.0",
  getConfiguracion: vi.fn(),
  categorias: vi.fn(),
  vehiculos: vi.fn(),
}));

vi.mock("next/cache", () => ({
  unstable_cache: (fn: unknown) => fn,
  revalidateTag: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": mocks.ip }),
}));

vi.mock("@/services/configuracion.service", () => ({
  getConfiguracion: mocks.getConfiguracion,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    categoria: { findMany: mocks.categorias },
    vehiculo: { findMany: mocks.vehiculos },
  },
}));

import { textoDeBusquedaIa } from "@/lib/busqueda";
import { consultarBusquedaIa } from "@/lib/busqueda-ia";
import { buscarConIa } from "@/services/busqueda-ia.service";
import { GET as inventario } from "@/app/api/ia/inventario/route";

const RESPUESTA_OK = {
  consulta: "suv hasta 45 millones",
  filtros: { precioMax: 45_000_000, moneda: "ARS", categoria: "suv", transmision: null },
  resultados: [
    { id: "b", score: 0.8 },
    { id: "a", score: 0.5 },
  ],
  respuesta: null,
};

function responder(cuerpo: unknown, status = 200) {
  return vi.fn(async () => new Response(JSON.stringify(cuerpo), { status }));
}

beforeEach(() => {
  mocks.ip = ipUnica();
  vi.stubEnv("AI_SEARCH_URL", "https://ia.ejemplo.com/");
  vi.stubEnv("AI_SEARCH_API_KEY", "clave");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

// ── Normalización ────────────────────────────────────────────────────────────

describe("textoDeBusquedaIa", () => {
  it("colapsa espacios y conserva la frase entera", () => {
    expect(textoDeBusquedaIa("  suv   familiar  hasta 45 millones ")).toBe(
      "suv familiar hasta 45 millones",
    );
  });

  it("descarta lo que es demasiado corto para interpretar", () => {
    expect(textoDeBusquedaIa("ab")).toBe("");
    expect(textoDeBusquedaIa(undefined)).toBe("");
  });

  it("recorta lo que puede pedir una URL escrita a mano", () => {
    expect(textoDeBusquedaIa("a".repeat(1000))).toHaveLength(200);
  });

  // El cuadro de búsqueda compara lo que puso en la URL con lo que vuelve del
  // servidor; si normalizar no fuera idempotente, el input se pisaría solo.
  it("es estable", () => {
    const una = textoDeBusquedaIa(" pickup  diésel ");
    expect(textoDeBusquedaIa(una)).toBe(una);
  });
});

// ── Cliente del servicio ─────────────────────────────────────────────────────

describe("consultarBusquedaIa", () => {
  it("manda la clave y devuelve los ids en el orden del servicio", async () => {
    const fetch = responder(RESPUESTA_OK);
    vi.stubGlobal("fetch", fetch);

    const resultado = await consultarBusquedaIa("suv hasta 45 millones");

    expect(resultado.ids).toEqual(["b", "a"]);
    expect(resultado.filtros.categoria).toBe("suv");

    const [url, opciones] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://ia.ejemplo.com/search");
    expect((opciones.headers as Record<string, string>)["X-Api-Key"]).toBe("clave");
  });

  it("rechaza una respuesta con otra forma en vez de dejarla pasar", async () => {
    vi.stubGlobal("fetch", responder({ resultados: [{ vehiculo: "x" }] }));
    await expect(consultarBusquedaIa("suv familiar")).rejects.toThrow();
  });

  it("falla si el servicio responde con error", async () => {
    vi.stubGlobal("fetch", responder({ detail: "Error" }, 502));
    await expect(consultarBusquedaIa("suv familiar")).rejects.toThrow();
  });

  it("sin servicio configurado no intenta nada", async () => {
    vi.stubEnv("AI_SEARCH_URL", "");
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);

    await expect(consultarBusquedaIa("suv familiar")).rejects.toThrow();
    expect(fetch).not.toHaveBeenCalled();
  });
});

// ── Lo que ve la página ──────────────────────────────────────────────────────

describe("buscarConIa", () => {
  it("devuelve los ids cuando el servicio contesta", async () => {
    vi.stubGlobal("fetch", responder(RESPUESTA_OK));
    expect(await buscarConIa("suv hasta 45 millones")).toMatchObject({
      estado: "ok",
      ids: ["b", "a"],
    });
  });

  it("convierte una caída o un timeout en 'no disponible', sin lanzar", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new DOMException("The operation was aborted due to timeout", "TimeoutError");
    }));
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(await buscarConIa("suv familiar")).toEqual({ estado: "no-disponible" });
  });

  it("corta al superar el cupo de búsquedas distintas por origen", async () => {
    vi.stubGlobal("fetch", responder(RESPUESTA_OK));

    for (let i = 0; i < 20; i++) {
      expect((await buscarConIa(`suv familiar ${i}`)).estado).toBe("ok");
    }
    expect(await buscarConIa("una más")).toEqual({ estado: "limite" });
  });

  // El paginado vuelve a renderizar la búsqueda: si cada página consumiera
  // cupo, alguien que mira cinco páginas gastaría cinco búsquedas.
  it("repetir la misma frase no consume cupo", async () => {
    vi.stubGlobal("fetch", responder(RESPUESTA_OK));

    for (let i = 0; i < 19; i++) await buscarConIa(`sedan ${i}`);
    for (let i = 0; i < 10; i++) {
      expect((await buscarConIa("suv familiar")).estado).toBe("ok");
    }
    expect((await buscarConIa("otra frase")).estado).toBe("limite");
  });

  it("sin servicio configurado no cuenta nada", async () => {
    vi.stubEnv("AI_SEARCH_API_KEY", "");
    expect(await buscarConIa("suv familiar")).toEqual({ estado: "no-disponible" });
  });
});

// ── Inventario para el servicio ──────────────────────────────────────────────

describe("GET /api/ia/inventario", () => {
  const SECRETO = "secreto-del-inventario";

  const pedir = (autorizacion?: string) =>
    inventario(
      new Request("http://localhost/api/ia/inventario", {
        headers: autorizacion ? { authorization: autorizacion } : {},
      }),
    );

  const unidad = (extra: Record<string, unknown>) => ({
    id: "v1",
    marca: "Toyota",
    modelo: "Corolla",
    version: "XEI",
    anio: 2024,
    estado: "USADO",
    kilometraje: 10000,
    transmision: "CVT",
    combustible: "NAFTA",
    descripcion: "Impecable",
    precio: 20000,
    moneda: "USD",
    categoria: { slug: "sedan" },
    ...extra,
  });

  beforeEach(() => {
    vi.stubEnv("AI_INVENTARIO_SECRET", SECRETO);
    mocks.categorias.mockResolvedValue([{ slug: "sedan" }, { slug: "suv" }]);
    mocks.getConfiguracion.mockResolvedValue({ mostrarPrecios: true, cotizacionDolar: 1000 });
  });

  it("rechaza sin secreto o con uno equivocado", async () => {
    expect((await pedir()).status).toBe(401);
    expect((await pedir("Bearer otro")).status).toBe(401);
    expect((await pedir(SECRETO)).status).toBe(401);
    expect(mocks.vehiculos).not.toHaveBeenCalled();
  });

  it("sin secreto configurado la ruta queda cerrada", async () => {
    vi.stubEnv("AI_INVENTARIO_SECRET", "");
    expect((await pedir("Bearer ")).status).toBe(401);
  });

  it("entrega solo lo publicado, con el precio en pesos", async () => {
    mocks.vehiculos.mockResolvedValue([unidad({})]);

    const cuerpo = await (await pedir(`Bearer ${SECRETO}`)).json();

    expect(mocks.vehiculos.mock.calls[0][0].where).toEqual({ publicacion: "PUBLICADO" });
    expect(cuerpo.categorias).toEqual(["sedan", "suv"]);
    expect(cuerpo.vehiculos[0]).toMatchObject({ categoria: "sedan", precioArs: 20_000_000 });
    expect(cuerpo.vehiculos[0]).not.toHaveProperty("precio");
    expect(cuerpo.vehiculos[0]).not.toHaveProperty("moneda");
  });

  it("sin cotización, una unidad en dólares viaja sin precio", async () => {
    mocks.getConfiguracion.mockResolvedValue({ mostrarPrecios: true, cotizacionDolar: null });
    mocks.vehiculos.mockResolvedValue([unidad({})]);

    const cuerpo = await (await pedir(`Bearer ${SECRETO}`)).json();
    expect(cuerpo.vehiculos[0].precioArs).toBeNull();
  });

  it("con los precios ocultos no viaja ninguno", async () => {
    mocks.getConfiguracion.mockResolvedValue({ mostrarPrecios: false, cotizacionDolar: 1000 });
    mocks.vehiculos.mockResolvedValue([unidad({ moneda: "ARS", precio: 30_000_000 })]);

    const cuerpo = await (await pedir(`Bearer ${SECRETO}`)).json();
    expect(cuerpo.preciosVisibles).toBe(false);
    expect(cuerpo.vehiculos[0].precioArs).toBeNull();
  });
});
