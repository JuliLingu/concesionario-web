"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { FiltrosCatalogo } from "@/services/cache.service";

interface CatalogFiltersProps {
  /** Opciones derivadas del stock: ver getCachedFiltrosCatalogo. */
  filtros: FiltrosCatalogo;
}

/** Etiquetas legibles de los enums; el resto se muestra capitalizado. */
const LABEL_TRANSMISION: Record<string, string> = {
  AUTOMATICA: "Automática",
  MANUAL: "Manual",
  CVT: "CVT",
};

const capitalizar = (valor: string) =>
  valor.charAt(0) + valor.slice(1).toLowerCase();

export const CatalogFilters = ({ filtros }: CatalogFiltersProps) => {
  const { marcas, categorias, estados, transmisiones, combustibles, anios } = filtros;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // ── Helpers ──────────────────────────────────────────────────────────
  const buildParams = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      // Reset to page 1 whenever a filter changes
      params.delete("page");

      for (const [key, value] of Object.entries(updates)) {
        params.delete(key);
        if (value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, v));
          } else if (value !== "") {
            params.set(key, value);
          }
        }
      }
      return params.toString();
    },
    [searchParams]
  );

  const navigate = (qs: string) => {
    startTransition(() => router.push(`${pathname}?${qs}`));
  };

  // ── Toggle helpers ────────────────────────────────────────────────────
  const toggleMulti = (param: string, value: string) => {
    const current = searchParams.getAll(param);
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    navigate(buildParams({ [param]: next.length ? next : null }));
  };

  // ── Read current state ────────────────────────────────────────────────
  const currentMarcas = searchParams.getAll("marca");
  const currentCategorias = searchParams.getAll("categoria");
  const currentEstados = searchParams.getAll("estado");
  const currentTransmisiones = searchParams.getAll("transmision");
  const currentCombustibles = searchParams.getAll("combustible");
  const currentAnioDesde = searchParams.get("anioDesde") || "";
  const currentAnioHasta = searchParams.get("anioHasta") || "";

  const cantidadFiltros =
    currentMarcas.length +
    currentCategorias.length +
    currentEstados.length +
    currentTransmisiones.length +
    currentCombustibles.length +
    (currentAnioDesde ? 1 : 0) +
    (currentAnioHasta ? 1 : 0);

  const hasFilters = cantidadFiltros > 0;

  return (
    <div
      className={`w-full bg-[hsl(var(--card))] p-6 border border-black/5 transition-opacity duration-200 shadow-[0_20px_40px_rgba(26,28,30,0.06)] rounded ${
        isPending ? "opacity-60 pointer-events-none" : "opacity-100 pointer-events-auto"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-[hsl(var(--primary))]" />
          <span className="font-black uppercase text-sm tracking-[0.1em] text-[hsl(var(--foreground))]">
            Filtros
          </span>
          {hasFilters && (
            <div className="w-5 h-5 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-[9px] font-black flex items-center justify-center">
              {cantidadFiltros}
            </div>
          )}
        </div>
        {hasFilters && (
          <button
            onClick={() => navigate("")}
            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.1em] text-[hsl(var(--primary))] hover:text-[hsl(var(--foreground))] transition-colors p-1"
          >
            <X size={11} />
            Limpiar todo
          </button>
        )}
      </div>

      {/* ── Categoría ── */}
      {categorias.length > 0 && (
        <FilterSection title="Categoría">
          {categorias.map((c) => (
            <CheckItem
              key={c.slug}
              label={c.nombre}
              checked={currentCategorias.includes(c.slug)}
              onChange={() => toggleMulti("categoria", c.slug)}
            />
          ))}
        </FilterSection>
      )}

      {/* ── Estado ── */}
      {estados.length > 1 && (
        <FilterSection title="Condición">
          {estados.map((e) => (
            <CheckItem
              key={e}
              label={capitalizar(e)}
              checked={currentEstados.includes(e)}
              onChange={() => toggleMulti("estado", e)}
            />
          ))}
        </FilterSection>
      )}

      {/* ── Marca ── */}
      {marcas.length > 0 && (
        <FilterSection title="Marca">
          {marcas.map((marca) => (
            <CheckItem
              key={marca}
              label={marca}
              checked={currentMarcas.includes(marca)}
              onChange={() => toggleMulti("marca", marca)}
            />
          ))}
        </FilterSection>
      )}

      {/* ── Transmisión ── */}
      {transmisiones.length > 0 && (
        <FilterSection title="Transmisión">
          {transmisiones.map((t) => (
            <CheckItem
              key={t}
              label={LABEL_TRANSMISION[t] ?? capitalizar(t)}
              checked={currentTransmisiones.includes(t)}
              onChange={() => toggleMulti("transmision", t)}
            />
          ))}
        </FilterSection>
      )}

      {/* ── Combustible ── */}
      {combustibles.length > 0 && (
        <FilterSection title="Combustible">
          {combustibles.map((c) => (
            <CheckItem
              key={c}
              label={capitalizar(c)}
              checked={currentCombustibles.includes(c)}
              onChange={() => toggleMulti("combustible", c)}
            />
          ))}
        </FilterSection>
      )}

      {/* ── Año ── */}
      {anios.length > 0 && (
      <FilterSection title="Año" noBorder>
        <div className="flex gap-4">
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-[9px] font-black uppercase tracking-[0.1em] text-[hsl(var(--muted-foreground))]">
              Desde
            </label>
            <select
              value={currentAnioDesde}
              onChange={(e) => navigate(buildParams({ anioDesde: e.target.value || null }))}
              className="bg-[hsl(var(--input))] text-xs font-medium px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]/20 text-[hsl(var(--foreground))] w-full appearance-none cursor-pointer"
            >
              <option value="">Todos</option>
              {anios.map((y) => (
                <option key={y} value={y.toString()}>{y}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-[9px] font-black uppercase tracking-[0.1em] text-[hsl(var(--muted-foreground))]">
              Hasta
            </label>
            <select
              value={currentAnioHasta}
              onChange={(e) => navigate(buildParams({ anioHasta: e.target.value || null }))}
              className="bg-[hsl(var(--input))] text-xs font-medium px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]/20 text-[hsl(var(--foreground))] w-full appearance-none cursor-pointer"
            >
              <option value="">Todos</option>
              {anios.map((y) => (
                <option key={y} value={y.toString()}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </FilterSection>
      )}
    </div>
  );
};

// ── Sub-components ──────────────────────────────────────────────────────

const FilterSection = ({
  title,
  children,
  noBorder,
}: {
  title: string;
  children: React.ReactNode;
  noBorder?: boolean;
}) => (
  <div className={`mb-6 pb-${noBorder ? '0' : '6'} ${noBorder ? '' : 'border-b border-black/5'}`}>
    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-[hsl(var(--muted-foreground))] mb-4">
      {title}
    </h3>
    <div className="flex flex-col gap-2.5">{children}</div>
  </div>
);

const CheckItem = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) => (
  <label className="flex items-center gap-3 cursor-pointer group m-0">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 rounded-sm border-gray-300 accent-[hsl(var(--primary))] cursor-pointer"
    />
    <span className={`text-[13px] transition-colors group-hover:text-[hsl(var(--foreground))] ${checked ? 'font-bold text-[hsl(var(--foreground))]' : 'font-medium text-[hsl(var(--muted-foreground))]'}`}>
      {label}
    </span>
  </label>
);
