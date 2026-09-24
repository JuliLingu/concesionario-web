import type { Metadata } from "next";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { Prisma, Transmision, Combustible, EstadoVehiculo } from "../../../generated/prisma";
import { auth } from "@/auth";
import { CatalogoView, type FiltrosActivos } from "./CatalogoView";
import { getCachedFiltrosCatalogo, getCachedCategorias } from "@/services/cache.service";
import { getConfiguracion } from "@/services/configuracion.service";
import { precioEnPesos } from "@/lib/precio";
import { whatsappUrl } from "@/lib/whatsapp";
import { condicionesDeBusqueda, terminosDeBusqueda, textoDeBusquedaIa } from "@/lib/busqueda";
import { busquedaIaDisponible, buscarConIa } from "@/services/busqueda-ia.service";
import {
  ITEMS_PER_PAGE,
  SORT_OPTIONS,
  esOrdenPorPrecio,
  opcionesDeOrden,
  type SortValue,
} from "@/lib/catalogo";

/**
 * Los parámetros de la URL son entrada pública y sin validar llegaban tal cual
 * a Prisma: `?anioDesde=abc` producía un `gte: NaN` que revienta la consulta, y
 * `?page=99999999` un `skip` enorme contra la base. Se sanean con `.catch()`,
 * que ante un valor imposible cae al valor por defecto en lugar de lanzar — que
 * es lo que corresponde en una URL que cualquiera puede escribir a mano.
 */
const anioEnUrl = z.coerce.number().int().min(1900).max(2100).optional().catch(undefined);
const paginaEnUrl = z.coerce.number().int().min(1).max(500).catch(1);
const ordenEnUrl = z
  .enum(SORT_OPTIONS.map((opcion) => opcion.value) as [SortValue, ...SortValue[]])
  .catch("newest");

/** Tope de valores por filtro: una URL con cientos de marcas arma un IN gigante. */
const MAXIMO_VALORES_POR_FILTRO = 20;
/** Ninguna marca, categoría ni enum legítimo se acerca a este largo. */
const MAXIMO_LARGO_VALOR = 60;

/** El orden por precio no pasa por acá: se resuelve en pesos más abajo. */
function getOrderBy(sort: SortValue): Prisma.VehiculoOrderByWithRelationInput {
  switch (sort) {
    case "oldest":     return { createdAt: "asc" };
    case "km_asc":     return { kilometraje: "asc" };
    case "km_desc":    return { kilometraje: "desc" };
    case "year_desc":  return { anio: "desc" };
    case "year_asc":   return { anio: "asc" };
    default:           return { createdAt: "desc" };
  }
}

/**
 * Ids de la página cuando se ordena por precio.
 *
 * Cada vehículo guarda su precio en la moneda que eligió el administrador, así
 * que ordenar por la columna `precio` mezclaría pesos con dólares. Para esos dos
 * criterios pasamos todo a pesos y paginamos en memoria.
 */
async function idsOrdenadosPorPrecio(
  where: Prisma.VehiculoWhereInput,
  sort: SortValue,
  pagina: number,
  cotizacionDolar: number | null,
): Promise<string[]> {
  const candidatos = await prisma.vehiculo.findMany({
    where,
    select: { id: true, precio: true, moneda: true },
  });

  return candidatos
    .map((v) => ({
      id: v.id,
      precioArs:
        precioEnPesos(Number(v.precio), v.moneda, cotizacionDolar) ?? Number(v.precio),
    }))
    .sort((a, b) =>
      sort === "price_asc" ? a.precioArs - b.precioArs : b.precioArs - a.precioArs,
    )
    .slice((pagina - 1) * ITEMS_PER_PAGE, pagina * ITEMS_PER_PAGE)
    .map((v) => v.id);
}

/**
 * Ids de la página cuando manda la búsqueda con IA.
 *
 * El servicio devuelve los ids ya ordenados por parecido, pero son una foto de
 * su índice: acá se cruzan con el `where` —publicación y filtros del panel—, que
 * es lo que decide qué se puede mostrar hoy. Lo que se despublicó desde el
 * último reindexado cae solo. Después se pagina en memoria respetando el orden
 * del servicio, como en el orden por precio.
 */
async function idsOrdenadosPorRelevancia(
  where: Prisma.VehiculoWhereInput,
  idsDelServicio: string[],
  pagina: number,
): Promise<string[]> {
  const visibles = new Set(
    (
      await prisma.vehiculo.findMany({
        where: { ...where, id: { in: idsDelServicio } },
        select: { id: true },
      })
    ).map((v) => v.id),
  );

  return idsDelServicio
    .filter((id) => visibles.has(id))
    .slice((pagina - 1) * ITEMS_PER_PAGE, pagina * ITEMS_PER_PAGE);
}

