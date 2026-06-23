"use client";

import Image from "next/image";
import Link from "next/link";
import { Box, Container, Typography, Button, Stack, Grid } from "@mui/material";

export function Hero() {
  return (
    <Box 
      component="section" 
      sx={{ 
        position: 'relative', 
        minHeight: '90vh', 
        display: 'flex', 
        alignItems: 'center', 
        pt: 10, 
        overflow: 'hidden', 
        bgcolor: 'background.default' 
      }}
    >
      {/* Background Text Decor */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: 0, 
          transform: 'translateY(-50%)', 
          userSelect: 'none', 
          pointerEvents: 'none', 
          opacity: 0.02, 
          whiteSpace: 'nowrap' 
        }}
      >
         <Typography sx={{ fontSize: '30rem', fontWeight: 900, letterSpacing: '-0.05em', fontStyle: 'italic', lineHeight: 1 }}>
           KINETIC
         </Typography>
      </Box>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10 }}>
        <Grid container spacing={6} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, lg: 7 }} sx={{ zIndex: 10 }}>
            <Typography 
              variant="overline" 
              sx={{ 
                fontSize: '10px', 
                fontWeight: 900, 
                letterSpacing: '0.5em', 
                color: 'primary.main', 
                mb: 3, 
                display: 'block' 
              }}
            >
              Selection 2024
            </Typography>
            <Typography 
              variant="h1" 
              sx={{ 
                fontSize: { xs: '4rem', md: '6rem', lg: '8rem' }, 
                fontWeight: 800, 
                textTransform: 'uppercase', 
                letterSpacing: '-0.02em', 
                color: 'text.primary', 
                mb: 4,
                lineHeight: 0.9
              }}
            >
              Ingeniería <br /> 
              <Box component="span" sx={{ color: 'primary.main', fontStyle: 'italic' }}>en Movimiento.</Box>
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontSize: { xs: '1.125rem', md: '1.25rem' }, 
                color: 'text.secondary', 
                maxWidth: '600px', 
                mb: 6, 
                fontWeight: 500, 
                lineHeight: 1.6 
              }}
            >
              La curaduría automotriz más exclusiva de la región. Rendimiento sin precedentes, estética sin compromisos. 
            </Typography>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button 
                component={Link} 
                href="/catalogo" 
                variant="contained" 
                disableElevation
                sx={{
                  background: "linear-gradient(135deg, #c2410c 0%, #ea580c 100%)",
                  color: "#ffffff",
                  px: 5,
                  py: 2.5,
                  fontSize: '10px',
                  fontWeight: 900,
                  letterSpacing: '0.3em',
                  boxShadow: '0 25px 50px -12px rgba(194,65,12,0.5)',
                  '&:hover': {
                    background: "linear-gradient(135deg, #9a3412 0%, #c2410c 100%)",
                    transform: 'translateY(-4px)',
                  },
                  transition: 'all 0.3s'
                }}
              >
                Explorar Galería
              </Button>
              <Button 
                component={Link} 
                href="#ubicacion" 
                variant="outlined" 
                sx={{
                  borderColor: 'rgba(255,255,255,0.1)',
                  color: 'text.primary',
                  px: 5,
                  py: 2.5,
                  fontSize: '10px',
                  fontWeight: 900,
                  letterSpacing: '0.3em',
                  bgcolor: 'rgba(255,255,255,0.02)',
                  '&:hover': {
                    bgcolor: 'text.primary',
                    color: 'background.default',
                    borderColor: 'text.primary'
                  },
                  transition: 'all 0.3s'
                }}
              >
                Agendar Visita
              </Button>
            </Stack>
          </Grid>

          {/* Overlapping Image area */}
          <Grid size={{ xs: 12, lg: 5 }} sx={{ position: 'relative', mt: { xs: 6, lg: 0 } }}>
            <Box 
              sx={{ 
                position: 'relative', 
                aspectRatio: '4/5', 
                width: '100%', 
                bgcolor: 'background.paper', 
                borderRadius: 2, 
                overflow: 'visible' 
              }}
            >
              {/* Silhouette / Shadow under the vehicle */}
              <Box 
                sx={{ 
                  position: 'absolute', 
                  bottom: -40, 
                  right: -40, 
                  width: '100%', 
                  height: '50%', 
                  bgcolor: 'rgba(194,65,12,0.05)', 
                  filter: 'blur(64px)', 
                  borderRadius: '50%' 
                }} 
              />
              
              {/* Empty space for the high-end vehicle PNG you'll provide */}
              <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
                 <Typography 
                   sx={{ 
                     fontSize: '10px', 
                     fontWeight: 900, 
                     textTransform: 'uppercase', 
                     letterSpacing: '0.2em', 
                     color: 'rgba(255,255,255,0.1)', 
                     transform: 'rotate(90deg)', 
                     transformOrigin: 'center' 
                   }}
                 >
                    Masterpiece / 01
                 </Typography>
              </Box>
              
              {/* The "Bleed" element */}
              <Box sx={{ position: 'absolute', top: '50%', left: -80, transform: 'translateY(-50%)', width: 160, height: '1px', bgcolor: 'rgba(194,65,12,0.2)' }} />
            </Box>            

          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}