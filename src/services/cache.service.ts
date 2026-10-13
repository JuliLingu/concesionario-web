import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { Combustible, EstadoVehiculo, Prisma, Transmision } from "../../generated/prisma";

// Constantes para los tags de caché, por si queremos revalidarlos a demanda
export const CACHE_TAGS = {
  FILTROS: "catalogo-filtros",
  CATEGORIAS: "categorias",
  CONFIGURACION: "configuracion",
};

// Revalidar cada 1 hora (3600 segundos)
const REVALIDATE_TIME = 3600;

export type FiltrosCatalogo = {
  marcas: string[];
  /** Categorías con al menos una unidad. Se filtra por slug, no por id. */
  categorias: { nombre: string; slug: string }[];
  estados: EstadoVehiculo[];
  transmisiones: Transmision[];
  combustibles: Combustible[];
  /** Años con stock, de más nuevo a más viejo. Vacío si no hay vehículos. */
  anios: number[];
};

/** Ordena según cómo están declarados en el enum, no alfabéticamente. */
function ordenDeEnum<T extends string>(valores: T[], enumObj: Record<string, string>): T[] {
  const orden = Object.keys(enumObj);
  return [...valores].sort((a, b) => orden.indexOf(a) - orden.indexOf(b));
}

/**
 * Opciones de los filtros del catálogo, derivadas del stock cargado en la base.
 *
 * Solo se ofrece lo que existe: si ninguna unidad es diésel, el filtro de
 * combustible no muestra esa opción. `incluirBorradores` distingue la vista de
 * administrador (que ve también los borradores) y forma parte de la clave de
 * caché, así cada variante se guarda por separado.
 */
export const getCachedFiltrosCatalogo = unstable_cache(
  async (incluirBorradores: boolean): Promise<FiltrosCatalogo> => {
    const where: Prisma.VehiculoWhereInput = incluirBorradores
      ? {}
      : { publicacion: "PUBLICADO" };

    const [dbMarcas, dbCategorias, dbEstados, dbTransmisiones, dbCombustibles, dbAnios] =
      await Promise.all([
        prisma.vehiculo.findMany({
          where,
          select: { marca: true },
          distinct: ["marca"],
        }),
        prisma.categoria.findMany({
          where: { vehiculos: { some: where } },
          select: { nombre: true, slug: true },
          orderBy: { nombre: "asc" },
        }),
        prisma.vehiculo.findMany({
          where,
          select: { estado: true },
          distinct: ["estado"],
        }),
        prisma.vehiculo.findMany({
          where: { ...where, transmision: { not: null } },
          select: { transmision: true },
          distinct: ["transmision"],
        }),
        prisma.vehiculo.findMany({
          where: { ...where, combustible: { not: null } },
          select: { combustible: true },
          distinct: ["combustible"],
        }),
        prisma.vehiculo.findMany({
          where,
          select: { anio: true },
          distinct: ["anio"],
          orderBy: { anio: "desc" },
        }),
      ]);

    return {
      marcas: dbMarcas.map((r) => r.marca).sort((a, b) => a.localeCompare(b, "es")),
      categorias: dbCategorias,
      estados: ordenDeEnum(
        dbEstados.map((r) => r.estado),
        EstadoVehiculo,
      ),
      transmisiones: ordenDeEnum(
        dbTransmisiones.map((r) => r.transmision).filter((t) => t !== null),
        Transmision,
      ),
      combustibles: ordenDeEnum(
        dbCombustibles.map((r) => r.combustible).filter((c) => c !== null),
        Combustible,
      ),
      anios: dbAnios.map((r) => r.anio),
    };
  },
  ["catalogo-filtros"],
  { tags: [CACHE_TAGS.FILTROS], revalidate: REVALIDATE_TIME }
);

export const getCachedCategorias = unstable_cache(
  async () => {
    return prisma.categoria.findMany({
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    });
  },
  ["catalogo-categorias"],
  { tags: [CACHE_TAGS.CATEGORIAS], revalidate: REVALIDATE_TIME }
);
