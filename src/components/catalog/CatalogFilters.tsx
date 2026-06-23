"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Box, Typography, Stack, Checkbox, FormControlLabel, Select, MenuItem, IconButton, Button } from "@mui/material";

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
    <Box
      sx={{
        width: '100%',
        bgcolor: 'background.paper',
        p: 3,
        border: '1px solid rgba(255,255,255,0.05)',
        transition: 'opacity 0.2s',
        opacity: isPending ? 0.6 : 1,
        pointerEvents: isPending ? 'none' : 'auto'
      }}
    >
      {/* Header */}
      <Stack direction="row" sx={{ mb: 4, alignItems: "center", justifyContent: "space-between" }}>
        <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
          <SlidersHorizontal size={14} color="#c2410c" />
          <Typography sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: '0.1em' }}>
            Filtros
          </Typography>
          {hasFilters && (
            <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: 'primary.main', color: 'white', fontSize: '9px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {currentMarcas.length +
                currentTransmisiones.length +
                currentCombustibles.length +
                (currentAnioDesde ? 1 : 0) +
                (currentAnioHasta ? 1 : 0)}
            </Box>
          )}
        </Stack>
        {hasFilters && (
          <Button
            onClick={() => navigate("")}
            variant="text"
            startIcon={<X size={11} />}
            sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'primary.main', minWidth: 0, p: 0.5, '&:hover': { color: 'text.primary', bgcolor: 'transparent' } }}
          >
            Limpiar todo
          </Button>
        )}
      </Stack>

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
        <Stack direction="row" spacing={1.5}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary', mb: 0.5 }}>
              Desde
            </Typography>
            <Select
              value={currentAnioDesde}
              onChange={(e) => navigate(buildParams({ anioDesde: e.target.value || null }))}
              displayEmpty
              fullWidth
              size="small"
              sx={{ bgcolor: '#0a0a0a', fontSize: '12px', fontWeight: 500, '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
            >
              <MenuItem value="" sx={{ fontSize: '12px' }}>Todos</MenuItem>
              {years.map((y) => (
                <MenuItem key={y} value={y.toString()} sx={{ fontSize: '12px' }}>{y}</MenuItem>
              ))}
            </Select>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary', mb: 0.5 }}>
              Hasta
            </Typography>
            <Select
              value={currentAnioHasta}
              onChange={(e) => navigate(buildParams({ anioHasta: e.target.value || null }))}
              displayEmpty
              fullWidth
              size="small"
              sx={{ bgcolor: '#0a0a0a', fontSize: '12px', fontWeight: 500, '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
            >
              <MenuItem value="" sx={{ fontSize: '12px' }}>Todos</MenuItem>
              {years.map((y) => (
                <MenuItem key={y} value={y.toString()} sx={{ fontSize: '12px' }}>{y}</MenuItem>
              ))}
            </Select>
          </Box>
        </Stack>
      </FilterSection>
    </Box>
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
  <Box sx={{ mb: 3, pb: noBorder ? 0 : 3, borderBottom: noBorder ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
    <Typography sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.25em', color: 'text.secondary', mb: 1.5 }}>
      {title}
    </Typography>
    <Stack spacing={1}>{children}</Stack>
  </Box>
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
  <FormControlLabel
    control={
      <Checkbox
        checked={checked}
        onChange={onChange}
        size="small"
        sx={{
          color: 'rgba(255,255,255,0.2)',
          '&.Mui-checked': { color: 'primary.main' }
        }}
      />
    }
    label={<Typography sx={{ fontSize: '13px', fontWeight: checked ? 700 : 500, color: checked ? 'text.primary' : 'text.secondary' }}>{label}</Typography>}
    sx={{ m: 0, '&:hover .MuiTypography-root': { color: 'text.primary' } }}
  />
);
