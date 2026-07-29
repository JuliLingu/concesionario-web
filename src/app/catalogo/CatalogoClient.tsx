"use client";

import { VehicleCard } from "@/components/catalog/VehicleCard";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { SortController } from "@/components/catalog/SortController";
import { LayoutGrid, List, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export const CatalogoClient = ({
  vehiculos,
  marcasDisponibles,
  combustiblesDisponibles,
  anioMin,
  anioMax,
  categorias,
  isAdmin,
  totalCount,
  currentPage,
  totalPages,
  ITEMS_PER_PAGE,
  sort,
  SORT_OPTIONS,
  marcasArray,
  transmisionesArray,
  combustiblesArray,
  anioDesde,
  anioHasta,
  cotizacionDolar
}: any) => {

  const buildUrl = (newParams: Record<string, string | null>) => {
    const p = new URLSearchParams();
    if (marcasArray) marcasArray.forEach((m: string) => p.append("marca", m));
    if (transmisionesArray) transmisionesArray.forEach((t: string) => p.append("transmision", t));
    if (combustiblesArray) combustiblesArray.forEach((c: string) => p.append("combustible", c));
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

  const generatePageNumbers = (current: number, total: number): (number | "...")[] => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | "...")[] = [];
    const delta = 1;
    const left  = Math.max(2, current - delta);
    const right = Math.min(total - 1, current + delta);
    pages.push(1);
    if (left > 2) pages.push("...");
    for (let p = left; p <= right; p++) pages.push(p);
    if (right < total - 1) pages.push("...");
    pages.push(total);
    return pages;
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] pt-16 pb-8 flex flex-col">

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-5 w-full">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[hsl(var(--primary))] mb-2">
          Galería de Stock
        </p>
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-end justify-between">
          <div>
            <h1 className="text-4xl md:text-[3rem] font-bold tracking-tight mb-1">
              Nuestro Stock
            </h1>
            <p className="text-[hsl(var(--muted-foreground))] font-medium italic">
              {totalCount === 0
                ? "No hay vehículos que coincidan con tu búsqueda."
                : `Mostrando ${(currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} de ${totalCount} vehículos disponibles.`}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[hsl(var(--card))] p-1 border border-black/5 rounded">
            <select
              id="sort-select"
              className="bg-transparent text-foreground text-[11px] font-black uppercase tracking-[0.1em] border-none border-r border-black/10 pr-2 mr-1 outline-none cursor-pointer focus:ring-0"
              value={sort}
              onChange={() => {}}
            >
              {SORT_OPTIONS.map((o: any) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button className="text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 p-1.5 rounded">
              <LayoutGrid size={18} />
            </button>
            <button className="text-[hsl(var(--muted-foreground))] hover:text-foreground p-1.5 rounded transition">
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      <SortController currentSort={sort} />

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex-grow w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Filters */}
          <div className="lg:col-span-3">
            <CatalogFilters
              marcasDisponibles={marcasDisponibles}
              combustiblesDisponibles={combustiblesDisponibles}
              anioMin={anioMin}
              anioMax={anioMax}
            />
          </div>

          {/* Vehicles */}
          <div className="lg:col-span-9">
            {vehiculos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {vehiculos.map((v: any, index: number) => (
                  <div key={v.id}>
                    <VehicleCard vehiculo={v} isAdmin={isAdmin} categorias={categorias} priority={index < 2} cotizacionDolar={cotizacionDolar} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center flex flex-col items-center justify-center bg-black/5 border border-dashed border-black/10 rounded">
                <h6 className="text-xl font-bold mb-1">No se encontraron vehículos.</h6>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3 max-w-md">Los filtros aplicados no coinciden con ninguna unidad en stock.</p>
                <Link href="/catalogo" className="bg-foreground text-background text-[10px] font-black uppercase tracking-[0.1em] px-4 py-1.5 rounded hover:bg-[hsl(var(--primary))] hover:text-white transition">
                  Limpiar Búsqueda
                </Link>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col items-center gap-2">
                <div className="flex items-center gap-1">
                  <Link
                    href={currentPage > 1 ? buildUrl({ page: String(currentPage - 1) }) : "#"}
                    className={`w-10 h-10 flex items-center justify-center rounded transition-all ${currentPage === 1 ? 'text-black/30 pointer-events-none' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--surface-low))] hover:text-foreground'}`}
                  >
                    <ChevronLeft size={18} />
                  </Link>

                  {generatePageNumbers(currentPage, totalPages).map((p, i) =>
                    p === "..." ? (
                      <div key={`ellipsis-${i}`} className="w-10 h-10 flex items-center justify-center text-[hsl(var(--muted-foreground))] font-bold">…</div>
                    ) : (
                      <Link
                        key={p}
                        href={buildUrl({ page: String(p) })}
                        className={`w-10 h-10 flex items-center justify-center font-bold text-sm rounded transition-all ${p === currentPage ? 'bg-[hsl(var(--primary))] text-white shadow-md' : 'text-foreground hover:bg-[hsl(var(--surface-low))]'}`}
                      >
                        {p}
                      </Link>
                    )
                  )}

                  <Link
                    href={currentPage < totalPages ? buildUrl({ page: String(currentPage + 1) }) : "#"}
                    className={`w-10 h-10 flex items-center justify-center rounded transition-all ${currentPage === totalPages ? 'text-black/30 pointer-events-none' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--surface-low))] hover:text-foreground'}`}
                  >
                    <ChevronRight size={18} />
                  </Link>
                </div>
                <p className="text-[11px] font-medium text-[hsl(var(--muted-foreground))]">Página {currentPage} de {totalPages}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="mt-12 bg-[#0a0a0b] py-10 px-3 relative overflow-hidden group">
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 w-[800px] h-[800px] opacity-20 pointer-events-none transition-transform duration-1000 group-hover:scale-105" style={{ background: 'radial-gradient(circle at center, rgba(194,65,12,0.2) 0%, transparent 70%)' }} />
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-2">
              ¿No encontrás lo que buscás?
            </h2>
            <p className="text-lg text-white/50 font-medium mb-4 leading-relaxed">
              Nuestro equipo de importación personalizada se encarga de traer el vehículo de tus sueños directo a tu puerta.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link href="#importacion" className="bg-[hsl(var(--primary))] text-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] rounded hover:bg-white hover:text-[hsl(var(--primary))] transition text-center">
                Nosotros lo traemos por vos 🚀
              </Link>
              <Link href="#asesor" className="border border-white/20 text-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] rounded hover:bg-white/10 hover:border-white/30 transition text-center">
                Hablar con un asesor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
