"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { deleteVehicle } from "@/actions/vehicle";

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
      <button
        onClick={() => { setError(null); setIsOpen(true); }}
        className="text-foreground/30 hover:text-primary transition-colors text-sm font-bold flex items-center gap-1"
        title="Eliminar vehículo"
      >
        <Trash2 size={14} />
      </button>

      {/* Confirmation Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => !isPending && setIsOpen(false)}
        >
          <div
            className="bg-surface-lowest w-full max-w-md shadow-2xl relative p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setIsOpen(false)}
              disabled={isPending}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-foreground/40 hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>

            {/* Icon */}
            <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mb-6">
              <AlertTriangle size={24} className="text-primary" />
            </div>

            {/* Text */}
            <h3 className="text-xl font-black text-foreground tracking-tight font-space uppercase mb-2">
              Confirmar eliminación
            </h3>
            <p className="text-sm text-foreground/60 font-medium mb-1">
              Estás por eliminar permanentemente:
            </p>
            <p className="text-sm font-black text-foreground mb-6 bg-surface-low px-3 py-2 rounded-sm">
              {vehicleName}
            </p>
            <p className="text-xs text-foreground/40 mb-8">
              Esta acción no se puede deshacer. Se eliminarán también todas las imágenes asociadas.
            </p>

            {error && (
              <div className="bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest p-3 mb-4">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="flex-1 py-3 bg-surface-low text-foreground/60 text-[11px] font-black uppercase tracking-widest hover:bg-foreground/10 transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 py-3 bg-primary text-white text-[11px] font-black uppercase tracking-widest hover:bg-foreground transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 size={13} />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
