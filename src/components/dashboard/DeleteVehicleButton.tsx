"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { deleteVehicle } from "@/actions/vehicle";
import { Dialog, DialogContent, DialogActions, IconButton, Button, Typography, Box, Stack } from "@mui/material";

interface DeleteVehicleButtonProps {
  vehicleId: string;
  vehicleName: string;
}

export const DeleteVehicleButton = ({ vehicleId, vehicleName }: DeleteVehicleButtonProps) => {
  const [isOpen, setIsOpen]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [isPending, start]    = useTransition();
  const router                = useRouter();

  const handleDelete = () => {
    setError(null);
    start(async () => {
      const result = await deleteVehicle(vehicleId);
      if (result.error) {
        setError(result.error);
      } else {
        setIsOpen(false);
        router.refresh();
      }
    });
  };

  return (
    <>
      {/* Trigger */}
      <IconButton
        onClick={() => { setError(null); setIsOpen(true); }}
        title="Eliminar vehículo"
        size="small"
        sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: 'error.main' } }}
      >
        <Trash2 size={16} />
      </IconButton>

      {/* Confirmation Modal */}
      <Dialog 
        open={isOpen} 
        onClose={() => !isPending && setIsOpen(false)} 
        maxWidth="xs" 
        fullWidth
        PaperProps={{ sx: { bgcolor: 'background.paper', p: 3, backgroundImage: 'none' } }}
        slotProps={{ backdrop: { sx: { bgcolor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' } } }}
      >
        {/* Close */}
        <IconButton
          onClick={() => setIsOpen(false)}
          disabled={isPending}
          sx={{ position: 'absolute', top: 8, right: 8, color: 'text.secondary' }}
        >
          <X size={20} />
        </IconButton>

        <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
          {/* Icon */}
          <Box sx={{ width: 48, height: 48, bgcolor: 'rgba(194,65,12,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3, borderRadius: 1 }}>
            <AlertTriangle size={24} color="#c2410c" />
          </Box>

          {/* Text */}
          <Typography variant="h6" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', mb: 1 }}>
            Confirmar eliminación
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 1 }}>
            Estás por eliminar permanentemente:
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 900, bgcolor: '#0a0a0a', px: 2, py: 1.5, borderRadius: 1, mb: 3 }}>
            {vehicleName}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 3 }}>
            Esta acción no se puede deshacer. Se eliminarán también todas las imágenes asociadas.
          </Typography>

          {error && (
            <Typography sx={{ bgcolor: 'rgba(194,65,12,0.1)', color: 'primary.main', p: 1.5, fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 3 }}>
              {error}
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 0 }}>
          <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
            <Button
              onClick={() => setIsOpen(false)}
              disabled={isPending}
              variant="contained"
              sx={{ flex: 1, bgcolor: '#0a0a0a', color: 'text.secondary', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isPending}
              variant="contained"
              sx={{ flex: 1, bgcolor: 'primary.main', color: 'white', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', '&:hover': { bgcolor: 'error.dark' } }}
              startIcon={isPending ? undefined : <Trash2 size={14} />}
            >
              {isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </>
  );
};