/**
 * Parámetros que producen una vista recortada del mismo catálogo. Una URL con
 * cualquiera de ellos muestra un subconjunto —o el mismo listado en otro
 * orden— de lo que ya está en `/catalogo`.
 */
const PARAMETROS_DE_VISTA = [
  "q",
  "ia",
  "marca",
  "categoria",
  "estado",
  "transmision",
  "combustible",
  "anioDesde",
  "anioHasta",
  "financiable",
  "sort",
  "page",
];

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const [params, configuracion] = await Promise.all([searchParams, getConfiguracion()]);

  const esVistaFiltrada = PARAMETROS_DE_VISTA.some(
    (clave) => params[clave] !== undefined,
  );

  // El título refleja lo buscado para que la pestaña y el historial sirvan de
  // algo con varias búsquedas abiertas. No es un problema de SEO que sea texto
  // de quien visita: la vista con `?q=` ya sale sin indexar, acá abajo.
  const busqueda = textoDeBusquedaIa(params.ia) || terminosDeBusqueda(params.q).join(" ");

  return {
    title: busqueda ? `${busqueda} · Catálogo de vehículos` : "Catálogo de vehículos",
    description: `Todas las unidades disponibles en ${configuracion.nombreConcesionaria}. Buscá por marca, año, kilometraje y combustible, y consultá por la que te interese.`,
    ...(esVistaFiltrada
      ? {
          // Cada combinación de filtros es una URL distinta con el mismo
          // contenido barajado: son miles de páginas casi iguales compitiendo
          // entre sí. Se dejan fuera del índice, pero con `follow`, así el
          // rastreador igual las recorre para llegar a las fichas.
          //
          // No se apunta la canónica a `/catalogo`: la página 3 no es una
          // versión alternativa de la 1, y declararlo así hace que Google
          // ignore lo que hay de la 2 en adelante.
          robots: { index: false, follow: true },
        }
      : { alternates: { canonical: "/catalogo" } }),
  };
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Sesión, parámetros y configuración no dependen entre sí: van juntos.
  const [session, params, configuracion] = await Promise.all([
    auth(),
    searchParams,
    getConfiguracion(),
  ]);

  const isAdmin = session?.user?.role === "ADMIN";

  const toArray = (val: string | string[] | undefined): string[] => {
    const valores = val ? (Array.isArray(val) ? val : [val]) : [];
    return valores
      .filter((valor) => valor.length > 0 && valor.length <= MAXIMO_LARGO_VALOR)
      .slice(0, MAXIMO_VALORES_POR_FILTRO);
  };

  // Las dos búsquedas son excluyentes: el cuadro manda una u otra. Si una URL
  // escrita a mano trae las dos, gana la de IA. Sin servicio configurado, `?ia=`
  // se ignora como cualquier parámetro desconocido.
  const iaDisponible = busquedaIaDisponible();
  const busquedaIa = iaDisponible ? textoDeBusquedaIa(params.ia) : "";
  const terminos = busquedaIa ? [] : terminosDeBusqueda(params.q);

  const filtrosActivos: FiltrosActivos = {
    busqueda: terminos.join(" "),
    busquedaIa,
    marcas: toArray(params.marca),
    categorias: toArray(params.categoria),
    estados: toArray(params.estado).filter((e) => Object.keys(EstadoVehiculo).includes(e)),
    transmisiones: toArray(params.transmision).filter((t) => Object.keys(Transmision).includes(t)),
    combustibles: toArray(params.combustible).filter((c) => Object.keys(Combustible).includes(c)),
    anioDesde: anioEnUrl.parse(params.anioDesde),
    anioHasta: anioEnUrl.parse(params.anioHasta),
    // Con el módulo apagado el parámetro se ignora: filtrar por algo que el
    // sitio no ofrece dejaría una grilla recortada sin explicación.
    soloFinanciables: configuracion.financiacionActiva && params.financiable === "1",
  };

  // Con los precios ocultos, `?sort=price_asc` escrito a mano volvería a
  // exponerlos: ordenaría la grilla de más barato a más caro. Cae a "newest".
  const sortEnUrl = ordenEnUrl.parse(params.sort);
  const sort: SortValue =
    !configuracion.mostrarPrecios && esOrdenPorPrecio(sortEnUrl)
      ? "newest"
      : sortEnUrl;

  // Si el servicio no contesta o se agotó el cupo, `resultadoIa` lo dice y el
  // catálogo se muestra sin la búsqueda, con un aviso: nunca una página rota.
  const resultadoIa = busquedaIa ? await buscarConIa(busquedaIa) : null;
  const idsIa = resultadoIa?.estado === "ok" ? resultadoIa.ids : null;
  const currentPage = paginaEnUrl.parse(params.page);

  const where: Prisma.VehiculoWhereInput = {
    publicacion: isAdmin ? undefined : "PUBLICADO",
  };

  const { marcas, categorias: slugsCategoria, estados, transmisiones, combustibles } = filtrosActivos;
  if (marcas.length > 0)        where.marca = { in: marcas };
  if (slugsCategoria.length > 0) where.categoria = { slug: { in: slugsCategoria } };
  if (estados.length > 0)       where.estado = { in: estados as EstadoVehiculo[] };
  if (transmisiones.length > 0) where.transmision = { in: transmisiones as Transmision[] };
  if (combustibles.length > 0)  where.combustible = { in: combustibles as Combustible[] };
  if (filtrosActivos.soloFinanciables) where.financiable = true;
  // La búsqueda recorta lo que los filtros dejaron pasar, no lo reemplaza.
  if (terminos.length > 0) where.AND = condicionesDeBusqueda(terminos);
  if (idsIa) where.id = { in: idsIa };
  if (filtrosActivos.anioDesde || filtrosActivos.anioHasta) {
    where.anio = {
      ...(filtrosActivos.anioDesde ? { gte: filtrosActivos.anioDesde } : {}),
      ...(filtrosActivos.anioHasta ? { lte: filtrosActivos.anioHasta } : {}),
    };
  }

  const ordenaPorPrecio = esOrdenPorPrecio(sort);

  // Las opciones de los filtros salen del stock real; al administrador se le
  // ofrecen también las de los borradores. Las categorías solo hacen falta para
  // el modal de edición, así que fuera del panel ni se consultan.
  //
  // Con búsqueda con IA el orden es el del servicio —del más al menos
  // parecido—, que es la razón de haber buscado así; el selector de orden no
  // se muestra.
  const [filtros, categorias, idsDeLaPagina] = await Promise.all([
    getCachedFiltrosCatalogo(isAdmin),
    isAdmin ? getCachedCategorias() : [],
    idsIa
      ? idsOrdenadosPorRelevancia(where, idsIa, currentPage)
      : ordenaPorPrecio
        ? idsOrdenadosPorPrecio(where, sort, currentPage, configuracion.cotizacionDolar)
        : null,
  ]);

  const [totalCount, rawVehiculos] = await Promise.all([
    prisma.vehiculo.count({ where }),
    prisma.vehiculo.findMany({
      where: idsDeLaPagina ? { id: { in: idsDeLaPagina } } : where,
      include: {
        imagenes: { orderBy: { orden: "asc" } },
      },
      ...(idsDeLaPagina
        ? {}
        : {
            orderBy: getOrderBy(sort),
            skip: (currentPage - 1) * ITEMS_PER_PAGE,
            take: ITEMS_PER_PAGE,
          }),
    }),
  ]);

  // El `in` no conserva el orden: se reordena según los ids que calculamos.
  const ordenados = idsDeLaPagina
    ? idsDeLaPagina
        .map((id) => rawVehiculos.find((v) => v.id === id))
        .filter((v) => v !== undefined)
    : rawVehiculos;

  const vehiculos = ordenados.map((v) => ({ ...v, precio: Number(v.precio) }));

  /**
   * Banner de cierre: los dos botones abren WhatsApp con el número de la
   * concesionaria y un mensaje distinto según lo que el cliente esté buscando.
   * Sin teléfono cargado no hay a dónde enlazar y el banner no se muestra.
   */
  const urlImportacion = whatsappUrl(
    configuracion.telefono,
    `Hola, no encontré lo que busco en el catálogo de ${configuracion.nombreConcesionaria}. ¿Pueden conseguirme un vehículo?`,
  );
  const urlAsesor = whatsappUrl(
    configuracion.telefono,
    `Hola, estoy viendo el catálogo de ${configuracion.nombreConcesionaria} y me gustaría hablar con un asesor.`,
  );
  const whatsapp =
    urlImportacion && urlAsesor
      ? { importacion: urlImportacion, asesor: urlAsesor }
      : null;

  return (
    <CatalogoView
      vehiculos={vehiculos}
      cotizacionDolar={configuracion.cotizacionDolar}
      mostrarPrecios={configuracion.mostrarPrecios}
      opcionesDeOrden={opcionesDeOrden(configuracion.mostrarPrecios)}
      filtros={filtros}
      filtrosActivos={filtrosActivos}
      financiacionActiva={configuracion.financiacionActiva}
      categorias={categorias}
      isAdmin={isAdmin}
      totalCount={totalCount}
      currentPage={currentPage}
      totalPages={Math.ceil(totalCount / ITEMS_PER_PAGE)}
      sort={sort}
      whatsapp={whatsapp}
      iaDisponible={iaDisponible}
      resultadoIa={resultadoIa}
    />
  );
}
