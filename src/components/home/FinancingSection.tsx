"use client";

import { Building2 } from "lucide-react";
import { Box, Container, Typography, Button, Stack } from "@mui/material";

export function FinancingSection() {
  return (
    <Box component="section" id="financiacion" sx={{ py: 12, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Box 
          sx={{ 
            position: 'relative', 
            bgcolor: '#c2410c', // racing color
            borderRadius: 2, 
            overflow: 'hidden', 
            p: { xs: 6, md: 12 }, 
            boxShadow: '0 25px 50px -12px rgba(194,65,12,0.25)',
            '&:hover .bg-icon': {
              transform: 'translate(25%, 25%) scale(1.05)'
            }
          }}
        >
          {/* Decorative Background Icon */}
          <Box 
            className="bg-icon"
            sx={{ 
              position: 'absolute', 
              right: 0, 
              bottom: 0, 
              opacity: 0.1, 
              transform: 'translate(25%, 25%)', 
              transition: 'transform 1s ease'
            }}
          >
            <Building2 size={600} strokeWidth={0.5} color="white" />
          </Box>

          <Box sx={{ position: 'relative', zIndex: 10, maxWidth: '42rem' }}>
            <Typography 
              variant="overline" 
              sx={{ 
                fontSize: '10px', 
                fontWeight: 900, 
                textTransform: 'uppercase', 
                letterSpacing: '0.5em', 
                color: 'rgba(255,255,255,0.6)', 
                mb: 4, 
                display: 'block' 
              }}
            >
               Financial Services
            </Typography>
            <Typography 
              variant="h2" 
              sx={{ 
                fontSize: { xs: '3rem', md: '4.5rem' }, 
                fontWeight: 800, 
                color: 'white', 
                textTransform: 'uppercase', 
                letterSpacing: '-0.02em', 
                mb: 6, 
                fontStyle: 'italic',
                lineHeight: 1
              }}
            >
               Financiación <br /> de Autor.
            </Typography>
            <Typography 
              sx={{ 
                color: 'rgba(255,255,255,0.7)', 
                lineHeight: 1.6, 
                mb: 8, 
                fontSize: '1.125rem', 
                fontWeight: 500 
              }}
            >
               Planes personalizados con tasas preferenciales para nuestra selección más exclusiva. Transparencia técnica en cada cuota.
            </Typography>

            <Stack direction="row" gap={6} sx={{ mb: 8, flexWrap: 'wrap' }}>
              <Box>
                <Typography sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', mb: 1 }}>Tasa Anual</Typography>
                <Typography sx={{ fontSize: '2.25rem', fontWeight: 700, color: 'white', letterSpacing: '-0.05em' }}>29.0<Box component="span" sx={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>%</Box></Typography>
              </Box>
              <Box sx={{ width: '1px', height: 48, bgcolor: 'rgba(255,255,255,0.1)' }} />
              <Box>
                <Typography sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', mb: 1 }}>Entrega Mínima</Typography>
                <Typography sx={{ fontSize: '2.25rem', fontWeight: 700, color: 'white', letterSpacing: '-0.05em' }}>30.0<Box component="span" sx={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>%</Box></Typography>
              </Box>
            </Stack>

            <Button 
              variant="contained" 
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main', 
                px: 6, 
                py: 2.5, 
                fontSize: '10px', 
                fontWeight: 900, 
                textTransform: 'uppercase', 
                letterSpacing: '0.3em', 
                borderRadius: 1, 
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                '&:hover': {
                  bgcolor: 'text.primary',
                  color: 'white'
                },
                transition: 'all 0.3s'
              }}
            >
               Simular Crédito
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
