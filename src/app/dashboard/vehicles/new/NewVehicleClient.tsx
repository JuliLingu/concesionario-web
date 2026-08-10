"use client";

import { VehicleForm } from "@/components/dashboard/VehicleForm";
import { ArrowLeft  } from "lucide-react";
import Link from "next/link";

export const NewVehicleClient = ({ categorias, cotizacionDolar }: any) => {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] pt-header pb-12">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 mb-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] text-sm font-medium transition"
      >
        <ArrowLeft size={16} /> Volver al Panel
      </Link>
        <div className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[hsl(var(--primary))] mb-1">
            Panel de Control
          </p>
          <h1 className="text-4xl font-black uppercase tracking-tight text-[hsl(var(--foreground))] mb-1">
            Nuevo Vehículo
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] font-medium">
            Completá la información técnica para dar de alta el auto en el
            catálogo.
          </p>
        </div>
        <VehicleForm
          categorias={categorias}
          cotizacionDolar={cotizacionDolar}
        />
      </div>
    </div>
  );
};
