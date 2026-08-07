"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, Fuel, AlignJustify, Disc, MessageCircle } from "lucide-react";
import { VehicleGallery } from "@/components/catalog/VehicleGallery";
import { ContactForm } from "@/components/catalog/ContactForm";
import { FinancingSimulator } from "@/components/catalog/FinancingSimulator";
import { FEATURE_FINANCIACION } from "@/lib/features";
import { formatPrecio, precioEnPesos } from "@/lib/precio";

export const VehicleDetailClient = ({ vehicle, vehiculoNombre, whatsappUrl, cotizacionDolar, planes, contacto }: any) => {
  const precioArs = precioEnPesos(Number(vehicle.precio), vehicle.moneda, cotizacionDolar);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-foreground pt-header pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="h-16 flex items-center mb-4">
          <Link
            href="/catalogo"
            className="flex items-center gap-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] text-sm font-bold transition-colors"
          >
            <ArrowLeft size={16} />
            Volver al catálogo
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8">
          <div className="lg:col-span-7 xl:col-span-8">
            <VehicleGallery images={vehicle.imagenes} altText={vehiculoNombre}/>
          </div>

          <div className="lg:col-span-5 xl:col-span-4">
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.1em] text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 px-1 py-0.5 rounded">
                    {vehicle.estado}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.1em] text-[hsl(var(--muted-foreground))] bg-[#0a0a0a] px-1 py-0.5 rounded">
                    {vehicle.categoria.nombre}
                  </span>
                </div>

                <h1 className="text-4xl lg:text-[2.5rem] font-black tracking-tight uppercase mb-1 leading-none">
                  {vehicle.marca} {vehicle.modelo}
                </h1>
                <p className="text-base text-[hsl(var(--muted-foreground))] font-medium">
                  {vehicle.version || vehicle.motor || "Especificación Estándar"}
                </p>
              </div>

              <p className="text-[2.5rem] font-black text-[hsl(var(--primary))] tracking-tighter">
                {formatPrecio(Number(vehicle.precio), vehicle.moneda, cotizacionDolar)}
              </p>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-[#c2410c] text-white py-2 px-4 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-[0.1em] rounded shadow-lg hover:bg-black transition-colors"
              >
                Consultar por WhatsApp
                <MessageCircle size={18} />
              </a>

              <div className="bg-[hsl(var(--card))] rounded-lg p-4 lg:p-6 shadow-sm border border-black/5">
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[hsl(var(--muted-foreground))] mb-4">Ficha Rápida</p>
                <div className="flex flex-col gap-3">
                  <SpecItem icon={<Calendar size={16} />} label="Año" value={vehicle.anio} />
                  <SpecItem icon={<Disc size={16} />} label="KM" value={vehicle.kilometraje.toLocaleString("es-AR")} />
                  <SpecItem icon={<AlignJustify size={16} />} label="Transmisión" value={vehicle.transmision?.toLowerCase()} capitalize />
                  <SpecItem icon={<Fuel size={16} />} label="Combustible" value={vehicle.combustible?.toLowerCase()} capitalize border={false} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 lg:mt-12 pt-6 lg:pt-8 border-t border-black/5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8">
            <div className="lg:col-span-4">
              <h2 className="text-lg font-black uppercase tracking-tight mb-3">
                Especificaciones
              </h2>
              <div className="flex flex-col">
                <SpecRow label="Año" value={vehicle.anio} />
                <SpecRow label="Kilometraje" value={`${vehicle.kilometraje.toLocaleString("es-AR")} KM`} />
                <SpecRow label="Combustible" value={vehicle.combustible || "N/A"} />
                <SpecRow label="Transmisión" value={vehicle.transmision || "N/A"} />
                <SpecRow label="Potencia" value={vehicle.potencia ? `${vehicle.potencia} CV` : "N/A"} />
                <SpecRow label="Color" value={vehicle.color || "N/A"} />
                <SpecRow label="Puertas" value={vehicle.puertas || "N/A"} />
              </div>
            </div>

            <div className="lg:col-span-8">
              <h2 className="text-lg font-black uppercase tracking-tight mb-3">
                Descripción
              </h2>
              {vehicle.descripcion ? (
                <p className="text-base text-foreground/80 leading-relaxed font-medium whitespace-pre-line">
                  {vehicle.descripcion}
                </p>
              ) : (
                <p className="text-sm text-[hsl(var(--muted-foreground))] italic">
                  El vendedor no ha añadido una descripción para este vehículo.
                </p>
              )}
            </div>
          </div>
        </div>

        {FEATURE_FINANCIACION && precioArs !== null && (
        <div className="mt-8 lg:mt-12 pt-6 lg:pt-8 border-t border-black/5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
            <div className="lg:col-span-5">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[hsl(var(--primary))] mb-2">
                Financiación Exclusiva
              </p>
              <h2 className="text-3xl font-black tracking-tight uppercase mb-2">
                Llevátelo hoy, <br/> pagalo a tu ritmo
              </h2>
              <p className="text-[hsl(var(--muted-foreground))] font-medium leading-relaxed mb-3">
                Calculá tu cuota mensual ajustando el anticipo y los plazos. Nuestras tasas son fijas y en pesos.
              </p>
            </div>
            <div className="lg:col-span-7">
              <FinancingSimulator
                vehiculoId={vehicle.id}
                precioArs={precioArs}
                planes={planes || []}
              />
            </div>
          </div>
        </div>
        )}

        <div className="mt-8 lg:mt-12 pt-6 lg:pt-8 border-t border-black/5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
            <div className="lg:col-span-6">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[hsl(var(--primary))] mb-2">
                {contacto?.eyebrow}
              </p>
              <h2 className="text-3xl font-black tracking-tight uppercase mb-2 whitespace-pre-line">
                {contacto?.titulo}
              </h2>
              <p className="text-[hsl(var(--muted-foreground))] font-medium leading-relaxed mb-3 whitespace-pre-line">
                {contacto?.texto}
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.1em] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
              >
                <MessageCircle size={14} />
                {contacto?.whatsappTexto}
              </a>
            </div>

            <div className="lg:col-span-6">
              <ContactForm vehiculoId={vehicle.id} vehiculoNombre={vehiculoNombre} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const SpecItem = ({ icon, label, value, capitalize = false, border = true }: any) => (
  <div className={`flex flex-row items-center justify-between ${border ? 'pb-3 border-b border-black/5' : ''}`}>
    <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
      {icon}
      <span className="text-sm font-bold">{label}</span>
    </div>
    <span className={`text-sm font-black ${capitalize ? 'capitalize' : ''}`}>{value}</span>
  </div>
);

const SpecRow = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex flex-row py-3 border-b border-black/5 items-center justify-between">
    <span className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{label}</span>
    <span className="text-sm font-bold whitespace-nowrap pl-4">{value}</span>
  </div>
);
