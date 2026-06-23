"use client";

import { VehicleCard } from "@/components/catalog/VehicleCard";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { SortController } from "@/components/catalog/SortController";
import { LayoutGrid, List, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Box, Button, Container, Grid, IconButton, Stack, Typography } from "@mui/material";

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
  anioHasta
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 16, pb: 8, display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <Container maxWidth="xl" sx={{ mb: 5 }}>
        <Typography sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em', color: 'primary.main', mb: 2 }}>
          Galería de Stock
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{alignItems:{ xs: 'flex-start', md: 'flex-end' }, justifyContent:"space-between"}}>
          <Box>
            <Typography variant="h1" sx={{ fontSize: '3rem', fontWeight: 700, letterSpacing: '-0.02em', mb: 1 }}>
              Nuestro Stock
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontWeight: 500, fontStyle: 'italic' }}>
              {totalCount === 0
                ? "No hay vehículos que coincidan con tu búsqueda."
                : `Mostrando ${(currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} de ${totalCount} vehículos disponibles.`}
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} sx={{ bgcolor: 'background.paper', p: 1, border: '1px solid rgba(255,255,255,0.05)', borderRadius: 1, alignItems: 'center' }}>
            <Box
              component="select"
              id="sort-select"
              sx={{ bgcolor: 'transparent', color: 'text.primary', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', border: 'none', borderRight: '1px solid rgba(255,255,255,0.1)', pr: 2, mr: 1, outline: 'none', cursor: 'pointer', '& option': { bgcolor: '#0a0a0a' } }}
            >
              {SORT_OPTIONS.map((o: any) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Box>
            <IconButton size="small" sx={{ color: 'primary.main', bgcolor: 'rgba(194,65,12,0.1)', borderRadius: 1 }}>
              <LayoutGrid size={18} />
            </IconButton>
            <IconButton size="small" sx={{ color: 'text.secondary', borderRadius: 1, '&:hover': { color: 'text.primary' } }}>
              <List size={18} />
            </IconButton>
          </Stack>
        </Stack>
      </Container>

      <SortController currentSort={sort} />

      {/* Main Grid */}
      <Container maxWidth="xl" sx={{ flexGrow: 1 }}>
        <Grid container spacing={5}>
          {/* Filters */}
          <Grid size={{ xs: 12, lg: 3 }} >
            <CatalogFilters
              marcasDisponibles={marcasDisponibles}
              combustiblesDisponibles={combustiblesDisponibles}
              anioMin={anioMin}
              anioMax={anioMax}
            />
          </Grid>

          {/* Vehicles */}
          <Grid size={{ xs: 12, lg: 9 }} >
            {vehiculos.length > 0 ? (
              <Grid container spacing={3}>
                {vehiculos.map((v: any) => (
                  <Grid size={{ xs: 12, sm: 6, xl: 4 }} key={v.id}>
                    <VehicleCard vehiculo={v} isAdmin={isAdmin} categorias={categorias} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ py: 10, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>No se encontraron vehículos.</Typography>
                <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', mb: 3, maxWidth: 400 }}>Los filtros aplicados no coinciden con ninguna unidad en stock.</Typography>
                <Button component={Link} href="/catalogo" variant="contained" sx={{ bgcolor: 'text.primary', color: 'background.default', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', px: 4, py: 1.5, '&:hover': { bgcolor: 'primary.main', color: 'white' } }}>
                  Limpiar Búsqueda
                </Button>
              </Box>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Stack direction="row" spacing={1}>
                  <IconButton
                    component={Link}
                    href={currentPage > 1 ? buildUrl({ page: String(currentPage - 1) }) : "#"}
                    disabled={currentPage === 1}
                    sx={{ width: 40, height: 40, color: 'text.secondary', '&:hover': { bgcolor: 'background.paper', color: 'text.primary' } }}
                  >
                    <ChevronLeft size={18} />
                  </IconButton>

                  {generatePageNumbers(currentPage, totalPages).map((p, i) =>
                    p === "..." ? (
                      <Box key={`ellipsis-${i}`} sx={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', fontWeight: 700 }}>…</Box>
                    ) : (
                      <Box
                        key={p}
                        component={Link}
                        href={buildUrl({ page: String(p) })}
                        sx={{
                          width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem', borderRadius: 1, textDecoration: 'none', transition: 'all 0.2s',
                          ...(p === currentPage ? { bgcolor: 'primary.main', color: 'white', boxShadow: 2 } : { color: 'text.primary', '&:hover': { bgcolor: 'background.paper' } })
                        }}
                      >
                        {p}
                      </Box>
                    )
                  )}

                  <IconButton
                    component={Link}
                    href={currentPage < totalPages ? buildUrl({ page: String(currentPage + 1) }) : "#"}
                    disabled={currentPage === totalPages}
                    sx={{ width: 40, height: 40, color: 'text.secondary', '&:hover': { bgcolor: 'background.paper', color: 'text.primary' } }}
                  >
                    <ChevronRight size={18} />
                  </IconButton>
                </Stack>
                <Typography sx={{ fontSize: '11px', fontWeight: 500, color: 'text.secondary' }}>Página {currentPage} de {totalPages}</Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Banner */}
      <Box sx={{ mt: 12, bgcolor: '#0a0a0b', py: 10, px: 3, position: 'relative', overflow: 'hidden', '&:hover .glow': { transform: 'scale(1.05)' } }}>
        <Box className="glow" sx={{ position: 'absolute', top: '50%', right: 0, transform: 'translateY(-50%) translateX(33%)', width: 800, height: 800, opacity: 0.2, background: 'radial-gradient(circle at center, rgba(194,65,12,0.2) 0%, transparent 70%)', pointerEvents: 'none', transition: 'transform 1s' }} />
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 10 }}>
          <Box sx={{ maxWidth: 600 }}>
            <Typography variant="h2" sx={{ fontSize: { xs: '2.25rem', md: '3rem' }, fontWeight: 700, letterSpacing: '-0.02em', color: 'white', mb: 2 }}>
              ¿No encontrás lo que buscás?
            </Typography>
            <Typography sx={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500, mb: 4, lineHeight: 1.6 }}>
              Nuestro equipo de importación personalizada se encarga de traer el vehículo de tus sueños directo a tu puerta.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button component={Link} href="#importacion" variant="contained" sx={{ bgcolor: 'primary.main', color: 'white', px: 4, py: 2, fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', '&:hover': { bgcolor: 'white', color: 'primary.main' } }}>
                Nosotros lo traemos por vos 🚀
              </Button>
              <Button component={Link} href="#asesor" variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white', px: 4, py: 2, fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.3)' } }}>
                Hablar con un asesor
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};
