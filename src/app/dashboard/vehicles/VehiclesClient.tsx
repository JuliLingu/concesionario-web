"use client";

import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { DeleteVehicleButton } from "@/components/dashboard/DeleteVehicleButton";
import { Box, Button, Container, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Link as MuiLink } from "@mui/material";

export const VehiclesClient = ({ vehicles, publicados, borradores }: any) => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 16, pb: 8 }}>
      <Container maxWidth="xl">
        
        {/* Header */}
        <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'flex-end' }} justifyContent="space-between" spacing={3} sx={{ mb: 6 }}>
          <Box>
            <Typography sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em', color: 'primary.main', mb: 1 }}>
              Panel de Control
            </Typography>
            <Typography variant="h1" sx={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.02em', mb: 0.5 }}>
              Inventario
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {vehicles.length} unidades totales · {publicados} publicadas · {borradores} en borrador
            </Typography>
          </Box>
          <Button
            component={Link}
            href="/dashboard/vehicles/new"
            variant="contained"
            startIcon={<Plus size={15} />}
            sx={{
              bgcolor: '#c2410c',
              color: 'white',
              px: 3,
              py: 1.5,
              fontSize: '11px',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              boxShadow: '0 20px 25px -5px rgba(194,65,12,0.25)',
              '&:hover': { bgcolor: '#9a3412', transform: 'scale(0.98)' }
            }}
          >
            Agregar Vehículo
          </Button>
        </Stack>

        {/* Table */}
        <TableContainer component={Paper} sx={{ bgcolor: 'background.paper', borderRadius: 1, boxShadow: 'none', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#0a0a0a' }}>
              <TableRow>
                <TableCell sx={{ color: 'text.secondary', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Vehículo</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', borderBottom: '1px solid rgba(255,255,255,0.05)', display: { xs: 'none', md: 'table-cell' } }}>Categoría</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Precio</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Visibilidad</TableCell>
                <TableCell align="right" sx={{ color: 'text.secondary', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vehicles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8, color: 'text.secondary', fontSize: '0.875rem', fontWeight: 500, fontStyle: 'italic', borderBottom: 0 }}>
                    No hay vehículos cargados aún.
                  </TableCell>
                </TableRow>
              )}
              {vehicles.map((v: any) => (
                <TableRow key={v.id} sx={{ '&:last-child td': { border: 0 }, '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                  <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Typography sx={{ fontWeight: 900, fontSize: '0.875rem', color: 'text.primary' }}>
                      {v.marca} {v.modelo}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 500, mt: 0.5 }}>
                      {v.anio} · {Number(v.kilometraje).toLocaleString("es-AR")} KM
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', display: { xs: 'none', md: 'table-cell' } }}>
                    <Typography sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary', bgcolor: '#0a0a0a', px: 1, py: 0.5, borderRadius: 1, display: 'inline-block' }}>
                      {v.categoria.nombre}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 900, color: 'text.primary' }}>
                      {v.moneda} ${Number(v.precio).toLocaleString("es-AR")}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Typography sx={{
                      fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'inline-block', px: 1, py: 0.5, borderRadius: 1,
                      ...(v.publicacion === "PUBLICADO" ? { bgcolor: 'rgba(34,197,94,0.1)', color: '#16a34a' } : v.publicacion === "VENDIDO" ? { bgcolor: 'rgba(255,255,255,0.1)', color: 'text.secondary' } : { bgcolor: 'rgba(194,65,12,0.1)', color: 'primary.main' })
                    }}>
                      {v.publicacion}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={2}>
                      <MuiLink component={Link} href={`/dashboard/vehicles/${v.id}`} sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' }, display: 'flex' }} title="Editar">
                        <Pencil size={16} />
                      </MuiLink>
                      <DeleteVehicleButton vehicleId={v.id} vehicleName={`${v.marca} ${v.modelo} ${v.anio}`} />
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

      </Container>
    </Box>
  );
};
