"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Vehiculo, ImagenVehiculo } from "../../../generated/prisma";
import { Calendar, Fuel, AlignJustify, ArrowRight, Settings2 } from "lucide-react";
import { EditModal } from "./EditModal";
import { getCldUrl } from "@/lib/cloudinary";
import { formatPrecio } from "@/lib/precio";

interface VehicleCardProps {
  vehiculo: Omit<Vehiculo, "precio"> & {
    imagenes: ImagenVehiculo[];
    precio: number;
  };
  isAdmin?: boolean;
  categorias?: { id: string; nombre: string }[];
  priority?: boolean;
  cotizacionDolar?: number | null;
}

export const VehicleCard = ({ vehiculo, isAdmin = false, categorias = [], priority = false, cotizacionDolar }: VehicleCardProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const imagenPrincipal = vehiculo.imagenes.find(img => img.esPrincipal)?.url || vehiculo.imagenes[0]?.url || "";

  return (
    <div className="group relative flex flex-col h-full bg-[hsl(var(--card))] shadow-[0_4px_20px_rgba(26,28,30,0.06)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(26,28,30,0.12)]">
      {/* Top Image Section */}
      <div className="relative aspect-[4/3] w-full bg-[hsl(var(--surface-low))] overflow-hidden">
        {imagenPrincipal ? (
          <Image
            src={getCldUrl(imagenPrincipal, { modo: "recorte", relacion: "4:3" })}
            alt={`${vehiculo.marca} ${vehiculo.modelo}`}
            fill
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-700 ease-in-out group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-black/5 font-black text-4xl italic">JBJ</span>
          </div>
        )}

        {/* Edit Overlay Button */}
        {isAdmin && (
          <button
            onClick={(e) => { e.preventDefault(); setIsEditModalOpen(true); }}
            className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-[0.1em] px-3 py-1.5 flex items-center gap-1 hover:bg-[hsl(var(--primary))] transition-colors"
          >
            <Settings2 size={11} />
            Editar
          </button>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-col p-5 flex-grow">
        {/* Badges row */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[hsl(var(--primary))]">
            Nuevo Ingreso
          </span>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))] px-2 py-0.5 bg-[hsl(var(--surface-low))]">
            {vehiculo.estado}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-[-0.05em] leading-none mb-1.5">
          {vehiculo.marca} {vehiculo.modelo}
        </h3>

        {/* Subtitle / Engine */}
        <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium mb-5">
          {vehiculo.version || vehiculo.motor || "Versión Base"}
        </p>

        {/* Inline Specs */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6 text-[hsl(var(--muted-foreground))]">
          <div className="flex items-center gap-1">
            <Calendar size={14} className="opacity-40" />
            <span className="text-[11px] font-bold">{vehiculo.anio}</span>
          </div>
          <div className="flex items-center gap-1">
            <Fuel size={14} className="opacity-40" />
            <span className="text-[11px] font-bold capitalize">{vehiculo.combustible?.toLowerCase()}</span>
          </div>
          <div className="flex items-center gap-1">
            <AlignJustify size={14} className="opacity-40" />
            <span className="text-[11px] font-bold capitalize">{vehiculo.transmision?.toLowerCase()}</span>
          </div>
        </div>

        {/* Price and CTA */}
        <div className="mt-auto pt-4 border-t border-[hsl(var(--border))]">
          <span className="block text-2xl font-black text-[hsl(var(--primary))] tracking-[-0.05em] leading-none tabular-nums">
            {formatPrecio(vehiculo.precio, vehiculo.moneda, cotizacionDolar)}
          </span>
          <Link
            href={`/catalogo/${vehiculo.id}`}
            className="mt-4 w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-3 text-[11px] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-1.5 hover:brightness-90 active:scale-95 transition-all shadow-[0_4px_6px_-1px_hsl(var(--primary)/0.2)]"
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
        cotizacionDolar={cotizacionDolar}
      />
    </div>
  );
};
