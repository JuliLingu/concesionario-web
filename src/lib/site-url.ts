/**
 * Dominio público del sitio.
 *
 * Todo lo que consume un buscador —la etiqueta canónica, el sitemap, la imagen
 * de Open Graph, el JSON-LD— necesita URLs absolutas, y el servidor no puede
 * deducirlas del request: detrás de un proxy el `Host` que llega es el interno,
 * y el sitemap se genera sin request de por medio. Así que el dominio es un
 * dato del despliegue y viaja por variable de entorno.
 *
 * No sale de /dashboard/settings a propósito, aunque el resto de la identidad
 * del sitio sí. Una canónica mal cargada apunta todas las fichas a una URL que
 * no existe y desindexa el catálogo entero, sin que nada se rompa a la vista:
 * no es una decisión para dejar en un formulario que llena el concesionario.
 */

/**
 * Sin variable declarada se asume desarrollo local. Es deliberado que el
 * fallback sea localhost y no un dominio inventado: si alguien despliega sin
 * configurar nada, las canónicas apuntan a localhost y el error salta a la
 * primera revisión, en lugar de mandar a Google a un dominio ajeno.
 */
const FALLBACK = "http://localhost:3000";

function declarada(): string {
  // Sin el prefijo NEXT_PUBLIC_ a propósito: esto solo se lee del lado del
  // servidor —metadatos, sitemap, robots, JSON-LD— y una variable pública se
  // inserta en el paquete que descarga el navegador.
  const propia = process.env.SITE_URL?.trim();
  if (propia) return propia;

  // Vercel expone el dominio de producción sin protocolo. Sirve de red de
  // contención para que una preview no quede apuntando a localhost, pero no
  // reemplaza al dominio propio: acá va el .vercel.app, no el del cliente.
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel}`;

  return FALLBACK;
}

/**
 * Base para todas las URLs absolutas del sitio.
 *
 * Un valor que no sea una URL válida cae al fallback en lugar de lanzar: esto
 * corre dentro de `generateMetadata` y del sitemap, y una excepción ahí tira
 * abajo la página entera por una variable de entorno mal escrita.
 */
export function siteUrl(): URL {
  try {
    return new URL(declarada());
  } catch {
    return new URL(FALLBACK);
  }
}

/** Ruta interna a URL absoluta: `/catalogo/abc` → `https://sitio/catalogo/abc`. */
export function urlAbsoluta(ruta: string): string {
  return new URL(ruta, siteUrl()).toString();
}
