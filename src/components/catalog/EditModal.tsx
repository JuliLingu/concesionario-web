"use client";

import { X } from "lucide-react";
import { VehicleForm } from "../dashboard/VehicleForm";
import { Dialog, DialogContent, IconButton } from "@mui/material";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehiculo: any;
  categorias: { id: string; nombre: string }[];
}

export const EditModal = ({ isOpen, onClose, vehiculo, categorias }: EditModalProps) => {
  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          borderRadius: 1,
          position: 'relative',
          maxHeight: '90vh'
        }
      }}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)'
          }
        }
      }}
    >
      {/* Close Button */}
      <IconButton 
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          zIndex: 10,
          bgcolor: 'rgba(255,255,255,0.05)',
          color: 'text.secondary',
          '&:hover': {
            bgcolor: 'primary.main',
            color: 'white'
          }
        }}
      >
        <X size={20} />
      </IconButton>

      <DialogContent sx={{ p: 0, '&::-webkit-scrollbar': { width: '8px' }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
        <VehicleForm initialData={vehiculo} categorias={categorias} onSuccess={onClose} />
      </DialogContent>
    </Dialog>
  );
};
