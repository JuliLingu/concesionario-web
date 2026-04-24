"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Vehiculo, ImagenVehiculo } from "../../../generated/prisma";
import { Calendar, Fuel, AlignJustify, ArrowRight, Settings2 } from "lucide-react";
import { EditModal } from "./EditModal";

interface VehicleCardProps {
  vehiculo: Omit<Vehiculo, "precio"> & {
    imagenes: ImagenVehiculo[];
    precio: number;
  };
  isAdmin?: boolean;
  categorias?: { id: string; nombre: string }[];
}


export const VehicleCard = ({ vehiculo, isAdmin = false, categorias = [] }: VehicleCardProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const imagenPrincipal = vehiculo.imagenes.find(img => img.esPrincipal)?.url || vehiculo.imagenes[0]?.url || "";

  return (
    <div className="bg-surface-lowest transition-all hover:shadow-premium relative flex flex-col group">

      {/* Top Image Section */}
      <div className="relative aspect-[4/3] w-full bg-surface-low overflow-hidden">
        {imagenPrincipal ? (
          <Image
            src={imagenPrincipal}
            alt={`${vehiculo.marca} ${vehiculo.modelo}`}
            fill
            className="object-cover object-center transition-transform group-hover:scale-105 duration-700"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-foreground/5 font-black text-4xl italic">
            JBJ
          </div>
        )}

        {/* Edit Overlay Button */}
        {isAdmin && (
          <button
            onClick={(e) => { e.preventDefault(); setIsEditModalOpen(true); }}
            className="absolute top-4 right-4 z-10 bg-primary shadow-lg p-3 text-white rounded-full hover:scale-110 transition-transform hover:bg-black"
          >
            <Settings2 size={16} />
          </button>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-col p-6 flex-grow">

        {/* Badges row */}
        <div className="flex items-center justify-between mb-4">
          {/* Primary left badge depending on logic, hardcoding for visual initially or map properly */}
          <span className="text-[9px] font-black uppercase tracking-widest text-primary">
            Nuevo Ingreso
          </span>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/60 px-2 py-1 bg-surface-low">
            {vehiculo.estado}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-foreground tracking-tighter leading-none mb-1 font-space">
          {vehiculo.marca} {vehiculo.modelo}
        </h3>

        {/* Subtitle / Engine */}
        <p className="text-[12px] text-foreground/60 mb-6 font-medium">
          {vehiculo.version || vehiculo.motor || "Versión Base"}
        </p>

        {/* Inline Specs */}
        <div className="flex items-center gap-4 mb-8 text-[11px] font-bold text-foreground/60">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-foreground/40" />
            {vehiculo.anio}
          </div>
          <div className="flex items-center gap-1.5">
            <Fuel size={14} className="text-foreground/40" />
            <span className="capitalize">{vehiculo.combustible?.toLowerCase()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlignJustify size={14} className="text-foreground/40" />
            <span className="capitalize">{vehiculo.transmision?.toLowerCase()}</span>
          </div>
        </div>

        {/* Price and CTA */}
        <div className="mt-auto flex items-center justify-between">
          <div>
            <p className="text-2xl font-black text-primary tracking-tighter">
              U$D {vehiculo.precio.toLocaleString("es-AR")}
            </p>
          </div>
          <Link
            href={`/catalogo/${vehiculo.id}`}
            className="bg-foreground text-white flex items-center gap-2 px-5 py-3 hover:bg-primary transition-all text-[11px] font-black uppercase tracking-widest"
          >
            Ver Detalles <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        vehiculo={vehiculo}
        categorias={categorias}
      />
    </div>
  );
};

