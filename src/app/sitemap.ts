import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getConfiguracion } from "@/services/configuracion.service";
import { getCldUrl } from "@/lib/cloudinary";
import { registrarError } from "@/lib/log";
import { urlAbsoluta } from "@/lib/site-url";

/**
 * El índice que le entregamos a Google, generado desde el stock real.
 *
 * Sin esto, el rastreador solo llega a una ficha si encuentra un enlace hacia
 * ella, y el catálogo las esconde detrás de filtros y paginado que se arman con
 * JavaScript: las unidades de la página 3 en adelante, en la práctica, no
 * existen para el buscador.
 *
 * Lo que no entra: el panel, el alta de sesión y las URLs con filtros. El
 * sitemap declara las páginas que queremos indexadas, no todas las que
 * responden 200.
 */

/**
 * Una hora, como el resto de las lecturas cacheadas del sitio.
 *
 * Es la línea que hace que el sitemap sea dinámico. Sin ella, Next lo trata
 * como una ruta estática, lo genera una vez durante el build y las unidades que
 * el concesionario cargue después nunca aparecen — que es exactamente el
 * problema que el sitemap venía a resolver.
 */
export const revalidate = 3600;

/** Google corta a 50.000 URLs por archivo; ninguna concesionaria se acerca. */
const MAXIMO_VEHICULOS = 5000;

/** Las que están siempre, pase lo que pase con la base de datos. */
function paginasFijas(tasacionActiva: boolean): MetadataRoute.Sitemap {
  return [
    {
      url: urlAbsoluta("/"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: urlAbsoluta("/catalogo"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    // El formulario de tasación solo existe con el módulo encendido: apagado,
    // la ruta responde igual pero no es una página que queramos ofrecer.
    ...(tasacionActiva
      ? ([
          {
            url: urlAbsoluta("/tasacion"),
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.5,
          },
        ] as const)
      : []),
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const configuracion = await getConfiguracion();
  const fijas = paginasFijas(configuracion.tasacionActiva);

  try {
    const vehiculos = await prisma.vehiculo.findMany({
      // Solo lo publicado. Un borrador o una unidad vendida responden 404 a
      // quien no es administrador, y ofrecerle al rastreador una lista de URLs
      // que devuelven 404 es la forma más rápida de que deje de confiar en el
      // sitemap.
      where: { publicacion: "PUBLICADO" },
      select: {
        id: true,
        updatedAt: true,
        imagenes: {
          where: { esPrincipal: true },
          select: { url: true },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
      take: MAXIMO_VEHICULOS,
    });

    return [
      ...fijas,
      ...vehiculos.map((vehiculo) => ({
        url: urlAbsoluta(`/catalogo/${vehiculo.id}`),
        // La fecha real de la última edición: es lo que le dice al rastreador
        // qué fichas volver a mirar y cuáles saltear.
        lastModified: vehiculo.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
        // La foto principal entra al sitemap de imágenes, que es lo que hace
        // que la unidad aparezca también en la pestaña de imágenes de Google.
        ...(vehiculo.imagenes[0] && {
          images: [getCldUrl(vehiculo.imagenes[0].url, { modo: "original" })],
        }),
      })),
    ];
  } catch (error) {
    registrarError("sitemap", error);
    // Con la base caída se entrega el sitemap mínimo en lugar de un error: un
    // 500 acá se interpreta como "el sitemap está roto", y devolver las tres
    // páginas fijas es mejor que eso.
    return fijas;
  }
}
