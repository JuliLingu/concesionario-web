/**
 * Medición del interés por unidad.
 *
 * Dos cosas distintas se prueban acá. La primera es el criterio con el que se
 * le dice a un concesionario "esta unidad está cara": es una afirmación fuerte
 * sobre su negocio y tiene que salir de una regla que se pueda leer, no de una
 * corazonada enterrada en una consulta SQL. La segunda es el endpoint público
 * que alimenta esos números, que es lo único que separa un contador de visitas
 * de un contador de recargas.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ipUnica } from "./helpers/entorno";
import {
  DIAS_INMOVILIZADA,
  DIAS_MINIMOS_PARA_JUZGAR,
  VISTAS_PARA_JUZGAR_PRECIO,
  diaLocal,
  diasEnStock,
  promedio,
  senalesDeUnidad,
  type UnidadMedida,
} from "@/lib/metricas";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  registrarVista: vi.fn(),
  registrarClickWhatsapp: vi.fn(),
  ip: "10.0.0.0",
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));

vi.mock("@/services/metricas.service", () => ({
  registrarVista: mocks.registrarVista,
  registrarClickWhatsapp: mocks.registrarClickWhatsapp,
}));

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": mocks.ip }),
}));

import { POST } from "@/app/api/metricas/route";

// ── Reglas de lectura ────────────────────────────────────────────────────────

describe("diaLocal", () => {
  it("corta el día en la medianoche argentina, no en la UTC", () => {
    // 01:00 UTC del 11 son las 22:00 del 10 en Buenos Aires: la visita es del
    // día 10. Es la franja en la que la gente mira autos, así que si esto se
    // rompe el corte diario se lleva mal toda la ventana de medición.
    const laNocheDelDiez = new Date("2026-09-11T01:00:00Z");

    expect(diaLocal(laNocheDelDiez).toISOString()).toBe("2026-09-10T00:00:00.000Z");
  });
});

describe("diasEnStock", () => {
  it("cuenta los días desde el alta cuando la unidad sigue en el playón", () => {
    const alta = new Date("2026-06-12T15:00:00Z");
    const hoy = new Date("2026-09-10T12:00:00Z");

    expect(diasEnStock(alta, null, hoy)).toBe(90);
  });

  it("se detiene en la venta y no sigue corriendo", () => {
    const alta = new Date("2026-06-12T15:00:00Z");
    const venta = new Date("2026-07-02T10:00:00Z");
    const hoy = new Date("2026-09-10T12:00:00Z");

    expect(diasEnStock(alta, venta, hoy)).toBe(20);
  });

  it("cuenta un día calendario aunque pasen pocas horas", () => {
    // Cargada anoche, mirada esta mañana: un día, no cero.
    const anoche = new Date("2026-09-09T23:00:00Z");
    const hoy = new Date("2026-09-10T12:00:00Z");

    expect(diasEnStock(anoche, null, hoy)).toBe(1);
  });
});

describe("senalesDeUnidad", () => {
  const publicada = (extra: Partial<UnidadMedida> = {}): UnidadMedida => ({
    visibilidad: "PUBLICADA",
    diasEnStock: 30,
    vistas: 50,
    contactos: 4,
    ...extra,
  });

  it("no juzga una publicación recién subida", () => {
    const senales = senalesDeUnidad(
      publicada({ diasEnStock: DIAS_MINIMOS_PARA_JUZGAR - 1, vistas: 0, contactos: 0 }),
    );

    expect(senales).toEqual(["EN_MEDICION"]);
  });

  it("dice que está cara cuando la miran mucho y nadie pregunta", () => {
    const senales = senalesDeUnidad(
      publicada({ vistas: VISTAS_PARA_JUZGAR_PRECIO, contactos: 0 }),
    );

    expect(senales).toContain("MIRAN_Y_NO_PREGUNTAN");
  });

  it("no la acusa de cara con pocas visitas: cero consultas ahí no significa nada", () => {
    const senales = senalesDeUnidad(
      publicada({ vistas: VISTAS_PARA_JUZGAR_PRECIO - 1, contactos: 0 }),
    );

    expect(senales).not.toContain("MIRAN_Y_NO_PREGUNTAN");
  });

  it("un solo contacto alcanza para dejar de sospechar del precio", () => {
    const senales = senalesDeUnidad(publicada({ vistas: 500, contactos: 1 }));

    expect(senales).toEqual(["SIN_NOVEDAD"]);
  });

  it("avisa cuando no entra nadie a la ficha", () => {
    const senales = senalesDeUnidad(publicada({ vistas: 0, contactos: 0 }));

    expect(senales).toContain("NADIE_LA_MIRA");
    // Son excluyentes: o no la mira nadie, o la miran y no preguntan.
    expect(senales).not.toContain("MIRAN_Y_NO_PREGUNTAN");
  });

  it("suma el aviso de capital dormido a lo que ya venía mal", () => {
    const senales = senalesDeUnidad(
      publicada({ diasEnStock: DIAS_INMOVILIZADA, vistas: 0, contactos: 0 }),
    );

    expect(senales).toEqual(["NADIE_LA_MIRA", "INMOVILIZADA"]);
  });

  it("no mide lo que está fuera de la vidriera, pero le sigue corriendo el reloj", () => {
    const pausadaVieja = senalesDeUnidad({
      visibilidad: "PAUSADA",
      diasEnStock: DIAS_INMOVILIZADA + 10,
      vistas: 0,
      contactos: 0,
    });

    // Sin visitas porque nadie la puede ver: acusarla de "nadie la mira" sería
    // culparla de una decisión del propio concesionario.
    expect(pausadaVieja).toEqual(["PAUSADA", "INMOVILIZADA"]);
  });

  it("marca el borrador que quedó olvidado", () => {
    const senales = senalesDeUnidad({
      visibilidad: "SIN_PUBLICAR",
      diasEnStock: 40,
      vistas: 0,
      contactos: 0,
    });

    expect(senales).toEqual(["SIN_PUBLICAR"]);
  });

  it("nunca devuelve vacío", () => {
    expect(senalesDeUnidad(publicada())).toEqual(["SIN_NOVEDAD"]);
  });
});

describe("promedio", () => {
  it("devuelve null sin datos, en vez de un cero que se leería como una venta inmediata", () => {
    expect(promedio([])).toBeNull();
  });

  it("redondea", () => {
    expect(promedio([10, 11])).toBe(11);
  });
});

// ── Endpoint público ─────────────────────────────────────────────────────────

const avisar = (cuerpo: unknown) =>
  POST(
    new Request("http://localhost/api/metricas", {
      method: "POST",
      body: typeof cuerpo === "string" ? cuerpo : JSON.stringify(cuerpo),
    }),
  );

const VISTA = { vehiculoId: "veh1", evento: "vista" };

beforeEach(() => {
  mocks.ip = ipUnica();
  mocks.auth.mockResolvedValue(null);
  mocks.registrarVista.mockResolvedValue(undefined);
  mocks.registrarClickWhatsapp.mockResolvedValue(undefined);
  mocks.registrarVista.mockClear();
  mocks.registrarClickWhatsapp.mockClear();
});

describe("POST /api/metricas", () => {
  it("cuenta una visita a la ficha", async () => {
    const respuesta = await avisar(VISTA);

    expect(respuesta.status).toBe(204);
    expect(mocks.registrarVista).toHaveBeenCalledWith("veh1");
  });

  it("cuenta un click al botón de WhatsApp", async () => {
    await avisar({ vehiculoId: "veh1", evento: "whatsapp" });

    expect(mocks.registrarClickWhatsapp).toHaveBeenCalledWith("veh1");
  });

  it("no cuenta la misma visita dos veces desde el mismo origen", async () => {
    // Quien recarga la ficha mientras lo piensa no son dos interesados. Sin
    // esto, la unidad más dudada sería la que parece más buscada.
    await avisar(VISTA);
    await avisar(VISTA);

    expect(mocks.registrarVista).toHaveBeenCalledTimes(1);
  });

  it("otra unidad sí se cuenta aunque venga del mismo origen", async () => {
    await avisar(VISTA);
    await avisar({ ...VISTA, vehiculoId: "veh2" });

    expect(mocks.registrarVista).toHaveBeenCalledTimes(2);
  });

  it("otro visitante sí se cuenta", async () => {
    await avisar(VISTA);
    mocks.ip = ipUnica();
    await avisar(VISTA);

    expect(mocks.registrarVista).toHaveBeenCalledTimes(2);
  });

  it("no cuenta al administrador mirando su propio catálogo", async () => {
    mocks.auth.mockResolvedValue({ user: { role: "ADMIN" } });

    const respuesta = await avisar(VISTA);

    expect(respuesta.status).toBe(204);
    expect(mocks.registrarVista).not.toHaveBeenCalled();
  });

  it("descarta un evento que no existe", async () => {
    await avisar({ vehiculoId: "veh1", evento: "borrar" });

    expect(mocks.registrarVista).not.toHaveBeenCalled();
    expect(mocks.registrarClickWhatsapp).not.toHaveBeenCalled();
  });

  it("descarta un id que no tiene forma de id", async () => {
    await avisar({ vehiculoId: "veh1' OR 1=1 --", evento: "vista" });

    expect(mocks.registrarVista).not.toHaveBeenCalled();
  });

  it("no se cae con un cuerpo que no es JSON", async () => {
    const respuesta = await avisar("esto no es json");

    expect(respuesta.status).toBe(204);
    expect(mocks.registrarVista).not.toHaveBeenCalled();
  });

  it("responde siempre lo mismo, cuente o no cuente", async () => {
    // Distinguir "contado" de "descartado" solo le serviría a quien quiera
    // afinar el intento de inflar un contador.
    const contada = await avisar({ vehiculoId: "veh9", evento: "vista" });
    const descartada = await avisar({ vehiculoId: "veh9", evento: "vista" });

    expect(contada.status).toBe(descartada.status);
    expect(await contada.text()).toBe(await descartada.text());
  });
});
