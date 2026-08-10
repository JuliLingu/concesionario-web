"use client";

import { useState, useTransition } from "react";
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

  const handleDelete = () => {
    setError(null);
    start(async () => {
      const result = await deleteVehicle(vehicleId);
      if (result.error) {
        setError(result.error);
      } else {
        setIsOpen(false);
      }
    });
  };

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => { setError(null); setIsOpen(true); }}
        title="Eliminar vehículo"
        className="p-1 rounded text-[hsl(var(--muted-foreground))] hover:text-red-600 transition-colors"
      >
        <Trash2 size={16} />
      </button>

      {/* Confirmation Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isPending && setIsOpen(false)}
          />
          <div className="relative bg-white rounded shadow-[0_20px_40px_rgba(26,28,30,0.12)] max-w-xs w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
            {/* Close */}
            <button
              onClick={() => setIsOpen(false)}
              disabled={isPending}
              className="absolute top-2 right-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] disabled:opacity-50 p-1"
            >
              <X size={20} />
            </button>

            {/* Icon */}
            <div className="w-12 h-12 bg-orange-100 flex items-center justify-center mb-5 rounded">
              <AlertTriangle size={24} color="#c2410c" />
            </div>

            <h6 className="text-base font-black uppercase tracking-tight mb-2 text-[hsl(var(--foreground))]">
              Confirmar eliminación
            </h6>
            <p className="text-sm text-[hsl(var(--muted-foreground))] font-medium mb-2">
              Estás por eliminar permanentemente:
            </p>
            <p className="text-sm font-black bg-[hsl(var(--surface-low))] text-[hsl(var(--foreground))] px-3 py-2 rounded mb-4">
              {vehicleName}
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-5">
              Esta acción no se puede deshacer. Se eliminarán también todas las imágenes asociadas.
            </p>

            {error && (
              <p className="bg-orange-100 text-orange-700 p-3 text-[10px] font-black uppercase tracking-[0.1em] mb-4 rounded">
                {error}
              </p>
            )}

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="flex-1 bg-[hsl(var(--surface-low))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] text-[10px] font-black uppercase tracking-[0.1em] transition py-2 px-4 rounded disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 bg-racing text-white text-[10px] font-black uppercase tracking-[0.1em] hover:opacity-90 transition py-2 px-4 rounded flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {!isPending && <Trash2 size={14} />}
                {isPending ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
