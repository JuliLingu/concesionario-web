"use client";

import Image from "next/image";
import { Box, Typography, Button, Container } from "@mui/material";
import Link from "next/link";

export function Hero() {
  return (
    <Box sx={{ position: 'relative', height: '100vh', width: '100%', overflow: 'hidden' }}>
      <Image
        src="/banner.png"
        alt="Concesionario Banner"
        fill
        style={{ objectFit: 'cover', opacity: 0.6 }}
        priority
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(10,10,10,1) 0%, rgba(10,10,10,0) 100%)',
        }}
      />
      <Container 
        maxWidth="lg" 
        sx={{ 
          position: 'relative', 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          textAlign: 'center',
          zIndex: 10 
        }}
      >
        <Typography 
          variant="h1" 
          sx={{ 
            fontSize: { xs: '3rem', md: '5rem', lg: '7rem' }, 
            fontWeight: 900, 
            textTransform: 'uppercase', 
            letterSpacing: '-0.02em', 
            mb: 2,
            color: '#ffffff'
          }}
        >
          KINETIC
        </Typography>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 300, 
            mb: 6,
            color: '#d1d5db',
            fontStyle: 'italic'
          }}
        >
          Ingeniería en Movimiento.
        </Typography>
        <Button 
          component={Link} 
          href="/catalogo" 
          variant="contained" 
          sx={{
            background: "linear-gradient(135deg, #c2410c 0%, #ea580c 100%)",
            color: "#ffffff",
            px: 6,
            py: 2,
            fontSize: '1rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            borderRadius: 0,
            '&:hover': {
              background: "linear-gradient(135deg, #9a3412 0%, #c2410c 100%)",
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease'
          }}
        >
          Ver Catálogo
        </Button>
      </Container>
    </Box>
  );
}