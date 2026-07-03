"use client";

import Link from "next/link";
import { MessageSquare, ExternalLink } from "lucide-react";
import { ConsultaStatusButton } from "@/components/dashboard/ConsultaStatusButton";
import { Box, Button, Container, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Link as MuiLink } from "@mui/material";

export const ConsultasClient = ({ consultas, pendientes, TABS, estadoValido }: any) => {

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("es-AR", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    }).format(new Date(date));

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 16, pb: 8 }}>
      <Container maxWidth="xl">
        
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Typography sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em', color: 'primary.main', mb: 1 }}>
            Panel de Control
          </Typography>
          <Typography variant="h1" sx={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.02em', mb: 0.5 }}>
            Consultas
          </Typography>
          <Stack direction="row"  spacing={1} sx={{alignItems:"center"}} >
            <Typography sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {consultas.length} consulta{consultas.length !== 1 ? "s" : ""}
            </Typography>
            {pendientes.length > 0 && (
              <Box sx={{ bgcolor: 'primary.main', color: 'white', fontSize: '9px', fontWeight: 900, px: 1, py: 0.5, borderRadius: 5 }}>
                {pendientes.length} pendiente{pendientes.length !== 1 ? "s" : ""}
              </Box>
            )}
          </Stack>
        </Box>

        {/* Tabs */}
        <Stack direction="row" spacing={1} sx={{ mb: 4, bgcolor: 'background.paper', p: 0.5, borderRadius: 1, display: 'inline-flex', border: '1px solid rgba(255,255,255,0.05)' }}>
          {TABS.map((tab: any) => {
            const isActive = tab.value === "TODAS" ? !estadoValido : estadoValido === tab.value;
            const href = tab.value === "TODAS" ? "/dashboard/consultas" : `/dashboard/consultas?estado=${tab.value}`;
            return (
              <Button
                key={tab.value}
                component={Link}
                href={href}
                variant={isActive ? "contained" : "text"}
                sx={{
                  fontSize: '10px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  px: 2,
                  py: 1,
                  minWidth: 0,
                  boxShadow: 'none',
                  ...(isActive ? { bgcolor: 'text.primary', color: 'background.default', '&:hover': { bgcolor: 'text.secondary', boxShadow: 'none' } } : { color: 'text.secondary', '&:hover': { color: 'text.primary', bgcolor: 'transparent' } })
                }}
              >
                {tab.label}
              </Button>
            );
          })}
        </Stack>

        {/* Table */}
        {consultas.length === 0 ? (
          <Box sx={{ py: 10, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <MessageSquare size={32} color="rgba(255,255,255,0.2)" />
            <Typography sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.875rem' }}>
              No hay consultas en esta categoría.
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ bgcolor: 'background.paper', borderRadius: 1, boxShadow: 'none', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#0a0a0a' }}>
                <TableRow>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Cliente</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', borderBottom: '1px solid rgba(255,255,255,0.05)', display: { xs: 'none', lg: 'table-cell' } }}>Vehículo</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', borderBottom: '1px solid rgba(255,255,255,0.05)', display: { xs: 'none', md: 'table-cell' } }}>Mensaje</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', borderBottom: '1px solid rgba(255,255,255,0.05)', display: { xs: 'none', md: 'table-cell' } }}>Fecha</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {consultas.map((c: any) => (
                  <TableRow key={c.id} sx={{ '&:last-child td': { border: 0 }, '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' }, verticalAlign: 'top' }}>
                    <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <Typography sx={{ fontWeight: 900, fontSize: '0.875rem', color: 'text.primary' }}>{c.nombre}</Typography>
                      <MuiLink href={`mailto:${c.email}`} sx={{ fontSize: '0.75rem', fontWeight: 500, color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' }, display: 'block', mt: 0.5 }}>{c.email}</MuiLink>
                      {c.telefono && (
                        <MuiLink href={`tel:${c.telefono}`} sx={{ fontSize: '0.75rem', fontWeight: 500, color: 'text.secondary', textDecoration: 'none', display: 'block', mt: 0.5 }}>{c.telefono}</MuiLink>
                      )}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', display: { xs: 'none', lg: 'table-cell' } }}>
                      {c.vehiculo ? (
                        <MuiLink component={Link} href={`/catalogo/${c.vehiculo.id}`} target="_blank" sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'text.primary', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 0.5, '&:hover': { color: 'primary.main' } }}>
                          {c.vehiculo.marca} {c.vehiculo.modelo} {c.vehiculo.anio}
                          <ExternalLink size={11} style={{ opacity: 0.4 }} />
                        </MuiLink>
                      ) : (
                        <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', fontStyle: 'italic' }}>General</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', display: { xs: 'none', md: 'table-cell' }, maxWidth: 260 }}>
                      <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', fontWeight: 500, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {c.mensaje || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>Sin mensaje</span>}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', display: { xs: 'none', md: 'table-cell' } }}>
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 500, whiteSpace: 'nowrap' }}>
                        {formatDate(c.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <ConsultaStatusButton consultaId={c.id} estadoActual={c.estado} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

      </Container>
    </Box>
  );
};
