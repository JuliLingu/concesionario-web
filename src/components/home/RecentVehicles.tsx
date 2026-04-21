import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { VehicleCard } from "../catalog/VehicleCard";
import { ArrowRight } from "lucide-react";

export async function RecentVehicles() {
  const rawVehicles = await prisma.vehiculo.findMany({
    take: 3,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      imagenes: true,
      categoria: true,
    }
  });

  const recentVehicles = rawVehicles.map((v) => ({
    ...v,
    precio: Number(v.precio),
  }));

  return (
    <section className="bg-surface-low py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
          <div className="max-w-xl">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-6 block">
              The Selection / 2024
            </span>
            <h2 className="text-5xl md:text-6xl font-bold text-foreground uppercase tracking-tight tight-editorial">
               Curaduría <br /> de Excelencia.
            </h2>
          </div>
          <Link 
            href="/catalogo" 
            className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-foreground hover:text-primary transition-all pb-2 border-b-2 border-primary/20 hover:border-primary"
          >
            Ver Catálogo Completo
            <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {recentVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehiculo={vehicle} />
          ))}
        </div>
      </div>
    </section>
  );
}

