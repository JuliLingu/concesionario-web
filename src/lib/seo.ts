/**
 * Metadatos y datos estructurados de las fichas del catálogo.
 *
 * Acá vive lo que lee un buscador y no ve un visitante: el título de la
 * pestaña, la descripción del resultado y el bloque JSON-LD con el que Google
 * arma el resultado enriquecido de vehículos (precio, año y kilometraje debajo
 * del enlace). Son funciones puras —reciben la unidad y la configuración, no
 * consultan nada— para que se puedan probar sin base de datos y para que la
 * página siga siendo el único lugar que decide qué se carga.
 *
 * La regla que gobierna todo el archivo: **lo que se declara acá tiene que ser
 * lo mismo que se ve en la ficha**. Un precio en el JSON-LD distinto del que
 * muestra la página es una violación de las políticas de datos estructurados de
 * Google, y se paga con la pérdida del resultado enriquecido de todo el sitio.
 * Por eso el precio se calcula con el mismo `precioEnPesos()` que usa la ficha
 * y por eso, con los precios ocultos, no se declara ninguno.
 */
import {
  Combustible,
  EstadoPublicacion,
  EstadoVehiculo,
  Moneda,
  Transmision,
} from "../../generated/prisma";
import { etiquetaEnum } from "@/lib/etiquetas";
import { formatNumeroAr, precioEnPesos } from "@/lib/precio";
import { urlAbsoluta } from "@/lib/site-url";

/**
 * La unidad, vista desde el SEO. Es un tipo estructural y no el de Prisma a
 * propósito: así este módulo no arrastra el cliente de base de datos a las
 * pruebas ni a la ruta de la imagen de Open Graph.
 */
export interface VehiculoSeo {
  id: string;
  marca: string;
  modelo: string;
  anio: number;
  version: string | null;
  estado: EstadoVehiculo;
  publicacion: EstadoPublicacion;
  precio: number;
  moneda: Moneda;
  kilometraje: number;
  color: string | null;
  motor: string | null;
  transmision: Transmision | null;
  combustible: Combustible | null;
  puertas: number | null;
  potencia: number | null;
  descripcion: string | null;
  categoria?: { nombre: string } | null;
  imagenes: { url: string }[];
}

/** Los datos de la concesionaria que se publican. Subconjunto de `SiteConfig`. */
export interface ConcesionariaSeo {
  nombreConcesionaria: string;
  telefono: string;
  email: string;
  direccion: string;
  facebookUrl: string;
  instagramUrl: string;
  logoUrl: string;
}

export interface ContextoSeo {
  concesionaria: ConcesionariaSeo;
  /** Configuración del sitio: con `false` no se declara ningún importe. */
  mostrarPrecios: boolean;
  cotizacionDolar: number | null;
}

/** Google recorta la descripción del resultado alrededor de este largo. */
const MAXIMO_DESCRIPCION = 160;

/** Más de esto no lo mira ningún buscador, y engorda el HTML de cada ficha. */
const MAXIMO_IMAGENES = 8;

/** Identificador del nodo de la concesionaria, para referenciarlo desde la ficha. */
const ID_CONCESIONARIA = "/#concesionaria";

/**
 * Estado de publicación traducido a la disponibilidad de schema.org.
 *
 * Solo `PUBLICADO` es alcanzable por un visitante anónimo, pero el resto está
 * declarado igual: la ficha sí se le muestra al administrador, y con un mapa
 * parcial ese caso emitiría `undefined` dentro del JSON-LD.
 */
const DISPONIBILIDAD: Record<EstadoPublicacion, string> = {
  PUBLICADO: "https://schema.org/InStock",
  VENDIDO: "https://schema.org/SoldOut",
  PAUSADO: "https://schema.org/OutOfStock",
  BORRADOR: "https://schema.org/OutOfStock",
};

const CONDICION: Record<EstadoVehiculo, string> = {
  NUEVO: "https://schema.org/NewCondition",
  USADO: "https://schema.org/UsedCondition",
};

/** Corta en el último espacio para no dejar una palabra partida al medio. */
function recortar(texto: string, maximo: number): string {
  const limpio = texto.replace(/\s+/g, " ").trim();
  if (limpio.length <= maximo) return limpio;

  const corte = limpio.slice(0, maximo - 1);
  const espacio = corte.lastIndexOf(" ");
  // Si el último espacio queda demasiado atrás, el texto es una sola palabra
  // larga (una URL, un código) y conviene cortarla antes que devolver dos letras.
  const util = espacio > maximo * 0.6 ? corte.slice(0, espacio) : corte;
  return `${util.replace(/[\s.,;:·—-]+$/, "")}…`;
}

