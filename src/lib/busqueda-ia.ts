/**
 * Cliente del buscador con IA (`ai-search`, servicio Python aparte).
 *
 * El servicio interpreta una búsqueda escrita en lenguaje natural ("SUV
 * automática hasta 45 millones") y devuelve los ids de las unidades que
 * coinciden, ordenados por parecido. No devuelve vehículos: la página los vuelve
 * a leer de la base, que es la fuente de verdad para imágenes, precio vigente y
 * estado de publicación.
 *
 * Todo lo de acá corre solo en el servidor —la clave nunca llega al navegador—
 * y cualquier falla del servicio se traduce en un error que quien llama
 * convierte en "no disponible". Que la IA se caiga no puede romper el catálogo.
 */

import * as z from "zod";
import { Combustible, EstadoVehiculo } from "../../generated/prisma";

/**
 * El servicio en Lambda puede estar arrancando en frío. Pasado este tiempo se
 * abandona y el catálogo sigue sin IA: más espera es una página en blanco.
 */
const TIEMPO_MAXIMO_MS = 3000;

/** Reindexar embeddea las unidades nuevas: se le da más margen que a una búsqueda. */
const TIEMPO_MAXIMO_REINDEXADO_MS = 15_000;

const FiltrosIaSchema = z.object({
  precioMax: z.number().nullish(),
  precioMin: z.number().nullish(),
  anioMin: z.number().int().nullish(),
  kmMax: z.number().int().nullish(),
  categoria: z.string().nullish(),
  combustible: z.enum(Combustible).nullish(),
  transmision: z.enum(["MANUAL", "AUTOMATICA"]).nullish(),
  estado: z.enum(EstadoVehiculo).nullish(),
});

/** Lo que el servicio entendió de la búsqueda, para mostrárselo al visitante. */
export type FiltrosIa = z.infer<typeof FiltrosIaSchema>;

/**
 * Se valida la respuesta aunque el servicio sea nuestro: es otro despliegue,
 * con su propio ritmo de cambios, y un campo renombrado allá no puede llegar
 * como `undefined` a la consulta de Prisma de acá.
 */
const RespuestaSchema = z.object({
  filtros: FiltrosIaSchema,
  resultados: z
    .array(z.object({ id: z.string().min(1).max(64), score: z.number() }))
    .max(2000),
});

export type ResultadoBusquedaIa = { ids: string[]; filtros: FiltrosIa };

type ConfiguracionServicio = { url: string; apiKey: string };

/**
 * Dirección y clave del servicio. Sin las dos, la búsqueda con IA no existe:
 * así una instalación sin el servicio —o la CI— no necesita configurar nada.
 */
export function configuracionBusquedaIa(): ConfiguracionServicio | null {
  const url = process.env.AI_SEARCH_URL?.trim().replace(/\/+$/, "");
  const apiKey = process.env.AI_SEARCH_API_KEY?.trim();
  return url && apiKey ? { url, apiKey } : null;
}

async function llamarServicio(
  ruta: string,
  cuerpo: unknown,
  tiempoMaximoMs: number,
): Promise<unknown> {
  const servicio = configuracionBusquedaIa();
  if (!servicio) throw new Error("Búsqueda con IA sin configurar");

  const respuesta = await fetch(`${servicio.url}${ruta}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Api-Key": servicio.apiKey },
    body: JSON.stringify(cuerpo),
    cache: "no-store",
    signal: AbortSignal.timeout(tiempoMaximoMs),
  });

  if (!respuesta.ok) throw new Error(`El buscador con IA respondió ${respuesta.status}`);
  return respuesta.json();
}

/** Interpreta la búsqueda. Lanza ante cualquier falla: quien llama decide qué mostrar. */
export async function consultarBusquedaIa(texto: string): Promise<ResultadoBusquedaIa> {
  const datos = RespuestaSchema.parse(
    await llamarServicio("/search", { consulta: texto }, TIEMPO_MAXIMO_MS),
  );

  return {
    ids: datos.resultados.map((r) => r.id),
    filtros: datos.filtros,
  };
}

/**
 * Le avisa al servicio que el stock cambió, para que vuelva a pedir el
 * inventario. Sin servicio configurado no hace nada.
 */
export async function reindexarBusquedaIa(): Promise<void> {
  if (!configuracionBusquedaIa()) return;
  await llamarServicio("/index/rebuild", {}, TIEMPO_MAXIMO_REINDEXADO_MS);
}
