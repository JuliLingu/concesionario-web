import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { Prisma, Transmision, Combustible, EstadoVehiculo } from "../../../generated/prisma";
import { auth } from "@/auth";
import { CatalogoClient } from "./CatalogoClient";
import { getCachedFiltrosCatalogo, getCachedCategorias } from "@/services/cache.service";
import { getConfiguracion } from "@/services/configuracion.service";
import { precioEnPesos } from "@/lib/precio";
import { whatsappUrl } from "@/lib/whatsapp";

const ITEMS_PER_PAGE = 9;

const SORT_OPTIONS = [
  { value: "newest",     label: "Más Recientes"   },
  { value: "oldest",     label: "Más Antiguos"    },
  { value: "price_asc",  label: "Menor Precio"    },
  { value: "price_desc", label: "Mayor Precio"    },
  { value: "km_asc",     label: "Menor Kilometraje" },
  { value: "km_desc",    label: "Mayor Kilometraje" },
  { value: "year_desc",  label: "Año (más nuevo)" },
  { value: "year_asc",   label: "Año (más antiguo)"},
] as const;

type SortValue = typeof SORT_OPTIONS[number]["value"];

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

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  const params = await searchParams;

  const toArray = (val: string | string[] | undefined): string[] => {
    const valores = val ? (Array.isArray(val) ? val : [val]) : [];
    return valores
      .filter((valor) => valor.length > 0 && valor.length <= MAXIMO_LARGO_VALOR)
      .slice(0, MAXIMO_VALORES_POR_FILTRO);
  };

  const marcasArray       = toArray(params.marca);
  const categoriasArray   = toArray(params.categoria);
  const estadosArray      = toArray(params.estado).filter((e) =>
    Object.keys(EstadoVehiculo).includes(e)
  ) as EstadoVehiculo[];
  const transmisionesArray = toArray(params.transmision).filter((t) =>
    Object.keys(Transmision).includes(t)
  ) as Transmision[];
  const combustiblesArray = toArray(params.combustible).filter((c) =>
    Object.keys(Combustible).includes(c)
  ) as Combustible[];

  const anioDesde = anioEnUrl.parse(params.anioDesde);
  const anioHasta = anioEnUrl.parse(params.anioHasta);

  const sort = ordenEnUrl.parse(params.sort);
  const currentPage = paginaEnUrl.parse(params.page);

  const where: Prisma.VehiculoWhereInput = {
    publicacion: isAdmin ? undefined : "PUBLICADO",
  };

  if (marcasArray.length > 0)       where.marca = { in: marcasArray };
  if (categoriasArray.length > 0)   where.categoria = { slug: { in: categoriasArray } };
  if (estadosArray.length > 0)      where.estado = { in: estadosArray };
  if (transmisionesArray.length > 0) where.transmision = { in: transmisionesArray };
  if (combustiblesArray.length > 0)  where.combustible = { in: combustiblesArray };
  if (anioDesde || anioHasta) {
    where.anio = {
      ...(anioDesde ? { gte: anioDesde } : {}),
      ...(anioHasta ? { lte: anioHasta } : {}),
    };
  }

  const configuracion = await getConfiguracion();

  /**
   * Cada vehículo guarda su precio en la moneda que eligió el administrador,
   * así que ordenar por la columna `precio` mezclaría pesos con dólares.
   * Para esos dos criterios pasamos todo a pesos y paginamos en memoria.
   */
  const ordenaPorPrecio = sort === "price_asc" || sort === "price_desc";
  let idsDeLaPagina: string[] | null = null;

  if (ordenaPorPrecio) {
    const candidatos = await prisma.vehiculo.findMany({
      where,
      select: { id: true, precio: true, moneda: true },
    });

    idsDeLaPagina = candidatos
      .map((v) => ({
        id: v.id,
        precioArs:
          precioEnPesos(Number(v.precio), v.moneda, configuracion.cotizacionDolar) ??
          Number(v.precio),
      }))
      .sort((a, b) =>
        sort === "price_asc" ? a.precioArs - b.precioArs : b.precioArs - a.precioArs,
      )
      .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
      .map((v) => v.id);
  }

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

  const ordenados = idsDeLaPagina
    ? idsDeLaPagina
        .map((id) => rawVehiculos.find((v) => v.id === id))
        .filter((v) => v !== undefined)
    : rawVehiculos;

  const vehiculos = ordenados.map((v) => ({
    ...v,
    precio: Number(v.precio),
  }));

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  /**
   * Banner de cierre: los dos botones abren WhatsApp con el número de la
   * concesionaria y un mensaje distinto según lo que el cliente esté buscando.
   */
  const whatsapp = {
    importacion: whatsappUrl(
      configuracion.telefono,
      `Hola, no encontré lo que busco en el catálogo de ${configuracion.nombreConcesionaria}. ¿Pueden conseguirme un vehículo?`,
    ),
    asesor: whatsappUrl(
      configuracion.telefono,
      `Hola, estoy viendo el catálogo de ${configuracion.nombreConcesionaria} y me gustaría hablar con un asesor.`,
    ),
  };

  // Las opciones salen del stock real. Al administrador se le ofrecen también
  // las de los borradores, que es lo que ve listado más arriba.
  const filtros = await getCachedFiltrosCatalogo(isAdmin);

  let categorias: { id: string; nombre: string }[] = [];
  if (isAdmin) {
    categorias = await getCachedCategorias();
  }

  return (
    <CatalogoClient 
      vehiculos={vehiculos}
      cotizacionDolar={configuracion?.cotizacionDolar}
      filtros={filtros}
      categorias={categorias}
      isAdmin={isAdmin}
      totalCount={totalCount}
      currentPage={currentPage}
      totalPages={totalPages}
      ITEMS_PER_PAGE={ITEMS_PER_PAGE}
      sort={sort}
      SORT_OPTIONS={SORT_OPTIONS}
      marcasArray={marcasArray}
      categoriasArray={categoriasArray}
      estadosArray={estadosArray}
      transmisionesArray={transmisionesArray}
      combustiblesArray={combustiblesArray}
      anioDesde={anioDesde}
      anioHasta={anioHasta}
      whatsapp={whatsapp}
    />
  );
}
