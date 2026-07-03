"use client";

import { useState, useTransition } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert
} from "@mui/material";
import { Tags, Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createCategoria, deleteCategoria } from "@/actions/categorias";

export const CategoriasClient = ({ initialCategorias }: any) => {
  const [categorias, setCategorias] = useState(initialCategorias);
  const [isPending, startTransition] = useTransition();
  const [openModal, setOpenModal] = useState(false);
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCreate = () => {
    setError(null);
    startTransition(async () => {
      const result = await createCategoria({ nombre });
      if (result?.error) {
        setError(result.error);
      } else {
        setOpenModal(false);
        setNombre("");
        window.location.reload();
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta categoría?")) return;

    startTransition(async () => {
      const result = await deleteCategoria(id);
      if (result?.error) {
        alert(result.error);
      } else {
        window.location.reload();
      }
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 16, pb: 8 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button component={Link} href="/dashboard" startIcon={<ArrowLeft size={16} />} sx={{ mb: 2, color: 'text.secondary' }}>
            Volver al Panel
          </Button>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em', color: 'primary.main', mb: 1 }}>
                Administración
              </Typography>
              <Typography variant="h1" sx={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Tags size={32} /> Categorías
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Plus size={20} />}
              onClick={() => setOpenModal(true)}
              sx={{ bgcolor: '#c2410c', '&:hover': { bgcolor: '#9a3412' } }}
            >
              Nueva Categoría
            </Button>
          </Stack>
        </Box>

        {/* Tabla */}
        <TableContainer component={Paper} sx={{ bgcolor: 'background.paper', borderRadius: 1, boxShadow: 'none', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#0a0a0a' }}>
              <TableRow>
                <TableCell sx={{ color: 'text.secondary', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Nombre</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Slug</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Vehículos</TableCell>
                <TableCell align="right" sx={{ color: 'text.secondary', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categorias.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No hay categorías creadas.
                  </TableCell>
                </TableRow>
              ) : categorias.map((cat: any) => (
                <TableRow key={cat.id} sx={{ '&:last-child td': { border: 0 }, '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                  <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 600 }}>{cat.nombre}</TableCell>
                  <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'text.secondary' }}>{cat.slug}</TableCell>
                  <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{cat._count.vehiculos}</TableCell>
                  <TableCell align="right" sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <IconButton
                      onClick={() => handleDelete(cat.id)}
                      disabled={isPending || cat._count.vehiculos > 0}
                      color="error"
                      title={cat._count.vehiculos > 0 ? "No se puede eliminar porque tiene vehículos" : "Eliminar"}
                    >
                      <Trash2 size={18} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Modal Crear */}
        <Dialog open={openModal} onClose={() => !isPending && setOpenModal(false)} slotProps={{ paper: { sx: { bgcolor: 'background.paper', backgroundImage: 'none' } } }}>
          <DialogTitle sx={{ fontWeight: 800 }}>Crear Nueva Categoría</DialogTitle>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField
              autoFocus
              margin="dense"
              label="Nombre de la categoría"
              fullWidth
              variant="outlined"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={isPending}
              placeholder="Ej: Camionetas, SUV, Motos..."
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setOpenModal(false)} disabled={isPending} sx={{ color: 'text.secondary' }}>Cancelar</Button>
            <Button
              onClick={handleCreate}
              disabled={isPending || !nombre.trim()}
              variant="contained"
              sx={{ bgcolor: '#c2410c', '&:hover': { bgcolor: '#9a3412' } }}
            >
              {isPending ? <CircularProgress size={24} color="inherit" /> : "Crear Categoría"}
            </Button>
          </DialogActions>
        </Dialog>

      </Container>
    </Box>
  );
};
