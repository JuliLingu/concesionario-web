/**
 * Textos por defecto del sitio.
 *
 * Son los valores que se muestran cuando el administrador todavía no cargó
 * nada en /dashboard/settings, o cuando deja un campo vacío. Tenerlos en un
 * único lugar evita repetir `configuracion?.campo || "..."` en cada componente
 * y permite que el service devuelva siempre un objeto completo.
 */
import { COLORES_DEFAULTS } from "@/lib/colores";

export const CONFIGURACION_DEFAULTS = {
  nombreConcesionaria: "JBJ Automotores",
  // Mismo número que usaba el fallback de WhatsApp en la ficha de vehículo.
  telefono: "+54 9 223 421-4414",
  email: "contacto@concesionaria.com",
  direccion: "Av. Principal 123, Buenos Aires",
  facebookUrl: "",
  instagramUrl: "",
  horariosAtencion: "Lun — Vie: 09:00 — 19:00\nSábados: 10:00 — 14:00",

  // Identidad visual. Vacío significa "sin cargar": el encabezado y el pie
  // muestran el icono de auto por defecto, y el sitio no declara favicon.
  logoUrl: "",
  faviconUrl: "",

  // SEO / metadata del layout
  siteTitle: "JBJ Automotores | The Kinetic Gallery",
  siteDescription: "Una experiencia automotriz editorial y premium.",

  // Portada (Hero)
  heroTitulo: "KINETIC",
  heroSubtitulo: "Ingeniería en Movimiento.",
  heroCtaTexto: "Ver Catálogo",
  heroCtaUrl: "/catalogo",
  heroImagenUrl: "/banner.png",

  // Nosotros (CompanyInfo)
  nosotrosTitulo: "La Maestría\ndetrás del\nvolante.",
  nosotrosTexto:
    "En JBJ Automotores, operamos bajo el principio de que un vehículo es una extensión de la identidad. Nuestra trayectoria de dos décadas redefine la curaduría automotriz, seleccionando piezas que trascienden lo convencional.",
  nosotrosMetrica1Valor: "5K",
  nosotrosMetrica1Sufijo: "+",
  nosotrosMetrica1Label: "Relaciones Consolidadas",
  nosotrosMetrica2Valor: "24",
  nosotrosMetrica2Sufijo: "/7",
  nosotrosMetrica2Label: "Soporte de Ingeniería",

  // Financiación
  finanEyebrow: "Financial Services",
  finanTitulo: "Financiación\nde Autor.",
  finanTexto:
    "Planes personalizados con tasas preferenciales para nuestra selección más exclusiva. Transparencia técnica en cada cuota.",
  finanCtaTexto: "Simular Crédito",

  // Consulta por unidad (ficha de vehículo)
  contactoEyebrow: "¿Te interesa?",
  contactoTitulo: "Consultá por esta unidad",
  contactoTexto:
    "Completá el formulario y un asesor de {concesionaria} se comunicará con vos a la brevedad para coordinar una visita o responder todas tus preguntas.",
  contactoWhatsappTexto: "O escribinos directo por WhatsApp",

  // Pie de página
  footerTexto: "Vehículos de calidad. Concesionario en Argentina.",
  terminosUrl: "",
  privacidadUrl: "",

  // Paleta del sitio. Los valores viven en lib/colores.ts junto a la conversión
  // a variables CSS; acá se suman al resto de la configuración para que el
  // service los resuelva con el mismo mecanismo de defaults que los textos.
  ...COLORES_DEFAULTS,
} as const;

/**
 * Marcador admitido dentro de los textos editables: se reemplaza por el nombre
 * cargado en la configuración, así el administrador puede renombrar la
 * concesionaria sin tener que reescribir cada texto.
 */
export const MARCADOR_CONCESIONARIA = "{concesionaria}";

export function conNombreConcesionaria(texto: string, nombre: string) {
  return texto.split(MARCADOR_CONCESIONARIA).join(nombre);
}

/** Campos numéricos: no tienen texto por defecto, se muestran solo si están cargados. */
export const CONFIGURACION_NUMERIC_DEFAULTS = {
  cotizacionDolar: null,
  finanTasaAnual: 29,
  finanEntregaMinima: 30,
} as const;

/**
 * Forma de la configuración tal como la reciben los componentes: sin nulls en
 * los textos (ya resueltos contra los defaults) y con los Decimal de Prisma
 * convertidos a number.
 */
export type SiteConfig = {
  -readonly [K in keyof typeof CONFIGURACION_DEFAULTS]: string;
} & {
  id: string;
  cotizacionDolar: number | null;
  finanTasaAnual: number | null;
  finanEntregaMinima: number | null;
};
