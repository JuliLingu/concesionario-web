/**
 * Avisos internos al concesionario.
 *
 * Antes de esto, una consulta entraba, se guardaba y se quedaba esperando a que
 * alguien se acordara de abrir el panel. Un vendedor que no mira la bandeja
 * durante dos días pierde la venta y no se entera de que la perdió.
 *
 * Los avisos se disparan con `after()` desde la acción, así que todo lo de acá
 * corre con la respuesta ya enviada al visitante: el formulario le confirma al
 * instante y el correo sale después. Por eso mismo se puede buscar el vehículo
 * en la base sin que eso le cueste tiempo de espera a nadie.
 */
import { prisma } from "@/lib/prisma";
import { getConfiguracion } from "@/services/configuracion.service";
import { destinatarioDeAvisos, enviarMail, mailConfigurado } from "@/lib/mail";
import { registrarError } from "@/lib/log";

/**
 * Base pública del sitio, para poder enlazar al panel desde el correo.
 *
 * `VERCEL_PROJECT_PRODUCTION_URL` la publica la plataforma sola y apunta
 * siempre al dominio de producción, no al despliegue de turno. `APP_URL` la
 * pisa cuando el sitio corre en un contenedor propio, que es el despliegue
 * recomendado. Sin ninguna de las dos el aviso sale igual, solo que sin enlace.
 */
function baseDelSitio(): string | null {
  const propia = process.env.APP_URL?.trim();
  if (propia) return propia.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  return vercel ? `https://${vercel}` : null;
}

function enlaceAlPanel(ruta: string): string | null {
  const base = baseDelSitio();
  return base ? `${base}${ruta}` : null;
}

/**
 * Escapado de HTML.
 *
 * El cuerpo del aviso lleva texto que escribió un desconocido en un formulario
 * público. Sin esto, cualquiera puede mandar una consulta con etiquetas dentro
 * y lo que llega a la bandeja del concesionario es un correo con enlaces que él
 * no puso. La versión en texto plano no lo necesita.
 */
function escapar(valor: string): string {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Descripción corta del vehículo, o null si la consulta era general. */
async function describirVehiculo(vehiculoId: string | null): Promise<string | null> {
  if (!vehiculoId) return null;

  try {
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { id: vehiculoId },
      select: { marca: true, modelo: true, anio: true },
    });
    if (!vehiculo) return null;
    return `${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.anio})`;
  } catch (error) {
    // Un aviso sin el modelo del auto sigue sirviendo; uno que no sale, no.
    registrarError("describirVehiculo", error);
    return null;
  }
}

/** Filas "Etiqueta: valor", salteando las que no tienen dato cargado. */
type Fila = [etiqueta: string, valor: string | null | undefined];

function cuerpoTexto(filas: Fila[], enlace: string | null): string {
  const lineas = filas
    .filter(([, valor]) => valor)
    .map(([etiqueta, valor]) => `${etiqueta}: ${valor}`);

  if (enlace) lineas.push("", `Verlo en el panel: ${enlace}`);
  return lineas.join("\n");
}

function cuerpoHtml(filas: Fila[], enlace: string | null): string {
  const items = filas
    .filter(([, valor]) => valor)
    .map(
      ([etiqueta, valor]) =>
        `<p style="margin:0 0 8px"><strong>${escapar(etiqueta)}:</strong> ${escapar(
          String(valor),
        )}</p>`,
    )
    .join("");

  const pie = enlace
    ? `<p style="margin:20px 0 0"><a href="${escapar(enlace)}">Verlo en el panel</a></p>`
    : "";

  return `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5;color:#1a1c1e">${items}${pie}</div>`;
}

/**
 * Resuelve destinatario y nombre de la concesionaria, o null si no hay a quién
 * escribirle. Común a los dos avisos.
 */
async function preparar(): Promise<{ destino: string; nombre: string } | null> {
  if (!mailConfigurado()) return null;

  const config = await getConfiguracion();
  const destino = destinatarioDeAvisos(config.email);

  if (!destino) {
    // Pasa en una instalación a medio configurar: hay credenciales de envío
    // pero nadie cargó todavía el email de contacto en el panel.
    console.warn("[avisos] hay credenciales de correo pero no hay destinatario cargado");
    return null;
  }

  return { destino, nombre: config.nombreConcesionaria };
}

export type DatosConsulta = {
  nombre: string;
  email: string;
  telefono?: string | null;
  mensaje?: string | null;
  vehiculoId: string | null;
};

/**
 * Aviso de consulta nueva llegada desde el catálogo.
 *
 * No lanza nunca: corre dentro de `after()`, con la respuesta ya entregada, así
 * que un error acá no tiene a quién avisarle más que al log.
 */
export async function avisarConsulta(datos: DatosConsulta): Promise<void> {
  try {
    const destinatario = await preparar();
    if (!destinatario) return;

    const vehiculo = await describirVehiculo(datos.vehiculoId);

    const filas: Fila[] = [
      ["Nombre", datos.nombre],
      ["Email", datos.email],
      ["Teléfono", datos.telefono],
      ["Vehículo", vehiculo ?? "Consulta general"],
      ["Mensaje", datos.mensaje],
    ];

    const enlace = enlaceAlPanel("/dashboard/consultas");

    await enviarMail(destinatario.destino, {
      asunto: vehiculo
        ? `Nueva consulta por ${vehiculo} — ${datos.nombre}`
        : `Nueva consulta de ${datos.nombre}`,
      texto: cuerpoTexto(filas, enlace),
      html: cuerpoHtml(filas, enlace),
      // Responder desde el correo le contesta a quien consultó, no al sitio.
      responderA: datos.email,
    });
  } catch (error) {
    registrarError("avisarConsulta", error);
  }
}

export type DatosSolicitud = {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  cuotas: number;
  vehiculoId: string | null;
};

/**
 * Aviso de solicitud de financiación nueva.
 *
 * Va a propósito sin DNI ni ingresos declarados, aunque la solicitud los
 * traiga. El correo sale del servidor, cruza un proveedor externo y queda
 * guardado en una bandeja que se sincroniza con teléfonos: no es el lugar
 * donde poner el documento y el sueldo de alguien. Para eso está el panel, que
 * al menos pide iniciar sesión. El aviso dice que hay una solicitud y con qué
 * datos de contacto llamar; el resto se mira adentro.
 */
export async function avisarSolicitud(datos: DatosSolicitud): Promise<void> {
  try {
    const destinatario = await preparar();
    if (!destinatario) return;

    const vehiculo = await describirVehiculo(datos.vehiculoId);
    const nombreCompleto = `${datos.nombre} ${datos.apellido}`;

    const filas: Fila[] = [
      ["Solicitante", nombreCompleto],
      ["Email", datos.email],
      ["Teléfono", datos.telefono],
      ["Vehículo", vehiculo ?? "Sin unidad asociada"],
      ["Cuotas pedidas", String(datos.cuotas)],
    ];

    const enlace = enlaceAlPanel("/dashboard/solicitudes");

    await enviarMail(destinatario.destino, {
      asunto: `Nueva solicitud de financiación — ${nombreCompleto}`,
      texto: [
        cuerpoTexto(filas, enlace),
        "",
        "El DNI y los ingresos declarados quedan solo en el panel.",
      ].join("\n"),
      html: `${cuerpoHtml(filas, enlace)}<p style="font-family:system-ui,sans-serif;font-size:13px;color:#605a5b;margin:16px 0 0">El DNI y los ingresos declarados quedan solo en el panel.</p>`,
      responderA: datos.email,
    });
  } catch (error) {
    registrarError("avisarSolicitud", error);
  }
}
