"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, Fuel, AlignJustify, Disc, MessageCircle } from "lucide-react";
import { VehicleGallery } from "@/components/catalog/VehicleGallery";
import { ContactForm } from "@/components/catalog/ContactForm";
import { Box, Button, Container, Grid, Stack, Typography } from "@mui/material";

export const VehicleDetailClient = ({ vehicle, vehiculoNombre, whatsappUrl }: any) => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.paper', color: 'text.primary', pt: 4, pb: 8 }}>
      <Container maxWidth="xl">
        <Box sx={{ height: 64, display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button
            component={Link}
            href="/catalogo"
            startIcon={<ArrowLeft size={16} />}
            sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'transparent' }, fontSize: '0.875rem', fontWeight: 700, textTransform: 'none' }}
          >
            Volver al catálogo
          </Button>
        </Box>

        <Grid container spacing={6}>
          <Grid size={{ xs: 12, lg: 7, xl: 8 }} >
            <VehicleGallery images={vehicle.imagenes} altText={vehiculoNombre} />
          </Grid>

          <Grid size={{ xs: 12, lg: 5, xl: 4 }} >
            <Stack spacing={4}>
              <Box>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Typography sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'primary.main', bgcolor: 'rgba(194,65,12,0.1)', px: 1, py: 0.5, borderRadius: 1 }}>
                    {vehicle.estado}
                  </Typography>
                  <Typography sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary', bgcolor: '#0a0a0a', px: 1, py: 0.5, borderRadius: 1 }}>
                    {vehicle.categoria.nombre}
                  </Typography>
                </Stack>

                <Typography variant="h1" sx={{ fontSize: { xs: '2.25rem', lg: '2.5rem' }, fontWeight: 900, letterSpacing: '-0.02em', textTransform: 'uppercase', mb: 1 }}>
                  {vehicle.marca} {vehicle.modelo}
                </Typography>
                <Typography sx={{ fontSize: '1rem', color: 'text.secondary', fontWeight: 500 }}>
                  {vehicle.version || vehicle.motor || "Especificación Estándar"}
                </Typography>
              </Box>

              <Typography sx={{ fontSize: { xs: '2.25rem', lg: '2.5rem' }, fontWeight: 900, letterSpacing: '-0.02em' }}>
                U$D {Number(vehicle.precio).toLocaleString("es-AR")}
              </Typography>

              <Button
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                variant="contained"
                endIcon={<MessageCircle size={18} />}
                sx={{
                  bgcolor: '#c2410c',
                  color: 'white',
                  py: 2,
                  fontSize: '0.875rem',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                  '&:hover': { bgcolor: 'black' }
                }}
              >
                Consultar por WhatsApp
              </Button>

              <Box sx={{ bgcolor: '#0a0a0a', borderRadius: 2, p: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
                <Typography sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary', mb: 2 }}>Ficha Rápida</Typography>
                <Stack spacing={2}>
                  <SpecItem icon={<Calendar size={16} />} label="Año" value={vehicle.anio} />
                  <SpecItem icon={<Disc size={16} />} label="KM" value={vehicle.kilometraje.toLocaleString("es-AR")} />
                  <SpecItem icon={<AlignJustify size={16} />} label="Transmisión" value={vehicle.transmision?.toLowerCase()} capitalize />
                  <SpecItem icon={<Fuel size={16} />} label="Combustible" value={vehicle.combustible?.toLowerCase()} capitalize border={false} />
                </Stack>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Box sx={{ mt: { xs: 8, lg: 12 }, pt: { xs: 6, lg: 8 }, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12, lg: 4 }} >
              <Typography variant="h2" sx={{ fontSize: '1.125rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', mb: 3 }}>
                Especificaciones
              </Typography>
              <Stack spacing={0}>
                <SpecRow label="Año" value={vehicle.anio} />
                <SpecRow label="Kilometraje" value={`${vehicle.kilometraje.toLocaleString("es-AR")} KM`} />
                <SpecRow label="Combustible" value={vehicle.combustible || "N/A"} />
                <SpecRow label="Transmisión" value={vehicle.transmision || "N/A"} />
                <SpecRow label="Potencia" value={vehicle.potencia ? `${vehicle.potencia} CV` : "N/A"} />
                <SpecRow label="Color" value={vehicle.color || "N/A"} />
                <SpecRow label="Puertas" value={vehicle.puertas || "N/A"} />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, lg: 8 }} >
              <Typography variant="h2" sx={{ fontSize: '1.125rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', mb: 3 }}>
                Descripción
              </Typography>
              {vehicle.descripcion ? (
                <Typography sx={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, fontWeight: 500, whiteSpace: 'pre-line' }}>
                  {vehicle.descripcion}
                </Typography>
              ) : (
                <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', fontStyle: 'italic' }}>
                  El vendedor no ha añadido una descripción para este vehículo.
                </Typography>
              )}
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: { xs: 8, lg: 12 }, pt: { xs: 6, lg: 8 }, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Grid container spacing={6} sx={{ alignItems: 'flex-start' }}>
            <Grid size={{ xs: 12, lg: 6 }} >
              <Typography sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em', color: 'primary.main', mb: 2 }}>
                ¿Te interesa?
              </Typography>
              <Typography variant="h2" sx={{ fontSize: '1.875rem', fontWeight: 900, letterSpacing: '-0.02em', textTransform: 'uppercase', mb: 2 }}>
                Consultá por esta unidad
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontWeight: 500, lineHeight: 1.6, mb: 3 }}>
                Completá el formulario y un asesor de JBJ Automotores se comunicará con vos a la brevedad para coordinar una visita o responder todas tus preguntas.
              </Typography>
              <Button
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                variant="text"
                startIcon={<MessageCircle size={14} />}
                sx={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary', p: 0, '&:hover': { color: 'primary.main', bgcolor: 'transparent' } }}
              >
                O escribinos directo por WhatsApp
              </Button>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }} >
              <ContactForm vehiculoId={vehicle.id} vehiculoNombre={vehiculoNombre} />
            </Grid>
          </Grid>
        </Box>

      </Container>
    </Box>
  );
};

const SpecItem = ({ icon, label, value, capitalize = false, border = true }: any) => (
  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pb: border ? 1.5 : 0, borderBottom: border ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
    <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
      {icon}
      <Typography sx={{ fontSize: '0.875rem', fontWeight: 700 }}>{label}</Typography>
    </Stack>
    <Typography sx={{ fontSize: '0.875rem', fontWeight: 900, textTransform: capitalize ? 'capitalize' : 'none' }}>{value}</Typography>
  </Stack>
);

const SpecRow = ({ label, value }: { label: string; value: string | number }) => (
  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.secondary' }}>{label}</Typography>
    <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, noWrap: true, pl: 2 }}>{value}</Typography>
  </Stack>
);
