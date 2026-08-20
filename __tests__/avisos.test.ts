/**
 * Aviso al concesionario cuando entra una consulta o una solicitud.
 *
 * Se prueba de punta a punta contra el `fetch` que habla con el proveedor de
 * correo, así que cubre también el armado del mensaje. Lo que se cuida acá:
 * que sin credenciales el sitio siga funcionando sin avisos, que el texto que
 * escribió un desconocido no llegue a la bandeja como HTML vivo, y que el DNI
 * y los ingresos de una solicitud no salgan por correo.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getConfiguracion: vi.fn(),
  buscarVehiculo: vi.fn(),
}));

vi.mock("@/services/configuracion.service", () => ({
  getConfiguracion: mocks.getConfiguracion,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { vehiculo: { findUnique: mocks.buscarVehiculo } },
}));

import { avisarConsulta, avisarSolicitud } from "@/services/avisos.service";

const CONSULTA = {
  nombre: "Ana Gómez",
  email: "ana@ejemplo.com",
  telefono: "1155550000",
  mensaje: "¿Sigue disponible?",
  vehiculoId: "veh_1",
};

const SOLICITUD = {
  nombre: "Ana",
  apellido: "Gómez",
  email: "ana@ejemplo.com",
  telefono: "1155550000",
  cuotas: 24,
  vehiculoId: "veh_1",
};

let peticiones: Array<Record<string, unknown>>;

/** Cuerpo JSON de la última llamada al proveedor de correo. */
function ultimoEnvio() {
  return peticiones[peticiones.length - 1];
}

beforeEach(() => {
  peticiones = [];

  process.env.RESEND_API_KEY = "clave-de-prueba";
  process.env.MAIL_FROM = "Avisos <avisos@concesionaria.test>";
  delete process.env.MAIL_TO;
  delete process.env.APP_URL;

  mocks.getConfiguracion.mockResolvedValue({
    email: "ventas@concesionaria.test",
    nombreConcesionaria: "Autos del Sur",
  });

  mocks.buscarVehiculo.mockResolvedValue({
    marca: "Toyota",
    modelo: "Corolla",
    anio: 2021,
  });

  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, opciones: { body: string }) => {
      peticiones.push(JSON.parse(opciones.body));
      return new Response("{}", { status: 200 });
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.RESEND_API_KEY;
  delete process.env.MAIL_FROM;
});

describe("avisarConsulta", () => {
  it("manda el aviso al email cargado en el panel", async () => {
    await avisarConsulta(CONSULTA);

    expect(peticiones).toHaveLength(1);
    expect(ultimoEnvio().to).toEqual(["ventas@concesionaria.test"]);
    expect(ultimoEnvio().from).toBe("Avisos <avisos@concesionaria.test>");
  });

  it("nombra la unidad en el asunto", async () => {
    await avisarConsulta(CONSULTA);

    expect(ultimoEnvio().subject).toBe("Nueva consulta por Toyota Corolla (2021) — Ana Gómez");
  });

  it("distingue la consulta general de la que es por una unidad", async () => {
    await avisarConsulta({ ...CONSULTA, vehiculoId: null });

    expect(ultimoEnvio().subject).toBe("Nueva consulta de Ana Gómez");
    expect(ultimoEnvio().text).toContain("Consulta general");
    expect(mocks.buscarVehiculo).not.toHaveBeenCalled();
  });

  it("responder desde el correo le contesta a quien consultó", async () => {
    await avisarConsulta(CONSULTA);

    expect(ultimoEnvio().reply_to).toBe("ana@ejemplo.com");
  });

  it("incluye los datos de contacto y el mensaje", async () => {
    await avisarConsulta(CONSULTA);

    const texto = String(ultimoEnvio().text);
    expect(texto).toContain("ana@ejemplo.com");
    expect(texto).toContain("1155550000");
    expect(texto).toContain("¿Sigue disponible?");
  });

  it("enlaza al panel cuando se sabe la dirección del sitio", async () => {
    process.env.APP_URL = "https://autosdelsur.test/";

    await avisarConsulta(CONSULTA);

    // Sin barra repetida aunque APP_URL venga con una al final.
    expect(ultimoEnvio().text).toContain("https://autosdelsur.test/dashboard/consultas");
  });

  it("no escribe HTML vivo con lo que mandó un desconocido", async () => {
    await avisarConsulta({
      ...CONSULTA,
      nombre: '<img src=x onerror="alert(1)">',
      mensaje: "<script>robar()</script>",
    });

    const html = String(ultimoEnvio().html);
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;script&gt;");
  });

  it("sin credenciales no manda nada y no falla", async () => {
    delete process.env.RESEND_API_KEY;

    await expect(avisarConsulta(CONSULTA)).resolves.toBeUndefined();
    expect(peticiones).toHaveLength(0);
  });

  it("sin destinatario cargado no manda nada y no falla", async () => {
    mocks.getConfiguracion.mockResolvedValue({
      email: "",
      nombreConcesionaria: "Autos del Sur",
    });
    const silencio = vi.spyOn(console, "warn").mockImplementation(() => {});

    await expect(avisarConsulta(CONSULTA)).resolves.toBeUndefined();

    expect(peticiones).toHaveLength(0);
    expect(silencio).toHaveBeenCalled();
    silencio.mockRestore();
  });

  it("MAIL_TO desvía los avisos sin tocar lo que ve el público", async () => {
    process.env.MAIL_TO = "prueba@midominio.test";

    await avisarConsulta(CONSULTA);

    expect(ultimoEnvio().to).toEqual(["prueba@midominio.test"]);
  });

  it("un proveedor caído no propaga el error", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("sin cuota", { status: 429 })));
    const silencio = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(avisarConsulta(CONSULTA)).resolves.toBeUndefined();

    silencio.mockRestore();
  });

  it("avisa igual si no se pudo leer el vehículo", async () => {
    mocks.buscarVehiculo.mockRejectedValue(new Error("base caída"));
    const silencio = vi.spyOn(console, "error").mockImplementation(() => {});

    await avisarConsulta(CONSULTA);

    expect(peticiones).toHaveLength(1);
    expect(ultimoEnvio().subject).toBe("Nueva consulta de Ana Gómez");
    silencio.mockRestore();
  });
});

describe("avisarSolicitud", () => {
  it("manda el aviso con los datos para poder llamar", async () => {
    await avisarSolicitud(SOLICITUD);

    const texto = String(ultimoEnvio().text);
    expect(ultimoEnvio().subject).toBe("Nueva solicitud de financiación — Ana Gómez");
    expect(texto).toContain("ana@ejemplo.com");
    expect(texto).toContain("1155550000");
    expect(texto).toContain("Toyota Corolla (2021)");
  });

  it("no saca por correo el DNI ni los ingresos declarados", async () => {
    // Se pasan aunque el tipo no los pida: si alguien los agregara al aviso,
    // esta prueba lo detecta antes de que salgan de la red del cliente.
    await avisarSolicitud({
      ...SOLICITUD,
      ...({ dni: "30111222", ingresos: 1500000 } as Record<string, unknown>),
    });

    const enviado = JSON.stringify(ultimoEnvio());
    expect(enviado).not.toContain("30111222");
    expect(enviado).not.toContain("1500000");
  });
});
