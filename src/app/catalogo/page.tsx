import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { Prisma, Transmision, Combustible, EstadoVehiculo } from "../../../generated/prisma";
import { auth } from "@/auth";
import { CatalogoView, type FiltrosActivos } from "./CatalogoView";
import { getCachedFiltrosCatalogo, getCachedCategorias } from "@/services/cache.service";
import { getConfiguracion } from "@/services/configuracion.service";
import { precioEnPesos } from "@/lib/precio";
import { whatsappUrl } from "@/lib/whatsapp";
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

  const filtrosActivos: FiltrosActivos = {
    marcas: toArray(params.marca),
    categorias: toArray(params.categoria),
    estados: toArray(params.estado).filter((e) => Object.keys(EstadoVehiculo).includes(e)),
    transmisiones: toArray(params.transmision).filter((t) => Object.keys(Transmision).includes(t)),
    combustibles: toArray(params.combustible).filter((c) => Object.keys(Combustible).includes(c)),
    anioDesde: anioEnUrl.parse(params.anioDesde),
    anioHasta: anioEnUrl.parse(params.anioHasta),
  };

  // Con los precios ocultos, `?sort=price_asc` escrito a mano volvería a
  // exponerlos: ordenaría la grilla de más barato a más caro. Cae a "newest".
  const sortEnUrl = ordenEnUrl.parse(params.sort);
  const sort: SortValue =
    !configuracion.mostrarPrecios && esOrdenPorPrecio(sortEnUrl)
      ? "newest"
      : sortEnUrl;
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
  const [filtros, categorias, idsDeLaPagina] = await Promise.all([
    getCachedFiltrosCatalogo(isAdmin),
    isAdmin ? getCachedCategorias() : [],
    ordenaPorPrecio
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
      categorias={categorias}
      isAdmin={isAdmin}
      totalCount={totalCount}
      currentPage={currentPage}
      totalPages={Math.ceil(totalCount / ITEMS_PER_PAGE)}
      sort={sort}
      whatsapp={whatsapp}
    />
  );
}
