import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS } from "@/services/cache.service";
import { registrarError } from "@/lib/log";
import {
  CONFIGURACION_DEFAULTS,
  CONFIGURACION_NUMERIC_DEFAULTS,
  conNombreConcesionaria,
  type SiteConfig,
} from "@/lib/configuracion-defaults";

const REVALIDATE_TIME = 3600;

/**
 * Un campo vacío en el formulario llega como cadena vacía, no como null.
 * En ambos casos queremos caer al texto por defecto en lugar de renderizar
 * un hueco en la página.
 */
function textoOrDefault(valor: string | null | undefined, porDefecto: string) {
  const limpio = valor?.trim();
  return limpio ? limpio : porDefecto;
}

function numeroOrDefault(valor: unknown, porDefecto: number | null) {
  if (valor === null || valor === undefined) return porDefecto;
  const numero = Number(valor);
  return Number.isNaN(numero) ? porDefecto : numero;
}

/** Completa los campos faltantes con los valores por defecto del sitio. */
function conDefaults(config: Record<string, unknown> | null): SiteConfig {
  const textos = Object.fromEntries(
    Object.entries(CONFIGURACION_DEFAULTS).map(([clave, porDefecto]) => [
      clave,
      textoOrDefault(config?.[clave] as string | null, porDefecto),
    ]),
  ) as { [K in keyof typeof CONFIGURACION_DEFAULTS]: string };

  // El marcador {concesionaria} se resuelve una sola vez, acá: así funciona en
  // cualquier texto —cargado o por defecto— sin que cada página lo repita.
  const resueltos = Object.fromEntries(
    Object.entries(textos).map(([clave, valor]) => [
      clave,
      conNombreConcesionaria(valor, textos.nombreConcesionaria),
    ]),
  ) as typeof textos;

  return {
    ...resueltos,
    id: (config?.id as string) ?? "1",
    cotizacionDolar: numeroOrDefault(
      config?.cotizacionDolar,
      CONFIGURACION_NUMERIC_DEFAULTS.cotizacionDolar,
    ),
    finanTasaAnual: numeroOrDefault(
      config?.finanTasaAnual,
      CONFIGURACION_NUMERIC_DEFAULTS.finanTasaAnual,
    ),
    finanEntregaMinima: numeroOrDefault(
      config?.finanEntregaMinima,
      CONFIGURACION_NUMERIC_DEFAULTS.finanEntregaMinima,
    ),
  };
}

/**
 * Lectura cacheada entre requests. Se invalida desde updateConfiguracion
 * mediante el tag CACHE_TAGS.CONFIGURACION.
 */
const readConfiguracion = unstable_cache(
  async () => {
    const config = await prisma.configuracion.findFirst();
    if (!config) return null;

    // Los Decimal de Prisma no son serializables hacia Client Components.
    return {
      ...config,
      cotizacionDolar: config.cotizacionDolar ? Number(config.cotizacionDolar) : null,
      finanTasaAnual: config.finanTasaAnual ? Number(config.finanTasaAnual) : null,
      finanEntregaMinima: config.finanEntregaMinima
        ? Number(config.finanEntregaMinima)
        : null,
    };
  },
  ["configuracion-sitio"],
  { tags: [CACHE_TAGS.CONFIGURACION], revalidate: REVALIDATE_TIME },
);

/**
 * Configuración del sitio con todos los campos resueltos.
 *
 * Envuelta en cache() de React para deduplicar dentro de un mismo request:
 * la piden el layout, generateMetadata, la home y las páginas de catálogo.
 */
export const getConfiguracion = cache(async (): Promise<SiteConfig> => {
  try {
    return conDefaults(await readConfiguracion());
  } catch (error) {
    registrarError("getConfiguracion", error);
    // Si la base falla, la página igual se renderiza con los textos por defecto.
    return conDefaults(null);
  }
});
