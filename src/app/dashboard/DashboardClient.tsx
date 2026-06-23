"use client";

import Link from "next/link";
import { Car, CheckCircle2, FileText, MessageSquare, Plus, LayoutList, ArrowRight, ExternalLink } from "lucide-react";
import { ConsultaStatusButton } from "@/components/dashboard/ConsultaStatusButton";
import { Box, Container, Grid, Typography, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Link as MuiLink } from "@mui/material";

export const DashboardClient = ({
  userName,
  totalVehiculos,
  publicados,
  borradores,
  consultasPendientes,
  ultimasConsultas
}: any) => {

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("es-AR", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
    }).format(new Date(date));

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 16, pb: 8 }}>
      <Container maxWidth="xl">

        {/* ── Header ── */}
        <Box sx={{ mb: 6 }}>
          <Typography sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em', color: 'primary.main', mb: 1 }}>
            Panel de Control
          </Typography>
          <Typography variant="h1" sx={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.02em', mb: 0.5 }}>
            Bienvenido, {userName}
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Resumen de actividad de JBJ Automotores
          </Typography>
        </Box>

        {/* ── Metric Cards ── */}
        <Grid container spacing={2} sx={{ mb: 6 }}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} >
            <MetricCard label="Total Vehículos" value={totalVehiculos} icon={<Car size={20} />} href="/dashboard/vehicles" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} >
            <MetricCard label="Publicados" value={publicados} icon={<CheckCircle2 size={20} />} href="/dashboard/vehicles" accent="green" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} >
            <MetricCard label="Borradores" value={borradores} icon={<FileText size={20} />} href="/dashboard/vehicles" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} >
            <MetricCard label="Consultas Pendientes" value={consultasPendientes} icon={<MessageSquare size={20} />} href="/dashboard/consultas" accent={consultasPendientes > 0 ? "primary" : undefined} />
          </Grid>
        </Grid>

        {/* ── Quick Actions ── */}
        <Grid container spacing={2} sx={{ mb: 6 }}>
          <Grid size={{ xs: 12, md: 4 }} >
            <QuickAction href="/dashboard/vehicles/new" icon={<Plus size={18} />} label="Agregar Vehículo" description="Dar de alta una nueva unidad" primary />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} >
            <QuickAction href="/dashboard/vehicles" icon={<LayoutList size={18} />} label="Ver Inventario" description="Gestionar y editar el stock" />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} >
            <QuickAction href="/dashboard/consultas" icon={<MessageSquare size={18} />} label="Ver Consultas" description={consultasPendientes > 0 ? `${consultasPendientes} sin atender` : "Historial completo"} badge={consultasPendientes > 0 ? consultasPendientes : undefined} />
          </Grid>
        </Grid>

        {/* ── Últimas Consultas Pendientes ── */}
        {ultimasConsultas.length > 0 && (
          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
              <Typography variant="h2" sx={{ fontSize: '1.125rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                Consultas Pendientes
              </Typography>
              <MuiLink component={Link} href="/dashboard/consultas" sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'primary.main', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 0.5, '&:hover': { textDecoration: 'underline' } }}>
                Ver todas <ArrowRight size={11} />
              </MuiLink>
            </Stack>

            <TableContainer component={Paper} sx={{ bgcolor: 'background.paper', borderRadius: 1, boxShadow: 'none', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Table>
                <TableHead sx={{ bgcolor: '#0a0a0a' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Cliente</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', borderBottom: '1px solid rgba(255,255,255,0.05)', display: { xs: 'none', md: 'table-cell' } }}>Vehículo</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', borderBottom: '1px solid rgba(255,255,255,0.05)', display: { xs: 'none', lg: 'table-cell' } }}>Fecha</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Acción</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ultimasConsultas.map((c: any) => (
                    <TableRow key={c.id} sx={{ '&:last-child td': { border: 0 }, '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                      <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <Typography sx={{ fontWeight: 900, fontSize: '0.875rem' }}>{c.nombre}</Typography>
                        <MuiLink href={`mailto:${c.email}`} sx={{ fontSize: '0.75rem', color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>{c.email}</MuiLink>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', display: { xs: 'none', md: 'table-cell' } }}>
                        {c.vehiculo ? (
                          <MuiLink component={Link} href={`/catalogo/${c.vehiculo.id}`} target="_blank" sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'text.primary', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 0.5, '&:hover': { color: 'primary.main' } }}>
                            {c.vehiculo.marca} {c.vehiculo.modelo}
                            <ExternalLink size={11} style={{ opacity: 0.4 }} />
                          </MuiLink>
                        ) : (
                          <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', fontStyle: 'italic' }}>General</Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', display: { xs: 'none', lg: 'table-cell' } }}>
                        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 500 }}>{formatDate(c.createdAt)}</Typography>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <ConsultaStatusButton consultaId={c.id} estadoActual={c.estado} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {ultimasConsultas.length === 0 && (
          <Box sx={{ py: 8, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CheckCircle2 size={32} color="rgba(34,197,94,0.4)" />
            <Typography sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.875rem' }}>
              No hay consultas pendientes. ¡Todo al día!
            </Typography>
          </Box>
        )}

      </Container>
    </Box>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const MetricCard = ({ label, value, icon, href, accent }: any) => {
  const iconColor = accent === "primary" ? "primary.main" : accent === "green" ? "#16a34a" : "text.secondary";
  const textColor = accent === "primary" ? "primary.main" : accent === "green" ? "#16a34a" : "text.primary";
  
  return (
    <Box component={Link} href={href} sx={{ display: 'block', textDecoration: 'none', bgcolor: 'background.paper', p: 3, borderRadius: 1, transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' } }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2, color: iconColor }}>
        {icon}
        <ArrowRight size={14} style={{ opacity: 0.5 }} />
      </Stack>
      <Typography sx={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.02em', color: textColor, lineHeight: 1, mb: 1 }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>
        {label}
      </Typography>
    </Box>
  );
};

const QuickAction = ({ href, icon, label, description, primary, badge }: any) => (
  <Box component={Link} href={href} sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 2, p: 2.5, textDecoration: 'none', borderRadius: 1, transition: 'all 0.2s', bgcolor: primary ? '#c2410c' : 'background.paper', '&:hover': { bgcolor: primary ? '#9a3412' : 'rgba(255,255,255,0.05)' } }}>
    <Box sx={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRadius: 1, bgcolor: primary ? 'rgba(255,255,255,0.1)' : '#0a0a0a', color: primary ? 'white' : 'text.secondary' }}>
      {icon}
    </Box>
    <Box>
      <Typography sx={{ fontSize: '0.875rem', fontWeight: 900, color: primary ? 'white' : 'text.primary' }}>{label}</Typography>
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: primary ? 'rgba(255,255,255,0.6)' : 'text.secondary' }}>{description}</Typography>
    </Box>
    {badge && (
      <Box sx={{ position: 'absolute', top: 12, right: 12, width: 20, height: 20, bgcolor: 'primary.main', color: 'white', fontSize: '9px', fontWeight: 900, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {badge}
      </Box>
    )}
  </Box>
);
