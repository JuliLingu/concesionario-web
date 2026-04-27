"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Vehiculo, ImagenVehiculo } from "../../../generated/prisma";
import { Calendar, Fuel, AlignJustify, ArrowRight, Settings2 } from "lucide-react";
import { EditModal } from "./EditModal";
import { getCldUrl } from "@/lib/cloudinary";

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
            src={getCldUrl(imagenPrincipal, "4:3")}
            alt={`${vehiculo.marca} ${vehiculo.modelo}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
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
            className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 hover:bg-primary transition-all"
          >
            <Settings2 size={11} />
            Editar
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
            className="bg-racing text-white flex items-center gap-2 px-5 py-3 hover:opacity-90 active:scale-95 transition-all text-[11px] font-black uppercase tracking-widest shadow-md shadow-primary/20"
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

