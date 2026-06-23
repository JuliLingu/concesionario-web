"use client";
import { Car } from "lucide-react";
import { Box, Container, Typography, Stack, Link as MuiLink } from "@mui/material";

export function Footer() {
  return (
    <Box component="footer" sx={{ py: 4, bgcolor: '#1a1c1e' }}>
      <Container maxWidth="lg">
        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          spacing={3}
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          {/* LOGO Y NOMBRE */}
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box sx={{ p: 0.75, borderRadius: 2, bgcolor: 'rgba(194,65,12,0.1)' }}>
              <Car style={{ color: "#c2410c", width: 20, height: 20 }} />
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
              JBJ <span style={{ color: "#c2410c" }}>Automotores</span>
            </Typography>
          </Stack>

          {/* TEXTO CENTRAL */}
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.35)', fontWeight: 300, textAlign: 'center' }}>
            Vehículos de calidad. Concesionario en Argentina. {new Date().getFullYear()}
          </Typography>

          {/* ENLACES SECUNDARIOS */}
          <Stack direction="row" spacing={4}>
            <MuiLink 
              href="#" 
              underline="none"
              sx={{ 
                fontSize: '0.75rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.1em', 
                color: 'rgba(255,255,255,0.35)',
                transition: 'color 0.2s',
                '&:hover': { color: '#c2410c' }
              }}
            >
              Términos
            </MuiLink>
            <MuiLink 
              href="#" 
              underline="none"
              sx={{ 
                fontSize: '0.75rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.1em', 
                color: 'rgba(255,255,255,0.35)',
                transition: 'color 0.2s',
                '&:hover': { color: '#c2410c' }
              }}
            >
              Privacidad
            </MuiLink>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}