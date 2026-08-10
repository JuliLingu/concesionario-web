import type { NextConfig } from "next";

const esProduccion = process.env.NODE_ENV === "production";

/**
 * Content Security Policy del sitio.
 *
 * La lista de orígenes permitidos es corta a propósito: el sitio no carga
 * scripts de terceros, las tipografías las sirve next/font desde el propio
 * dominio y las únicas imágenes remotas vienen de Cloudinary. Cada excepción
 * está justificada abajo; si alguna deja de hacer falta, hay que quitarla.
 *
 * En desarrollo se relaja lo mínimo indispensable para que funcionen el
 * bundler y el hot reload, que en producción no existen.
 */
const contentSecurityPolicy = [
  "default-src 'self'",

  // 'unsafe-inline': Next inyecta el script de arranque y los chunks de datos
  // RSC como <script> inline. Quitarlo exige emitir un nonce por request desde
  // el middleware, que hoy corre en el Edge sin acceso a la respuesta HTML.
  // 'unsafe-eval': solo en desarrollo, lo necesita el bundler para el HMR.
  `script-src 'self' 'unsafe-inline'${esProduccion ? "" : " 'unsafe-eval'"}`,

  // Tailwind y la paleta configurable —que se inyecta como atributo style en
  // <html> desde el layout— requieren estilos inline.
  "style-src 'self' 'unsafe-inline'",

  // data: y blob: son las vistas previas locales del selector de imágenes del
  // panel, antes de que la foto llegue a Cloudinary.
  "img-src 'self' data: blob: https://res.cloudinary.com",

  "font-src 'self'",

  // api.cloudinary.com es el destino del XHR de subida del panel.
  // ws: es el canal de hot reload en desarrollo.
  `connect-src 'self' https://api.cloudinary.com${esProduccion ? "" : " ws: http://localhost:*"}`,

  // El mapa embebido de la sección Ubicación.
  "frame-src https://www.google.com",

  // Nadie puede embeber este sitio: cierra el clickjacking sobre /dashboard.
  "frame-ancestors 'none'",

  // accounts.google.com queda declarado porque el proveedor Google de Auth.js
  // redirige ahí al enviar el formulario de inicio de sesión.
  "form-action 'self' https://accounts.google.com",

  "base-uri 'self'",
  "object-src 'none'",
  // Sin esto en desarrollo, http://localhost seguiría funcionando igual, pero
  // se declara solo en producción para no depender de la excepción de los
  // navegadores para orígenes locales.
  ...(esProduccion ? ["upgrade-insecure-requests"] : []),
].join("; ");

const cabecerasDeSeguridad = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },

  // Redundante con frame-ancestors, pero lo entienden navegadores que no
  // aplican esa directiva.
  { key: "X-Frame-Options", value: "DENY" },

  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
];

/**
 * HSTS solo en producción: en localhost se sirve por HTTP y fijar la política
 * podría dejar el dominio de desarrollo inaccesible durante dos años.
 */
if (esProduccion) {
  cabecerasDeSeguridad.push({
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  });
}

const nextConfig: NextConfig = {
  // No anunciar el framework ni su versión.
  poweredByHeader: false,

  images: {
    // Next 16 exige declarar las calidades permitidas. 75 es la de toda la
    // navegación; 90 es sólo para el visor a pantalla completa.
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: cabecerasDeSeguridad,
      },
    ];
  },
};

export default nextConfig;
