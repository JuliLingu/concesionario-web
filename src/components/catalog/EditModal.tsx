"use client";

import { X } from "lucide-react";
import { VehicleForm } from "../dashboard/VehicleForm";
import { useEffect } from "react";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehiculo: any;
  categorias: { id: string; nombre: string }[];
}

export const EditModal = ({ isOpen, onClose, vehiculo, categorias }: EditModalProps) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div 
        className="bg-surface-lowest w-full max-w-5xl rounded-sm shadow-2xl relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 z-10 w-10 h-10 bg-surface-low hover:bg-primary hover:text-white flex items-center justify-center transition-colors shadow-sm"
        >
          <X size={20} />
        </button>

        <div className="max-h-[90vh] overflow-y-auto">
           <VehicleForm initialData={vehiculo} categorias={categorias} onSuccess={onClose} />
        </div>
      </div>
    </div>
  );
};
