"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Settings2 } from "lucide-react";
import type { VehiculoDeTarjeta } from "./VehicleCard";

/**
 * El modal de edición monta el formulario completo del panel (react-hook-form,
 * el resolver de zod y el subidor a Cloudinary). Se carga recién al abrirlo:
 * el administrador que solo está mirando el catálogo no lo descarga.
 */
const EditModal = dynamic(() => import("./EditModal").then((m) => m.EditModal));

interface VehicleCardAdminOverlayProps {
  vehiculo: VehiculoDeTarjeta;
  categorias: { id: string; nombre: string }[];
  cotizacionDolar?: number | null;
  /** Precios a la vista, según Configuración. Llega hasta el formulario de edición. */
  mostrarPrecios?: boolean;
}

export const VehicleCardAdminOverlay = ({
  vehiculo,
  categorias,
  cotizacionDolar,
  mostrarPrecios,
}: VehicleCardAdminOverlayProps) => {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          setAbierto(true);
        }}
        className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-[0.1em] px-3 py-1.5 flex items-center gap-1 hover:bg-[hsl(var(--primary))] transition-colors"
      >
        <Settings2 size={11} />
        Editar
      </button>

      {abierto && (
        <EditModal
          isOpen
          onClose={() => setAbierto(false)}
          vehiculo={vehiculo}
          categorias={categorias}
          cotizacionDolar={cotizacionDolar}
          mostrarPrecios={mostrarPrecios}
        />
      )}
    </>
  );
};
