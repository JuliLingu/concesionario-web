import type { MetadataRoute } from "next";
import { urlAbsoluta } from "@/lib/site-url";

/**
 * Qué puede rastrear un buscador y dónde está el índice.
 *
 * Las dos cosas importan y son distintas: `Disallow` mantiene fuera del índice
 * lo que no es contenido —el panel, las rutas de sesión, los endpoints— y
 * `Sitemap` es la única forma de que Google encuentre el archivo sin que nadie
 * lo cargue a mano en Search Console.
 *
 * El panel ya está protegido por el proxy y por `requireAdmin()`: esto no es
 * seguridad, es no gastar el presupuesto de rastreo en URLs que terminan en una
 * redirección al login.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/admin/", "/api/", "/login", "/register"],
    },
    sitemap: urlAbsoluta("/sitemap.xml"),
  };
}
