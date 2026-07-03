import { prisma } from "@/lib/prisma";
import { Prisma, Transmision, Combustible } from "../../../generated/prisma";
import { auth } from "@/auth";
import { CatalogoClient } from "./CatalogoClient";
import { 
  getCachedMarcas, 
  getCachedCombustibles, 
  getCachedAnioRange, 
  getCachedCategorias 
} from "@/services/cache.service";
import { getConfiguracion } from "@/actions/configuracion";

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

function getOrderBy(sort: SortValue): Prisma.VehiculoOrderByWithRelationInput {
  switch (sort) {
    case "oldest":     return { createdAt: "asc" };
    case "price_asc":  return { precio: "asc" };
    case "price_desc": return { precio: "desc" };
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

  const toArray = (val: string | string[] | undefined): string[] =>
    val ? (Array.isArray(val) ? val : [val]) : [];

  const marcasArray       = toArray(params.marca);
  const transmisionesArray = toArray(params.transmision).filter((t) =>
    Object.keys(Transmision).includes(t)
  ) as Transmision[];
  const combustiblesArray = toArray(params.combustible).filter((c) =>
    Object.keys(Combustible).includes(c)
  ) as Combustible[];

  const anioDesde = params.anioDesde ? parseInt(params.anioDesde as string) : undefined;
  const anioHasta = params.anioHasta ? parseInt(params.anioHasta as string) : undefined;

  const sort = (params.sort as SortValue) ?? "newest";
  const currentPage = Math.max(1, parseInt((params.page as string) ?? "1"));

  const where: Prisma.VehiculoWhereInput = {
    publicacion: isAdmin ? undefined : "PUBLICADO",
  };

  if (marcasArray.length > 0)       where.marca = { in: marcasArray };
  if (transmisionesArray.length > 0) where.transmision = { in: transmisionesArray };
  if (combustiblesArray.length > 0)  where.combustible = { in: combustiblesArray };
  if (anioDesde || anioHasta) {
    where.anio = {
      ...(anioDesde ? { gte: anioDesde } : {}),
      ...(anioHasta ? { lte: anioHasta } : {}),
    };
  }

  const [totalCount, rawVehiculos] = await Promise.all([
    prisma.vehiculo.count({ where }),
    prisma.vehiculo.findMany({
      where,
      include: {
        imagenes: { orderBy: { orden: "asc" } },
      },
      orderBy: getOrderBy(sort),
      skip:  (currentPage - 1) * ITEMS_PER_PAGE,
      take:  ITEMS_PER_PAGE,
    }),
  ]);

  const vehiculos = rawVehiculos.map((v) => ({
    ...v,
    precio: Number(v.precio),
  }));

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const [marcasDisponibles, combustiblesDisponibles, { anioMin, anioMax }, configuracion] = await Promise.all([
    getCachedMarcas(),
    getCachedCombustibles(),
    getCachedAnioRange(),
    getConfiguracion(),
  ]);

  let categorias: { id: string; nombre: string }[] = [];
  if (isAdmin) {
    categorias = await getCachedCategorias();
  }

  return (
    <CatalogoClient 
      vehiculos={vehiculos}
      cotizacionDolar={configuracion?.cotizacionDolar}
      marcasDisponibles={marcasDisponibles}
      combustiblesDisponibles={combustiblesDisponibles}
      anioMin={anioMin}
      anioMax={anioMax}
      categorias={categorias}
      isAdmin={isAdmin}
      totalCount={totalCount}
      currentPage={currentPage}
      totalPages={totalPages}
      ITEMS_PER_PAGE={ITEMS_PER_PAGE}
      sort={sort}
      SORT_OPTIONS={SORT_OPTIONS}
      marcasArray={marcasArray}
      transmisionesArray={transmisionesArray}
      combustiblesArray={combustiblesArray}
      anioDesde={anioDesde}
      anioHasta={anioHasta}
    />
  );
}
