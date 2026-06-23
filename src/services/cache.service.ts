import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

// Constantes para los tags de caché, por si queremos revalidarlos a demanda
export const CACHE_TAGS = {
  MARCAS: "marcas",
  COMBUSTIBLES: "combustibles",
  ANIOS: "anios",
  CATEGORIAS: "categorias",
};

// Revalidar cada 1 hora (3600 segundos)
const REVALIDATE_TIME = 3600;

export const getCachedMarcas = unstable_cache(
  async () => {
    const dbMarcas = await prisma.vehiculo.findMany({
      where: { publicacion: "PUBLICADO" },
      select: { marca: true },
      distinct: ["marca"],
    });
    return dbMarcas.map((r) => r.marca).sort();
  },
  ["catalogo-marcas"],
  { tags: [CACHE_TAGS.MARCAS], revalidate: REVALIDATE_TIME }
);

export const getCachedCombustibles = unstable_cache(
  async () => {
    const dbCombustibles = await prisma.vehiculo.findMany({
      where: { publicacion: "PUBLICADO", combustible: { not: null } },
      select: { combustible: true },
      distinct: ["combustible"],
    });
    return dbCombustibles
      .map((r) => r.combustible)
      .filter(Boolean) as string[];
  },
  ["catalogo-combustibles"],
  { tags: [CACHE_TAGS.COMBUSTIBLES], revalidate: REVALIDATE_TIME }
);

export const getCachedAnioRange = unstable_cache(
  async () => {
    const anioRange = await prisma.vehiculo.aggregate({
      where: { publicacion: "PUBLICADO" },
      _min: { anio: true },
      _max: { anio: true },
    });
    return {
      anioMin: anioRange._min.anio ?? 2000,
      anioMax: anioRange._max.anio ?? new Date().getFullYear(),
    };
  },
  ["catalogo-anios"],
  { tags: [CACHE_TAGS.ANIOS], revalidate: REVALIDATE_TIME }
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
