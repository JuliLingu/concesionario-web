/**
 * Punto de entrada de las métricas del catálogo.
 *
 * Es una ruta y no una server action a propósito. Una server action hace que
 * Next vuelva a renderizar la ruta y devuelva su payload RSC: para contar un
 * entero eso es mucho trabajo por visita, y encima obligaría a la ficha a
 * renderizarse por request. Acá la respuesta es un 204 vacío, y del lado del
 * navegador se manda con `sendBeacon`, que sobrevive a que el visitante se vaya
 * de la página —justo lo que pasa al apretar el botón de WhatsApp—.
 *
 * De paso, que la medición sea del lado del cliente filtra sola a los robots:
 * un rastreador que pide el HTML y no ejecuta JavaScript no infla nada.
 */
import { auth } from "@/auth";
import { registrarClickWhatsapp, registrarVista } from "@/services/metricas.service";
import {
  REGLAS,
  esperaRestante,
  ipDelCliente,
  registrarIntento,
} from "@/lib/rate-limit";

const EVENTOS = {
  vista: registrarVista,
  whatsapp: registrarClickWhatsapp,
} as const;

type Evento = keyof typeof EVENTOS;

/** Los ids son cuid: letras y números. Corta cualquier cosa rara antes de la base. */
const ID_VALIDO = /^[A-Za-z0-9_-]{1,64}$/;

/**
 * Siempre 204, cuente o no cuente.
 *
 * El endpoint es público y nadie del otro lado hace nada con la respuesta.
 * Distinguir "contado" de "descartado" solo serviría para que alguien afine el
 * intento de inflar un contador.
 */
function sinContenido(): Response {
  return new Response(null, { status: 204 });
}

export async function POST(request: Request): Promise<Response> {
  // `sendBeacon` manda el cuerpo como texto plano, así que se parsea a mano en
  // lugar de confiar en el content-type.
  let cuerpo: unknown;
  try {
    cuerpo = JSON.parse(await request.text());
  } catch {
    return sinContenido();
  }

  const { vehiculoId, evento } = (cuerpo ?? {}) as { vehiculoId?: unknown; evento?: unknown };

  if (typeof vehiculoId !== "string" || !ID_VALIDO.test(vehiculoId)) return sinContenido();
  if (typeof evento !== "string" || !(evento in EVENTOS)) return sinContenido();

  // El administrador revisando su propio catálogo no es interés de mercado. Sin
  // esto, la unidad que más mira el dueño sería la que "más se busca".
  const sesion = await auth();
  if (sesion?.user?.role === "ADMIN") return sinContenido();

  // Una visita y un click por unidad, origen y media hora.
  const clave = `metrica:${evento}:${vehiculoId}:${await ipDelCliente()}`;
  if (esperaRestante(clave, REGLAS.METRICA_POR_UNIDAD) > 0) return sinContenido();
  registrarIntento(clave, REGLAS.METRICA_POR_UNIDAD);

  await EVENTOS[evento as Evento](vehiculoId);

  return sinContenido();
}
