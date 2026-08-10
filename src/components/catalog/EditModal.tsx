"use client";

import { X } from "lucide-react";
import { VehicleForm } from "../dashboard/VehicleForm";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehiculo: any;
  categorias: { id: string; nombre: string }[];
  cotizacionDolar?: number | null;
}

export const EditModal = ({ isOpen, onClose, vehiculo, categorias, cotizacionDolar }: EditModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose} 
      />
      <div className="relative bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 z-10 p-2 bg-black/5 text-[hsl(var(--muted-foreground))] hover:bg-[#b5000b] hover:text-white rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex-1 overflow-y-auto p-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-black/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-black/20">
          <VehicleForm initialData={vehiculo} categorias={categorias} onSuccess={onClose} cotizacionDolar={cotizacionDolar} />
        </div>
      </div>
    </div>
  );
};
