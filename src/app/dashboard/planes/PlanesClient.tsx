"use client";

import { useState, useTransition } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { deletePlan } from "@/actions/financiacion";
import { Box, Button, Container, Dialog, DialogContent, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Chip } from "@mui/material";
import { PlanForm } from "./PlanForm";
import { X } from "lucide-react";

export const PlanesClient = ({ planes }: { planes: any[] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [isPending, start] = useTransition();

  const handleOpenNew = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: any) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este plan?")) {
      start(async () => {
        await deletePlan(id);
      });
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 16, pb: 8 }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em', color: 'primary.main', mb: 1 }}>
              Panel de Control
            </Typography>
            <Typography variant="h1" sx={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
              Planes de Financiación
            </Typography>
          </Box>
          <Button
            onClick={handleOpenNew}
            variant="contained"
            startIcon={<Plus size={16} />}
            sx={{
              bgcolor: 'primary.main', color: 'white', fontWeight: 900,
              textTransform: 'uppercase', letterSpacing: '0.1em', px: 3, py: 1.5,
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            Nuevo Plan
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{ bgcolor: 'background.paper', borderRadius: 1, boxShadow: 'none', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#0a0a0a' }}>
              <TableRow>
                <TableCell sx={{ color: 'text.secondary', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Nombre</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Cuotas</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Tasa Anual (TNA)</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Estado</TableCell>
                <TableCell align="right" sx={{ color: 'text.secondary', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {planes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No hay planes configurados
                  </TableCell>
                </TableRow>
              ) : (
                planes.map((p) => (
                  <TableRow key={p.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                    <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>{p.nombre}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{p.cuotas}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{p.tasaAnual}%</TableCell>
                    <TableCell>
                      <Chip 
                        label={p.activo ? "Activo" : "Inactivo"} 
                        color={p.activo ? "success" : "default"} 
                        size="small" 
                        sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton onClick={() => handleOpenEdit(p)} sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }} disabled={isPending}>
                          <Edit2 size={16} />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(p.id)} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }} disabled={isPending}>
                          <Trash2 size={16} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: 'background.paper', borderRadius: 1 } }}>
          <IconButton 
            onClick={() => setIsModalOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8, zIndex: 10, color: 'text.secondary' }}
          >
            <X size={20} />
          </IconButton>
          <DialogContent sx={{ p: 0 }}>
            <PlanForm initialData={editingPlan} onSuccess={() => setIsModalOpen(false)} />
          </DialogContent>
        </Dialog>

      </Container>
    </Box>
  );
};