/** "Toyota Hilux 2022". El nombre corto, sin versión: el de los mensajes y los alt. */
export function nombreVehiculo(v: Pick<VehiculoSeo, "marca" | "modelo" | "anio">): string {
  return `${v.marca} ${v.modelo} ${v.anio}`;
}

/**
 * "Toyota Hilux SRX 2022". Con la versión incluida, que es lo que la gente
 * escribe en el buscador y lo que distingue dos unidades del mismo modelo.
 */
export function tituloVehiculo(
  v: Pick<VehiculoSeo, "marca" | "modelo" | "anio" | "version">,
): string {
  const version = v.version?.trim();
  return version
    ? `${v.marca} ${v.modelo} ${version} ${v.anio}`
    : nombreVehiculo(v);
}

/**
 * Importe tal como lo publica la ficha, con su moneda.
 *
 * Réplica exacta del criterio de `formatPrecio()`: en pesos cuando hay
 * cotización cargada, en dólares cuando no la hay. Devuelve `null` si la
 * concesionaria oculta los precios — y en ese caso la unidad se queda sin
 * `offers`, porque una oferta sin importe no es válida para Google y declararla
 * vacía es peor que no declararla.
 */
export function precioPublicado(
  v: Pick<VehiculoSeo, "precio" | "moneda">,
  { mostrarPrecios, cotizacionDolar }: Pick<ContextoSeo, "mostrarPrecios" | "cotizacionDolar">,
): { importe: number; moneda: "ARS" | "USD" } | null {
  if (!mostrarPrecios) return null;

  const pesos = precioEnPesos(v.precio, v.moneda, cotizacionDolar);
  return pesos === null
    ? { importe: v.precio, moneda: "USD" }
    : // Redondeado igual que en pantalla: el formateador de pesos no muestra
      // centavos, y declarar 15.000.000,4 contra un "$ 15.000.000" visible es
      // exactamente el desajuste que Google penaliza.
      { importe: Math.round(pesos), moneda: "ARS" };
}

/**
 * Descripción del resultado de búsqueda.
 *
 * Arranca por las especificaciones y no por el texto del administrador: son
 * datos que siempre están, siempre son distintos entre unidades y son
 * justamente lo que compara alguien que busca un auto. El texto cargado a mano
 * va después, si entra; con la ficha sin descripción se cierra con una llamada
 * a la acción en lugar de dejar el resultado a medias.
 */
export function descripcionVehiculo(v: VehiculoSeo, ctx: ContextoSeo): string {
  const precio = precioPublicado(v, ctx);

  const especificaciones = [
    tituloVehiculo(v),
    `${formatNumeroAr(v.kilometraje)} km`,
    v.combustible ? etiquetaEnum(v.combustible) : null,
    v.transmision ? etiquetaEnum(v.transmision) : null,
    precio
      ? `${precio.moneda === "ARS" ? "$" : "US$"} ${formatNumeroAr(precio.importe)}`
      : null,
  ]
    .filter((parte): parte is string => parte !== null)
    .join(" · ");

  const propia = v.descripcion?.replace(/\s+/g, " ").trim();
  const cierre =
    propia ||
    `${etiquetaEnum(v.estado)} disponible en ${ctx.concesionaria.nombreConcesionaria}. Consultá por WhatsApp.`;

  return recortar(`${especificaciones}. ${cierre}`, MAXIMO_DESCRIPCION);
}

/**
 * La concesionaria como nodo de schema.org.
 *
 * Va completo una sola vez, en la portada, y las fichas lo referencian por
 * `@id` desde el vendedor de la oferta. Repetirlo entero en cada página no
 * agrega nada y multiplica el HTML.
 *
 * Los horarios de atención quedan afuera adrede: `openingHours` tiene una
 * gramática propia ("Mo-Fr 09:00-19:00") y en la base son texto libre que el
 * administrador escribe como quiere. Declararlos mal es peor que no
 * declararlos.
 */
