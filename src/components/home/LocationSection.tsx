"use client";

import { Box, Container, Grid, Typography, Stack } from "@mui/material";

export function LocationSection() {
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
                  <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: '1.125rem' }}>Av. Principal 123, Buenos Aires</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 3 }}>
                <Box sx={{ width: '1px', height: 48, bgcolor: 'rgba(194,65,12,0.3)' }} />
                <Box>
                  <Typography sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', mb: 1 }}>Open Hours</Typography>
                  <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Lun — Vie: 09:00 — 19:00</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', mt: 0.5 }}>Sábados: 10:00 — 14:00</Typography>
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
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3285.218552991631!2d-58.4613291!3d-34.573351!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb59020000001%3A0x123456789!2sAv.%20de%20los%20Incas%201234!5e0!3m2!1ses!2sar!4v1710000000000!5m2!1ses!2sar" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy"
            />
            {/* Overlay Tag */}
            <Box sx={{ position: 'absolute', top: 48, right: 48, bgcolor: '#ffffff', color: '#000000', p: 3, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
               <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', fontStyle: 'italic' }}>HQ-01</Typography>
               <Typography sx={{ fontSize: '8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.4em', color: 'rgba(0,0,0,0.4)', mt: 0.5 }}>Buenos Aires Est.</Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
