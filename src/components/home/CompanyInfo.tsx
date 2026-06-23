"use client";

import { Box, Container, Grid, Typography, Stack } from "@mui/material";

export function CompanyInfo() {
  return (
    <Box component="section" id="nosotros" sx={{ py: 16, bgcolor: 'background.default', overflow: 'hidden', position: 'relative' }}>
      <Container maxWidth="lg">
        <Grid container spacing={16} sx={{ alignItems: 'center' }}>
          {/* Content Area */}
          <Grid size={{ xs: 12, lg: 6 }} >
            <Typography 
              variant="overline" 
              sx={{ 
                fontSize: '10px', 
                fontWeight: 900, 
                letterSpacing: '0.5em', 
                color: 'primary.main', 
                mb: 4, 
                display: 'block' 
              }}
            >
              Our DNA / Legacy
            </Typography>
            <Typography 
              variant="h2" 
              sx={{ 
                fontSize: { xs: '3.75rem', md: '4.5rem' }, 
                fontWeight: 800, 
                textTransform: 'uppercase', 
                letterSpacing: '-0.02em', 
                color: 'text.primary', 
                lineHeight: 1, 
                mb: 6 
              }}
            >
              La Maestría <br /> 
              detrás del <br /> 
              volante.
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'text.secondary', 
                lineHeight: 1.6, 
                mb: 8, 
                fontSize: '1.125rem', 
                fontWeight: 500, 
                maxWidth: '28rem' 
              }}
            >
              En JBJ Automotores, operamos bajo el principio de que un vehículo es una extensión de la identidad. Nuestra trayectoria de dos décadas redefine la curaduría automotriz, seleccionando piezas que trascienden lo convencional.
            </Typography>

            <Grid container spacing={8} sx={{ pt: 6, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <Grid size={{ xs: 6 }} >
                <Typography sx={{ fontSize: '3rem', fontWeight: 700, color: 'text.primary', mb: 2, lineHeight: 1 }}>
                  5K<Box component="span" sx={{ color: 'primary.main', fontStyle: 'italic' }}>+</Box>
                </Typography>
                <Typography sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)' }}>
                  Relaciones Consolidadas
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }} >
                <Typography sx={{ fontSize: '3rem', fontWeight: 700, color: 'text.primary', mb: 2, lineHeight: 1 }}>
                  24<Box component="span" sx={{ color: 'primary.main', fontStyle: 'italic' }}>/</Box>7
                </Typography>
                <Typography sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)' }}>
                  Soporte de Ingeniería
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          {/* Image Area with Editorial Overlap */}
          <Grid size={{ xs: 12, lg: 6 }} sx={{ position: 'relative' }}>
             <Box 
               sx={{ 
                 aspectRatio: '1', 
                 bgcolor: 'background.paper', 
                 borderRadius: 2, 
                 position: 'relative', 
                 zIndex: 10, 
                 overflow: 'hidden',
                 boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
               }}
             >
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <Typography sx={{ fontSize: '15rem', fontWeight: 900, color: 'rgba(255,255,255,0.02)', transform: 'rotate(-12deg)', fontStyle: 'italic' }}>
                     JBJ
                   </Typography>
                </Box>
             </Box>
             {/* Decorative overlapping element */}
             <Box sx={{ position: 'absolute', top: -48, right: -48, width: 256, height: 256, bgcolor: 'rgba(194,65,12,0.05)', borderRadius: '50%', filter: 'blur(64px)' }} />
             <Box sx={{ position: 'absolute', bottom: 48, left: -48, width: 192, height: 192, border: '20px solid #171717', zIndex: 0 }} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}