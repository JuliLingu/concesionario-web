import Link from "next/link";
import { VehicleCard, type VehiculoDeTarjeta } from "../catalog/VehicleCard";
import { ArrowRight } from "lucide-react";

export function RecentVehiclesUI({
  vehicles,
  cotizacionDolar,
  mostrarPrecios,
}: {
  vehicles: VehiculoDeTarjeta[];
  cotizacionDolar?: number | null;
  /** Precios a la vista, según Configuración. */
  mostrarPrecios?: boolean;
}) {
  return (
    <section className="bg-[hsl(var(--card))] py-32">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row gap-8 mb-24 md:items-end justify-between">
          <div className="max-w-xl">
            <h2 className="text-[3rem] md:text-[3.75rem] font-extrabold text-[hsl(var(--foreground))] uppercase tracking-[-0.02em] leading-none">
              Algunos de nuestros vehiculos
            </h2>
          </div>
          <Link
            href="/catalogo"
            className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[hsl(var(--foreground))] no-underline pb-2 border-b-2 border-[hsl(var(--primary))]/20 hover:text-[hsl(var(--primary))] hover:border-[hsl(var(--primary))] transition-all duration-300"
          >
            Ver Catálogo Completo
            <span className="flex transition-transform duration-300 group-hover:translate-x-2">
              <ArrowRight size={14} />
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {vehicles.map((vehicle, index) => (
            <div key={vehicle.id} className="w-full">
              <VehicleCard
                vehiculo={vehicle}
                priority={index === 0}
                cotizacionDolar={cotizacionDolar}
                mostrarPrecios={mostrarPrecios}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
