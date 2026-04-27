"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { SlidersHorizontal, X } from "lucide-react";

interface CatalogFiltersProps {
  marcasDisponibles: string[];
  combustiblesDisponibles: string[];
  anioMin: number;
  anioMax: number;
}

export const CatalogFilters = ({
  marcasDisponibles,
  combustiblesDisponibles,
  anioMin,
  anioMax,
}: CatalogFiltersProps) => {
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
  const currentTransmisiones = searchParams.getAll("transmision");
  const currentCombustibles = searchParams.getAll("combustible");
  const currentAnioDesde = searchParams.get("anioDesde") || "";
  const currentAnioHasta = searchParams.get("anioHasta") || "";

  const hasFilters =
    currentMarcas.length > 0 ||
    currentTransmisiones.length > 0 ||
    currentCombustibles.length > 0 ||
    currentAnioDesde ||
    currentAnioHasta;

  // Year options
  const years: number[] = [];
  for (let y = anioMax; y >= anioMin; y--) years.push(y);

  return (
    <div
      className={`w-full bg-surface-lowest p-6 shadow-sm border border-foreground/[0.05] transition-opacity ${
        isPending ? "opacity-60 pointer-events-none" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-primary" />
          <h4 className="font-black text-foreground text-sm uppercase tracking-widest">
            Filtros
          </h4>
          {hasFilters && (
            <span className="w-5 h-5 rounded-full bg-primary text-white text-[9px] font-black flex items-center justify-center">
              {currentMarcas.length +
                currentTransmisiones.length +
                currentCombustibles.length +
                (currentAnioDesde ? 1 : 0) +
                (currentAnioHasta ? 1 : 0)}
            </span>
          )}
        </div>
        {hasFilters && (
          <button
            onClick={() => navigate("")}
            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:text-foreground transition-colors"
          >
            <X size={11} />
            Limpiar todo
          </button>
        )}
      </div>

      {/* ── Marca ── */}
      <FilterSection title="Marca">
        {marcasDisponibles.map((marca) => (
          <CheckItem
            key={marca}
            label={marca}
            checked={currentMarcas.includes(marca)}
            onChange={() => toggleMulti("marca", marca)}
          />
        ))}
      </FilterSection>

      {/* ── Transmisión ── */}
      <FilterSection title="Transmisión">
        {(["MANUAL", "AUTOMATICA", "CVT"] as const).map((t) => (
          <CheckItem
            key={t}
            label={t === "AUTOMATICA" ? "Automática" : t === "CVT" ? "CVT" : "Manual"}
            checked={currentTransmisiones.includes(t)}
            onChange={() => toggleMulti("transmision", t)}
          />
        ))}
      </FilterSection>

      {/* ── Combustible ── */}
      {combustiblesDisponibles.length > 0 && (
        <FilterSection title="Combustible">
          {combustiblesDisponibles.map((c) => (
            <CheckItem
              key={c}
              label={c.charAt(0) + c.slice(1).toLowerCase()}
              checked={currentCombustibles.includes(c)}
              onChange={() => toggleMulti("combustible", c)}
            />
          ))}
        </FilterSection>
      )}

      {/* ── Año ── */}
      <FilterSection title="Año" noBorder>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40">
              Desde
            </span>
            <select
              value={currentAnioDesde}
              onChange={(e) =>
                navigate(buildParams({ anioDesde: e.target.value || null }))
              }
              className="bg-surface-low border-none p-2.5 text-[12px] font-medium outline-none text-foreground cursor-pointer focus:ring-1 focus:ring-primary/20 rounded-sm"
            >
              <option value="">Todos</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40">
              Hasta
            </span>
            <select
              value={currentAnioHasta}
              onChange={(e) =>
                navigate(buildParams({ anioHasta: e.target.value || null }))
              }
              className="bg-surface-low border-none p-2.5 text-[12px] font-medium outline-none text-foreground cursor-pointer focus:ring-1 focus:ring-primary/20 rounded-sm"
            >
              <option value="">Todos</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FilterSection>
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
  <div className={`mb-6 ${!noBorder ? "pb-6 border-b border-foreground/[0.05]" : ""}`}>
    <h5 className="text-[10px] font-black uppercase tracking-[0.25em] text-foreground/40 mb-3">
      {title}
    </h5>
    <div className="space-y-2.5">{children}</div>
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
  <label className="flex items-center gap-3 cursor-pointer group select-none">
    <div
      onClick={onChange}
      className={`w-4 h-4 flex items-center justify-center flex-shrink-0 transition-all ${
        checked
          ? "bg-primary"
          : "border border-foreground/20 group-hover:border-primary/50"
      }`}
    >
      {checked && <div className="w-2 h-2 bg-white" />}
    </div>
    <span
      onClick={onChange}
      className={`text-[13px] font-medium transition-colors ${
        checked ? "text-foreground font-bold" : "text-foreground/60 group-hover:text-foreground"
      }`}
    >
      {label}
    </span>
  </label>
);
