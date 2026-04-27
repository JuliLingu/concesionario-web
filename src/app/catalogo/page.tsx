import { prisma } from "@/lib/prisma";
import { VehicleCard } from "@/components/catalog/VehicleCard";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { SortController } from "@/components/catalog/SortController";
import { LayoutGrid, List, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Transmision, Combustible, Prisma } from "../../../generated/prisma";
import { auth } from "@/auth";

const ITEMS_PER_PAGE = 9;

// ── Sort options ──────────────────────────────────────────────────────────────
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

  // ── Parse searchParams ───────────────────────────────────────────────────
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

  // ── Build Prisma where ───────────────────────────────────────────────────
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

  // ── Fetch count + paginated data ─────────────────────────────────────────
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

  // ── Sidebar meta data ─────────────────────────────────────────────────────
  const [dbMarcas, dbCombustibles, anioRange] = await Promise.all([
    prisma.vehiculo.findMany({
      where:  { publicacion: "PUBLICADO" },
      select: { marca: true },
      distinct: ["marca"],
    }),
    prisma.vehiculo.findMany({
      where:  { publicacion: "PUBLICADO", combustible: { not: null } },
      select: { combustible: true },
      distinct: ["combustible"],
    }),
    prisma.vehiculo.aggregate({
      where: { publicacion: "PUBLICADO" },
      _min:  { anio: true },
      _max:  { anio: true },
    }),
  ]);

  const marcasDisponibles      = dbMarcas.map((r) => r.marca).sort();
  const combustiblesDisponibles = dbCombustibles
    .map((r) => r.combustible)
    .filter(Boolean) as string[];
  const anioMin = anioRange._min.anio ?? 2000;
  const anioMax = anioRange._max.anio ?? new Date().getFullYear();

  // ── Admin categorías ──────────────────────────────────────────────────────
  let categorias: { id: string; nombre: string }[] = [];
  if (isAdmin) {
    categorias = await prisma.categoria.findMany({
      select:  { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    });
  }

  // ── Build URL helper (server-side, for pagination links) ─────────────────
  const buildUrl = (newParams: Record<string, string | null>) => {
    const p = new URLSearchParams();
    // Re-add multi-value params
    marcasArray.forEach((m) => p.append("marca", m));
    transmisionesArray.forEach((t) => p.append("transmision", t));
    combustiblesArray.forEach((c) => p.append("combustible", c));
    if (anioDesde) p.set("anioDesde", String(anioDesde));
    if (anioHasta) p.set("anioHasta", String(anioHasta));
    if (sort !== "newest") p.set("sort", sort);
    for (const [k, v] of Object.entries(newParams)) {
      if (v === null) p.delete(k);
      else p.set(k, v);
    }
    const qs = p.toString();
    return `/catalogo${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pt-32 pb-16">

      {/* ── Header Catalogo ── */}
      <div className="max-w-7xl mx-auto px-6 w-full mb-10">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4 block">
          Galería de Stock
        </span>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl font-bold tracking-tighter text-foreground font-space mb-2">
              Nuestro Stock
            </h1>
            <p className="text-foreground/50 font-medium italic">
              {totalCount === 0
                ? "No hay vehículos que coincidan con tu búsqueda."
                : `Mostrando ${(currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    totalCount
                  )} de ${totalCount} vehículos disponibles.`}
            </p>
          </div>

          {/* Sort + view toggle */}
          <div className="flex items-center gap-4 bg-surface-lowest shadow-sm border border-foreground/[0.05] p-2">
            <select
              className="bg-transparent text-[11px] font-black uppercase tracking-widest text-foreground outline-none border-r border-foreground/10 pr-4 mr-2 cursor-pointer"
              id="sort-select"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <button className="p-2 text-primary bg-primary/5 rounded-sm">
              <LayoutGrid size={18} />
            </button>
            <button className="p-2 text-foreground/40 hover:text-foreground transition-all">
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Sort client controller (hidden, drives the select above) ── */}
      <SortController currentSort={sort} />

      {/* ── Main Grid Layout ── */}
      <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-4 gap-10">

        {/* Filters sidebar */}
        <div className="lg:col-span-1">
          <CatalogFilters
            marcasDisponibles={marcasDisponibles}
            combustiblesDisponibles={combustiblesDisponibles}
            anioMin={anioMin}
            anioMax={anioMax}
          />
        </div>

        {/* Vehicle grid */}
        <div className="lg:col-span-3">
          {vehiculos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {vehiculos.map((v) => (
                <VehicleCard
                  key={v.id}
                  vehiculo={v}
                  isAdmin={isAdmin}
                  categorias={categorias}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center flex flex-col items-center justify-center bg-surface-low/50 border border-dashed border-foreground/10">
              <p className="text-xl font-bold text-foreground mb-2 font-space">
                No se encontraron vehículos.
              </p>
              <p className="text-sm text-foreground/60 mb-6 max-w-md">
                Los filtros aplicados no coinciden con ninguna unidad en stock.
              </p>
              <Link
                href="/catalogo"
                className="text-[10px] bg-foreground text-white px-6 py-3 font-black uppercase tracking-widest hover:bg-primary transition-all"
              >
                Limpiar Búsqueda
              </Link>
            </div>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-16">
              {/* Prev */}
              <Link
                href={currentPage > 1 ? buildUrl({ page: String(currentPage - 1) }) : "#"}
                aria-disabled={currentPage === 1}
                className={`w-10 h-10 flex items-center justify-center transition-all ${
                  currentPage === 1
                    ? "text-foreground/20 cursor-not-allowed pointer-events-none"
                    : "text-foreground/40 hover:text-foreground hover:bg-surface-lowest"
                }`}
              >
                <ChevronLeft size={18} />
              </Link>

              {/* Page numbers */}
              {generatePageNumbers(currentPage, totalPages).map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="w-10 h-10 flex items-center justify-center text-foreground/30 text-sm font-bold select-none">
                    …
                  </span>
                ) : (
                  <Link
                    key={p}
                    href={buildUrl({ page: String(p) })}
                    className={`w-10 h-10 flex items-center justify-center font-bold text-sm transition-all ${
                      p === currentPage
                        ? "bg-primary text-white shadow-lg"
                        : "text-foreground hover:bg-surface-lowest"
                    }`}
                  >
                    {p}
                  </Link>
                )
              )}

              {/* Next */}
              <Link
                href={currentPage < totalPages ? buildUrl({ page: String(currentPage + 1) }) : "#"}
                aria-disabled={currentPage === totalPages}
                className={`w-10 h-10 flex items-center justify-center transition-all ${
                  currentPage === totalPages
                    ? "text-foreground/20 cursor-not-allowed pointer-events-none"
                    : "text-foreground/40 hover:text-foreground hover:bg-surface-lowest"
                }`}
              >
                <ChevronRight size={18} />
              </Link>
            </div>
          )}

          {/* Results summary */}
          {totalPages > 1 && (
            <p className="text-center text-[11px] text-foreground/40 font-medium mt-4">
              Página {currentPage} de {totalPages}
            </p>
          )}
        </div>
      </div>

      {/* ── Banner Inferior ── */}
      <div className="mt-24 bg-[#0a0a0b] py-20 px-6 relative overflow-hidden group">
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 opacity-20 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(181,0,11,0.2)_0%,transparent_70%)] pointer-events-none group-hover:scale-105 transition-transform duration-1000" />
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white font-space mb-4">
              ¿No encontrás lo que buscás?
            </h2>
            <p className="text-lg text-white/50 font-medium mb-8 leading-relaxed">
              Nuestro equipo de importación personalizada se encarga de traer el vehículo de tus sueños directo a tu puerta.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="#importacion"
                className="bg-primary text-white px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-primary transition-all text-center"
              >
                Nosotros lo traemos por vos 🚀
              </Link>
              <Link
                href="#asesor"
                className="bg-transparent border border-white/20 text-white px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all text-center"
              >
                Hablar con un asesor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Pagination helper ─────────────────────────────────────────────────────────
function generatePageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [];
  const delta = 1; // siblings around current

  const left  = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  pages.push(1);
  if (left > 2)     pages.push("...");
  for (let p = left; p <= right; p++) pages.push(p);
  if (right < total - 1) pages.push("...");
  pages.push(total);

  return pages;
}
