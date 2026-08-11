import Image from "next/image";
import Link from "next/link";
import { Vehiculo, ImagenVehiculo } from "../../../generated/prisma";
import { Calendar, Car, Fuel, AlignJustify, ArrowRight } from "lucide-react";
import { getCldUrl } from "@/lib/cloudinary";
import { formatPrecio } from "@/lib/precio";

export type VehiculoDeTarjeta = Omit<Vehiculo, "precio"> & {
  imagenes: ImagenVehiculo[];
  precio: number;
};

interface VehicleCardProps {
  vehiculo: VehiculoDeTarjeta;
  priority?: boolean;
  cotizacionDolar?: number | null;
  /**
   * Botón de edición superpuesto sobre la foto. Llega como slot desde quien
   * arma el listado en lugar de decidirse acá con un `isAdmin`: así el modal de
   * edición —que arrastra el formulario entero del panel— nunca entra en el
   * bundle de una página pública. Ver VehicleCardAdminOverlay.
   */
  accionAdmin?: React.ReactNode;
}

export const VehicleCard = ({
  vehiculo,
  priority = false,
  cotizacionDolar,
  accionAdmin,
}: VehicleCardProps) => {
  const imagenPrincipal =
    vehiculo.imagenes.find((img) => img.esPrincipal)?.url || vehiculo.imagenes[0]?.url || "";

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
            <Car className="w-16 h-16 text-[hsl(var(--muted-foreground))] opacity-20" />
          </div>
        )}

        {accionAdmin}
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
    </div>
  );
};
