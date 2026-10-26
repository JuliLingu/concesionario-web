import Image from "next/image";
import Link from "next/link";
import { Vehiculo, ImagenVehiculo } from "../../../generated/prisma";
import { Calendar, Car, Fuel, AlignJustify, ArrowRight, Gauge, TrendingDown } from "lucide-react";
import { getCldUrl } from "@/lib/cloudinary";
import { formatArs, formatNumeroAr, formatPrecioOriginal, precioEnPesos } from "@/lib/precio";
import { bajaVigente } from "@/lib/baja-precio";
import { etiquetaEnum } from "@/lib/etiquetas";
import { AccionesTarjeta } from "./BotonesSeleccion";
import {
  ANTICIPO_POR_DEFECTO,
  ETIQUETA_INSIGNIA,
  cuotaDesde,
  insigniasDeVehiculo,
  precioDeVitrina,
  type Insignia,
  type PlanDeCuotas,
} from "@/lib/vitrina";

const ESTILO_INSIGNIA: Record<Insignia, string> = {
  VENDIDO: "bg-[hsl(var(--foreground))] text-[hsl(var(--background))]",
  NUEVO_INGRESO: "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]",
  FINANCIABLE: "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]",
  BAJO_KM: "bg-emerald-600/10 text-emerald-700",
};

export type VehiculoDeTarjeta = Omit<Vehiculo, "precio" | "precioAnterior"> & {
  imagenes: ImagenVehiculo[];
  precio: number;
  precioAnterior: number | null;
};

interface VehicleCardProps {
  vehiculo: VehiculoDeTarjeta;
  priority?: boolean;
  cotizacionDolar?: number | null;
  /** Precios a la vista, según Configuración. Con `false` la tarjeta va sin importe. */
  mostrarPrecios?: boolean;
  /**
   * Botón de edición superpuesto sobre la foto. Llega como slot desde quien
   * arma el listado en lugar de decidirse acá con un `isAdmin`: así el modal de
   * edición —que arrastra el formulario entero del panel— nunca entra en el
   * bundle de una página pública. Ver VehicleCardAdminOverlay.
   */
  accionAdmin?: React.ReactNode;
  /**
   * Planes de financiación activos. Vacío con el módulo apagado: sin planes no
   * hay ni etiqueta "Financiable" ni cuota en la tarjeta.
   */
  planes?: PlanDeCuotas[];
}

export const VehicleCard = ({
  vehiculo,
  priority = false,
  cotizacionDolar,
  mostrarPrecios = true,
  accionAdmin,
  planes = [],
}: VehicleCardProps) => {
  const imagenPrincipal =
    vehiculo.imagenes.find((img) => img.esPrincipal)?.url || vehiculo.imagenes[0]?.url || "";

  const insignias = insigniasDeVehiculo(vehiculo, planes.length > 0);
  const vendido = insignias.includes("VENDIDO");
  const precio = precioDeVitrina(vehiculo.precio, vehiculo.moneda, cotizacionDolar);
  const baja = bajaVigente(vehiculo);
  const cuota = vehiculo.financiable
    ? cuotaDesde(precioEnPesos(vehiculo.precio, vehiculo.moneda, cotizacionDolar), planes)
    : null;

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

        {vendido && (
          <div className="absolute inset-0 bg-black/45 flex items-center justify-center pointer-events-none">
            <span className="bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-xs font-black uppercase tracking-[0.3em] px-4 py-2 -rotate-6 shadow-lg">
              Vendido
            </span>
          </div>
        )}

        <AccionesTarjeta vehiculoId={vehiculo.id} vendido={vendido} />
        {accionAdmin}
      </div>

      {/* Content Section */}
      <div className="flex flex-col p-5 flex-grow">
        {/* Badges row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap gap-1.5">
            {insignias
              .filter((i) => i !== "VENDIDO")
              .map((i) => (
                <span
                  key={i}
                  className={`text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 ${ESTILO_INSIGNIA[i]}`}
                >
                  {ETIQUETA_INSIGNIA[i]}
                </span>
              ))}
          </div>
          <span className="shrink-0 text-[9px] font-black uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))] px-2 py-0.5 bg-[hsl(var(--surface-low))]">
            {etiquetaEnum(vehiculo.estado)}
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
            <Gauge size={14} className="opacity-40" />
            <span className="text-[11px] font-bold tabular-nums">{formatNumeroAr(vehiculo.kilometraje)} km</span>
          </div>
          {vehiculo.combustible && (
            <div className="flex items-center gap-1">
              <Fuel size={14} className="opacity-40" />
              <span className="text-[11px] font-bold">{etiquetaEnum(vehiculo.combustible)}</span>
            </div>
          )}
          {vehiculo.transmision && (
            <div className="flex items-center gap-1">
              <AlignJustify size={14} className="opacity-40" />
              <span className="text-[11px] font-bold">{etiquetaEnum(vehiculo.transmision)}</span>
            </div>
          )}
        </div>

        {/* Price and CTA */}
        <div className="mt-auto pt-4 border-t border-[hsl(var(--border))]">
          {/* Una vendida no lleva precio ni cuota: ya no se puede comprar. */}
          {mostrarPrecios && !vendido && (
            <div className="mb-4">
              {baja !== null && (
                <span className="inline-flex items-center gap-1 mb-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-emerald-700 bg-emerald-600/10 px-2 py-0.5">
                  <TrendingDown size={12} aria-hidden />
                  Bajó <span className="tabular-nums">{formatPrecioOriginal(baja, vehiculo.moneda)}</span>
                </span>
              )}
              <span className="block text-2xl font-black text-[hsl(var(--primary))] tracking-[-0.05em] leading-none tabular-nums">
                {precio.principal}
              </span>
              {precio.secundario && (
                <span className="block mt-1 text-xs font-bold text-[hsl(var(--muted-foreground))] tabular-nums">
                  {precio.secundario}
                </span>
              )}
              {cuota !== null && (
                <span
                  className="block mt-2 text-xs font-bold text-[hsl(var(--foreground))]"
                  title={`Con ${ANTICIPO_POR_DEFECTO}% de anticipo`}
                >
                  Cuotas desde <span className="tabular-nums">{formatArs(cuota)}</span>/mes
                </span>
              )}
            </div>
          )}
          {vendido && !accionAdmin ? (
            // La ficha de una vendida responde 404 al público: no se enlaza.
            // El administrador —el único que recibe `accionAdmin`— sí la abre.
            <span className="w-full bg-[hsl(var(--surface-low))] text-[hsl(var(--muted-foreground))] px-4 py-3 text-[11px] font-black uppercase tracking-[0.1em] flex items-center justify-center">
              Unidad vendida
            </span>
          ) : (
            <Link
              href={`/catalogo/${vehiculo.id}`}
              className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-3 text-[11px] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-1.5 hover:brightness-90 active:scale-95 transition-all shadow-[0_4px_6px_-1px_hsl(var(--primary)/0.2)]"
            >
              Ver Detalles <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