export function jsonLdConcesionaria(c: ConcesionariaSeo): Record<string, unknown> {
  const redes = [c.facebookUrl, c.instagramUrl].filter((url) => url.trim().length > 0);

  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "@id": urlAbsoluta(ID_CONCESIONARIA),
    name: c.nombreConcesionaria,
    url: urlAbsoluta("/"),
    ...(c.logoUrl && { logo: urlAbsoluta(c.logoUrl), image: urlAbsoluta(c.logoUrl) }),
    ...(c.telefono && { telephone: c.telefono }),
    ...(c.email && { email: c.email }),
    ...(c.direccion && {
      address: {
        "@type": "PostalAddress",
        streetAddress: c.direccion,
        addressCountry: "AR",
      },
    }),
    ...(redes.length > 0 && { sameAs: redes }),
    areaServed: { "@type": "Country", name: "Argentina" },
  };
}

/**
 * La unidad como `Car` de schema.org: el bloque del que Google saca el
 * resultado enriquecido de vehículos.
 *
 * `Car` y no `Product` a secas porque es el tipo que habilita los campos
 * propios del rubro —kilometraje, transmisión, combustible, puertas— y el que
 * pide la documentación de "vehicle listing".
 */
export function jsonLdVehiculo(v: VehiculoSeo, ctx: ContextoSeo): Record<string, unknown> {
  const url = urlAbsoluta(`/catalogo/${v.id}`);
  const precio = precioPublicado(v, ctx);
  const motor = v.motor?.trim();

  return {
    "@context": "https://schema.org",
    "@type": "Car",
    "@id": `${url}#vehiculo`,
    url,
    name: tituloVehiculo(v),
    description: descripcionVehiculo(v, ctx),
    ...(v.imagenes.length > 0 && {
      image: v.imagenes.slice(0, MAXIMO_IMAGENES).map((imagen) => imagen.url),
    }),
    brand: { "@type": "Brand", name: v.marca },
    model: v.modelo,
    ...(v.version?.trim() && { vehicleConfiguration: v.version.trim() }),
    // Los dos: `vehicleModelDate` es el año del modelo y es el que muestra el
    // resultado enriquecido; `productionDate` es el que valida el rubro.
    vehicleModelDate: String(v.anio),
    productionDate: String(v.anio),
    itemCondition: CONDICION[v.estado],
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: v.kilometraje,
      // Código UN/CEFACT del kilómetro. Sin esto Google no sabe si son millas.
      unitCode: "KMT",
    },
    ...(v.transmision && { vehicleTransmission: etiquetaEnum(v.transmision) }),
    ...(v.combustible && { fuelType: etiquetaEnum(v.combustible) }),
    ...(v.puertas && { numberOfDoors: v.puertas }),
    ...(v.color?.trim() && { color: v.color.trim() }),
    ...(v.categoria?.nombre && { bodyType: v.categoria.nombre }),
    ...((motor || v.potencia) && {
      vehicleEngine: {
        "@type": "EngineSpecification",
        ...(motor && { name: motor }),
        ...(v.potencia && {
          // `unitText` y no `unitCode`: la potencia se carga en caballos
          // argentinos (CV) y el código de UN/CEFACT para eso es ambiguo entre
          // CV métricos y HP imperiales. El texto no miente.
          enginePower: { "@type": "QuantitativeValue", value: v.potencia, unitText: "CV" },
        }),
      },
    }),
    ...(precio && {
      offers: {
        "@type": "Offer",
        url,
        price: precio.importe,
        priceCurrency: precio.moneda,
        availability: DISPONIBILIDAD[v.publicacion],
        itemCondition: CONDICION[v.estado],
        seller: {
          "@type": "AutoDealer",
          "@id": urlAbsoluta(ID_CONCESIONARIA),
          name: ctx.concesionaria.nombreConcesionaria,
        },
      },
    }),
  };
}

/**
 * Serializa un bloque JSON-LD para inyectarlo con `dangerouslySetInnerHTML`.
 *
 * `JSON.stringify` escapa comillas pero no `<`, así que una descripción cargada
 * desde el panel que contenga `</script>` cerraría la etiqueta y todo lo que
 * viniera después se ejecutaría como HTML. Escapando cada `<` como su secuencia
 * unicode el JSON sigue diciendo lo mismo y el navegador ya no ve una etiqueta.
 */
export function aJsonSeguro(datos: unknown): string {
  return JSON.stringify(datos).replace(/</g, "\\u003c");
}
