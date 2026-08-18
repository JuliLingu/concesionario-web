import { VehicleCard, type VehiculoDeTarjeta } from "@/components/catalog/VehicleCard";
import { VehicleCardAdminOverlay } from "@/components/catalog/VehicleCardAdminOverlay";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { SortSelect } from "@/components/catalog/SortSelect";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ITEMS_PER_PAGE, type SortOption, type SortValue } from "@/lib/catalogo";
import type { FiltrosCatalogo } from "@/services/cache.service";

/** Filtros activos leídos de la URL. Se usan para reconstruir los enlaces de paginado. */
export interface FiltrosActivos {
  marcas: string[];
  categorias: string[];
  estados: string[];
  transmisiones: string[];
  combustibles: string[];
  anioDesde?: number;
  anioHasta?: number;
}

interface CatalogoViewProps {
  vehiculos: VehiculoDeTarjeta[];
  filtros: FiltrosCatalogo;
  filtrosActivos: FiltrosActivos;
  /** Solo se pasan cuando quien mira es administrador; alimentan el modal de edición. */
  categorias: { id: string; nombre: string }[];
  isAdmin: boolean;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  sort: SortValue;
  /** Sin los dos órdenes por importe cuando la concesionaria oculta los precios. */
  opcionesDeOrden: readonly SortOption[];
  cotizacionDolar?: number | null;
  /** Precios a la vista, según Configuración. */
  mostrarPrecios: boolean;
  /** Null cuando la concesionaria todavía no cargó un teléfono. */
  whatsapp: { importacion: string; asesor: string } | null;
}

const construirUrl = (
  filtrosActivos: FiltrosActivos,
  sort: SortValue,
  nuevos: Record<string, string>,
) => {
  const p = new URLSearchParams();
  filtrosActivos.marcas.forEach((m) => p.append("marca", m));
  filtrosActivos.categorias.forEach((c) => p.append("categoria", c));
  filtrosActivos.estados.forEach((e) => p.append("estado", e));
  filtrosActivos.transmisiones.forEach((t) => p.append("transmision", t));
  filtrosActivos.combustibles.forEach((c) => p.append("combustible", c));
  if (filtrosActivos.anioDesde) p.set("anioDesde", String(filtrosActivos.anioDesde));
  if (filtrosActivos.anioHasta) p.set("anioHasta", String(filtrosActivos.anioHasta));
  if (sort !== "newest") p.set("sort", sort);
  for (const [k, v] of Object.entries(nuevos)) p.set(k, v);
  const qs = p.toString();
  return `/catalogo${qs ? `?${qs}` : ""}`;
};

/** Números de página con elipsis: 1 … 4 5 6 … 20 */
const numerosDePagina = (actual: number, total: number): (number | "...")[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const paginas: (number | "...")[] = [];
  const izquierda = Math.max(2, actual - 1);
  const derecha = Math.min(total - 1, actual + 1);
  paginas.push(1);
  if (izquierda > 2) paginas.push("...");
  for (let p = izquierda; p <= derecha; p++) paginas.push(p);
  if (derecha < total - 1) paginas.push("...");
  paginas.push(total);
  return paginas;
};

export const CatalogoView = ({
  vehiculos,
  filtros,
  filtrosActivos,
  categorias,
  isAdmin,
  totalCount,
  currentPage,
  totalPages,
  sort,
  opcionesDeOrden,
  cotizacionDolar,
  mostrarPrecios,
  whatsapp,
}: CatalogoViewProps) => {
  const urlDePagina = (pagina: number) =>
    construirUrl(filtrosActivos, sort, { page: String(pagina) });

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] pt-header pb-8 flex flex-col">

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

          <SortSelect currentSort={sort} opciones={opcionesDeOrden} />
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex-grow w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Filters */}
          <div className="lg:col-span-3">
            <CatalogFilters filtros={filtros} />
          </div>

          {/* Vehicles */}
          <div className="lg:col-span-9">
            {vehiculos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {vehiculos.map((v, index) => (
                  <div key={v.id}>
                    <VehicleCard
                      vehiculo={v}
                      priority={index < 2}
                      cotizacionDolar={cotizacionDolar}
                      mostrarPrecios={mostrarPrecios}
                      accionAdmin={
                        isAdmin ? (
                          <VehicleCardAdminOverlay
                            vehiculo={v}
                            categorias={categorias}
                            cotizacionDolar={cotizacionDolar}
                            mostrarPrecios={mostrarPrecios}
                          />
                        ) : null
                      }
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center flex flex-col items-center justify-center bg-black/5 border border-dashed border-black/10 rounded">
                <h6 className="text-xl font-bold mb-1">No se encontraron vehículos.</h6>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3 max-w-md">Los filtros aplicados no coinciden con ninguna unidad en stock.</p>
                <Link href="/catalogo" className="bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-[10px] font-black uppercase tracking-[0.1em] px-4 py-1.5 rounded hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] transition">
                  Limpiar Búsqueda
                </Link>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col items-center gap-2">
                <div className="flex items-center gap-1">
                  <Link
                    href={currentPage > 1 ? urlDePagina(currentPage - 1) : "#"}
                    aria-label="Página anterior"
                    className={`w-10 h-10 flex items-center justify-center rounded transition-all ${currentPage === 1 ? 'text-black/30 pointer-events-none' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--surface-low))] hover:text-[hsl(var(--foreground))]'}`}
                  >
                    <ChevronLeft size={18} />
                  </Link>

                  {numerosDePagina(currentPage, totalPages).map((p, i) =>
                    p === "..." ? (
                      <div key={`ellipsis-${i}`} className="w-10 h-10 flex items-center justify-center text-[hsl(var(--muted-foreground))] font-bold">…</div>
                    ) : (
                      <Link
                        key={p}
                        href={urlDePagina(p)}
                        className={`w-10 h-10 flex items-center justify-center font-bold text-sm rounded transition-all ${p === currentPage ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md' : 'text-[hsl(var(--foreground))] hover:bg-[hsl(var(--surface-low))]'}`}
                      >
                        {p}
                      </Link>
                    )
                  )}

                  <Link
                    href={currentPage < totalPages ? urlDePagina(currentPage + 1) : "#"}
                    aria-label="Página siguiente"
                    className={`w-10 h-10 flex items-center justify-center rounded transition-all ${currentPage === totalPages ? 'text-black/30 pointer-events-none' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--surface-low))] hover:text-[hsl(var(--foreground))]'}`}
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

      {/* Banner: son dos botones de WhatsApp, así que sin teléfono no va. */}
      {whatsapp && (
      <div className="mt-12 bg-[#0a0a0b] py-10 px-3 relative overflow-hidden group">
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 w-[800px] h-[800px] opacity-20 pointer-events-none transition-transform duration-1000 group-hover:scale-105" style={{ background: 'radial-gradient(circle at center, hsl(var(--primary) / 0.2) 0%, transparent 70%)' }} />
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-2">
              ¿No encontrás lo que buscás?
            </h2>
            <p className="text-lg text-white/50 font-medium mb-4 leading-relaxed">
              Nuestro equipo de importación personalizada se encarga de traer el vehículo de tus sueños directo a tu puerta.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href={whatsapp.importacion}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] rounded hover:bg-white hover:text-[hsl(var(--primary))] transition text-center"
              >
                Nosotros lo traemos por vos 🚀
              </a>
              <a
                href={whatsapp.asesor}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-white/20 text-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] rounded hover:bg-white/10 hover:border-white/30 transition text-center"
              >
                Hablar con un asesor
              </a>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
