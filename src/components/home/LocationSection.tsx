"use client";

import { Box, Container, Grid, Typography, Stack } from "@mui/material";

interface LocationSectionProps {
  configuracion?: any;
}

export function LocationSection({ configuracion }: LocationSectionProps) {
  const address = configuracion?.direccion || "Av. Principal 123, Buenos Aires";

  return (
    <Box component="section" id="ubicacion" sx={{ py: 12, bgcolor: '#171717' }}>
      <Container maxWidth="lg">
        <Grid container sx={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', borderRadius: 2, overflow: 'hidden' }}>
          {/* Info Column */}
          <Grid size={{ xs: 12, lg: 6 }} sx={{ bgcolor: '#0a0a0a', p: { xs: 6, md: 12 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography 
              variant="overline" 
              sx={{ 
                fontSize: '10px', 
                fontWeight: 900, 
                textTransform: 'uppercase', 
                letterSpacing: '0.5em', 
                color: 'primary.main', 
                mb: 3, 
                display: 'block' 
              }}
            >
              Visit Us
            </Typography>
            <Typography 
              variant="h2" 
              sx={{ 
                fontSize: { xs: '3rem', md: '3.75rem' }, 
                fontWeight: 800, 
                color: 'text.primary', 
                textTransform: 'uppercase', 
                letterSpacing: '-0.02em', 
                mb: 8,
                lineHeight: 1
              }}
            >
              Nuestra Casa <br /> Central.
            </Typography>

            <Stack spacing={6}>
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Box sx={{ width: '1px', height: 48, bgcolor: 'rgba(194,65,12,0.3)' }} />
                <Box>
                  <Typography sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', mb: 1 }}>Location</Typography>
                  <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: '1.125rem' }}>{address}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 3 }}>
                <Box sx={{ width: '1px', height: 48, bgcolor: 'rgba(194,65,12,0.3)' }} />
                <Box>
                  <Typography sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', mb: 1 }}>Contact</Typography>
                  <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{configuracion?.telefono || "+54 9 11 1234-5678"}</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', mt: 0.5 }}>{configuracion?.email || "contacto@concesionaria.com"}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 3 }}>
                <Box sx={{ width: '1px', height: 48, bgcolor: 'rgba(194,65,12,0.3)' }} />
                <Box>
                  <Typography sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', mb: 1 }}>Horarios</Typography>
                  <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'pre-line' }}>{configuracion?.horariosAtencion || "Lun — Vie: 09:00 — 19:00\nSábados: 10:00 — 14:00"}</Typography>
                </Box>
              </Box>
            </Stack>
          </Grid>

          {/* Map Column */}
          <Grid 
            size={{ xs: 12, lg: 6 }} 
            sx={{ 
              height: { xs: 400, lg: 'auto' }, 
              bgcolor: '#171717', 
              position: 'relative', 
              filter: 'grayscale(100%)', 
              transition: 'filter 1s ease', 
              '&:hover': { filter: 'grayscale(0%)' } 
            }}
          >
             <iframe 
              src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`} 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy"
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
