"use client";

import Link from "next/link";
import { VehicleCard } from "../catalog/VehicleCard";
import { ArrowRight } from "lucide-react";
import { Box, Container, Typography, Stack, Grid } from "@mui/material";

export function RecentVehiclesUI({ vehicles }: { vehicles: any[] }) {
  return (
    <Box component="section" sx={{ bgcolor: 'background.paper', py: 16 }}>
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={4}
          sx={{
            mb: 12,
            alignItems: { xs: 'flex-start', md: 'flex-end' },
            justifyContent: "space-between"
          }}
        >
          <Box sx={{ maxWidth: '36rem' }}>
            <Typography
              variant="overline"
              sx={{
                fontSize: '10px',
                fontWeight: 900,
                letterSpacing: '0.5em',
                color: 'primary.main',
                mb: 3,
                display: 'block',
                textTransform: 'uppercase'
              }}
            >
              The Selection / 2024
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '3rem', md: '3.75rem' },
                fontWeight: 800,
                color: 'text.primary',
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
                lineHeight: 1
              }}
            >
              Curaduría <br /> de Excelencia.
            </Typography>
          </Box>
          <Box
            component={Link}
            href="/catalogo"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              fontSize: '10px',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.3em',
              color: 'text.primary',
              textDecoration: 'none',
              pb: 1,
              borderBottom: '2px solid rgba(194,65,12,0.2)',
              transition: 'all 0.3s',
              '&:hover': {
                color: 'primary.main',
                borderColor: 'primary.main',
                '& .icon': {
                  transform: 'translateX(8px)'
                }
              }
            }}
          >
            Ver Catálogo Completo
            <Box component="span" className="icon" sx={{ transition: 'transform 0.3s', display: 'flex' }}>
              <ArrowRight size={14} />
            </Box>
          </Box>
        </Stack>

        <Grid container spacing={0}>
          {vehicles.map((vehicle) => (
            <Grid size={{ xs: 12, md: 4 }} key={vehicle.id}>
              <VehicleCard vehiculo={vehicle} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
