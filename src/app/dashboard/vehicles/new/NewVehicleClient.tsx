"use client";

import { VehicleForm } from "@/components/dashboard/VehicleForm";

export const NewVehicleClient = ({ categorias }: any) => {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <div className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[hsl(var(--primary))] mb-1">
            Panel de Control
          </p>
          <h1 className="text-4xl font-black uppercase tracking-tight text-[hsl(var(--foreground))] mb-1">
            Nuevo Vehículo
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] font-medium">
            Completá la información técnica para dar de alta el auto en el catálogo.
          </p>
        </div>
        <VehicleForm categorias={categorias} />
      </div>
    </div>
  );
};
