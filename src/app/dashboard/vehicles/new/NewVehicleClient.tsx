"use client";

import { VehicleForm } from "@/components/dashboard/VehicleForm";
import { Box, Container, Typography } from "@mui/material";

export const NewVehicleClient = ({ categorias }: any) => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 16, pb: 8 }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 5 }}>
          <Typography sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em', color: 'primary.main', mb: 1 }}>
            Panel de Control
          </Typography>
          <Typography variant="h1" sx={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.02em', mb: 0.5 }}>
            Nuevo Vehículo
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Completá la información técnica para dar de alta el auto en el catálogo.
          </Typography>
        </Box>
        <VehicleForm categorias={categorias} />
      </Container>
    </Box>
  );
};
