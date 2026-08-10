import * as z from "zod";
import { COLOR_HEX_REGEX } from "@/lib/colores";

/** Campo de texto opcional: la cadena vacía se normaliza a null. */
const textoOpcional = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((valor) => (valor ? valor : null));

/** Campo numérico opcional: la cadena vacía se normaliza a null. */
const numeroOpcional = z
  .union([z.string(), z.number(), z.null()])
  .optional()
  .transform((valor) => {
    if (valor === null || valor === undefined || valor === "") return null;
    const numero = Number(valor);
    return Number.isNaN(numero) ? null : numero;
  });

const urlOpcional = textoOpcional.refine(
  (valor) => !valor || /^(https?:\/\/|\/)/.test(valor),
  { message: "Debe ser una URL válida o una ruta que empiece con /" },
);

/**
 * Imágenes del sitio: solo rutas locales o subidas a Cloudinary.
 *
 * El logo y la portada se renderizan con next/image, que lanza un error de
 * runtime si el host no figura en `remotePatterns` de next.config.ts. Como el
 * panel solo sube a Cloudinary, restringirlo acá evita que un valor cargado
 * por fuera de la interfaz rompa el sitio entero.
 */
const imagenOpcional = textoOpcional.refine(
  (valor) =>
    !valor || valor.startsWith("/") || valor.startsWith("https://res.cloudinary.com/"),
  { message: "La imagen debe subirse desde el panel o ser una ruta local" },
);

/**
 * Color del sitio: hex de 6 dígitos, el formato que devuelve <input type="color">.
 *
 * Se normaliza a minúsculas para que el mismo color no se guarde de dos formas
 * distintas según el navegador que lo haya cargado.
 */
const colorOpcional = textoOpcional
  .refine((valor) => !valor || COLOR_HEX_REGEX.test(valor), {
    message: "El color debe tener el formato #rrggbb",
  })
  .transform((valor) => (valor ? valor.toLowerCase() : null));

export const ConfiguracionSchema = z.object({
  nombreConcesionaria: z.string().trim().min(1, "El nombre es obligatorio"),
  telefono: textoOpcional,
  email: textoOpcional.refine(
    (valor) => !valor || z.string().email().safeParse(valor).success,
    { message: "Debe ser un email válido" },
  ),
  direccion: textoOpcional,
  facebookUrl: urlOpcional,
  instagramUrl: urlOpcional,
  horariosAtencion: textoOpcional,
  cotizacionDolar: numeroOpcional,

  // Identidad visual
  logoUrl: imagenOpcional,
  faviconUrl: imagenOpcional,

  // SEO / metadata del layout
  siteTitle: textoOpcional,
  siteDescription: textoOpcional,

  // Portada (Hero)
  heroTitulo: textoOpcional,
  heroSubtitulo: textoOpcional,
  heroCtaTexto: textoOpcional,
  heroCtaUrl: urlOpcional,
  heroImagenUrl: imagenOpcional,

  // Nosotros (CompanyInfo)
  nosotrosTitulo: textoOpcional,
  nosotrosTexto: textoOpcional,
  nosotrosMetrica1Valor: textoOpcional,
  nosotrosMetrica1Sufijo: textoOpcional,
  nosotrosMetrica1Label: textoOpcional,
  nosotrosMetrica2Valor: textoOpcional,
  nosotrosMetrica2Sufijo: textoOpcional,
  nosotrosMetrica2Label: textoOpcional,

  // Financiación
  finanEyebrow: textoOpcional,
  finanTitulo: textoOpcional,
  finanTexto: textoOpcional,
  finanTasaAnual: numeroOpcional,
  finanEntregaMinima: numeroOpcional,
  finanCtaTexto: textoOpcional,

  // Consulta por unidad (ficha de vehículo)
  contactoEyebrow: textoOpcional,
  contactoTitulo: textoOpcional,
  contactoTexto: textoOpcional,
  contactoWhatsappTexto: textoOpcional,

  // Pie de página
  footerTexto: textoOpcional,
  terminosUrl: urlOpcional,
  privacidadUrl: urlOpcional,

  // Paleta del sitio
  colorPrimario: colorOpcional,
  colorAcento: colorOpcional,
  colorFondo: colorOpcional,
  colorSuperficie: colorOpcional,
  colorTexto: colorOpcional,
  colorTextoSuave: colorOpcional,
  colorTextoSobrePrimario: colorOpcional,
});

export type ConfiguracionInput = z.input<typeof ConfiguracionSchema>;
export type ConfiguracionData = z.output<typeof ConfiguracionSchema>;
