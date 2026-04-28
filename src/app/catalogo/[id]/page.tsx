import { getVehicleById } from "@/actions/vehicle";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Fuel, AlignJustify, Disc, MessageCircle } from "lucide-react";
import { VehicleGallery } from "@/components/catalog/VehicleGallery";
import { ContactForm } from "@/components/catalog/ContactForm";

interface VehiclePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function VehicleDetailPage({ params }: VehiclePageProps) {
  const resolvedParams = await params;
  const vehicle = await getVehicleById(resolvedParams.id);

  if (!vehicle) {
    notFound();
  }

  const vehiculoNombre = `${vehicle.marca} ${vehicle.modelo} ${vehicle.anio}`;
  const whatsappText = encodeURIComponent(
    `Hola, me interesa el ${vehiculoNombre}. ¿Podría darme más información?`
  );
  const whatsappUrl = `https://wa.me/5492234214414?text=${whatsappText}`;

  return (
    <div className="min-h-screen bg-surface-lowest text-foreground font-manrope">
      {/* Contenedor Principal */}
      <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
          <Link href="/catalogo" className="flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors text-sm font-bold">
            <ArrowLeft size={16} /> Volver al catálogo
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* Columna Izquierda: Galería */}
          <div className="lg:col-span-7 xl:col-span-8">
            <VehicleGallery
              images={vehicle.imagenes}
              altText={vehiculoNombre}
            />
          </div>

          {/* Columna Derecha: Información y Compra */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
            {/* Etiquetas */}
            <div className="flex gap-2 mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-1 rounded-sm">
                {vehicle.estado}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60 bg-surface-low px-2 py-1 rounded-sm">
                {vehicle.categoria.nombre}
              </span>
            </div>

            {/* Título Principal */}
            <h1 className="text-3xl lg:text-4xl font-space font-black tracking-tight leading-none mb-2 text-foreground uppercase">
              {vehicle.marca} {vehicle.modelo}
            </h1>
            <p className="text-base text-foreground/60 font-medium mb-6">
              {vehicle.version || vehicle.motor || "Especificación Estándar"}
            </p>

            {/* Precio */}
            <div className="text-3xl lg:text-4xl font-black text-foreground tracking-tighter mb-8">
              U$D {Number(vehicle.precio).toLocaleString("es-AR")}
            </div>

            {/* CTA WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-racing text-white flex items-center justify-center gap-2 py-4 rounded-md shadow-premium hover:bg-black transition-all text-sm font-black uppercase tracking-widest mb-10"
            >
              Consultar por WhatsApp <MessageCircle size={18} />
            </a>

            {/* Ficha Rápida */}
            <div className="bg-surface-low rounded-lg p-5 flex flex-col gap-4 border border-foreground/5 mb-8">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Ficha Rápida</h3>
              <div className="flex justify-between items-center border-b border-foreground/5 pb-2">
                <span className="text-sm font-bold text-foreground/60 flex items-center gap-2"><Calendar size={16} /> Año</span>
                <span className="text-sm font-black">{vehicle.anio}</span>
              </div>
              <div className="flex justify-between items-center border-b border-foreground/5 pb-2">
                <span className="text-sm font-bold text-foreground/60 flex items-center gap-2"><Disc size={16} /> KM</span>
                <span className="text-sm font-black">{vehicle.kilometraje.toLocaleString("es-AR")}</span>
              </div>
              <div className="flex justify-between items-center border-b border-foreground/5 pb-2">
                <span className="text-sm font-bold text-foreground/60 flex items-center gap-2"><AlignJustify size={16} /> Transmisión</span>
                <span className="text-sm font-black capitalize">{vehicle.transmision?.toLowerCase()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-foreground/60 flex items-center gap-2"><Fuel size={16} /> Combustible</span>
                <span className="text-sm font-black capitalize">{vehicle.combustible?.toLowerCase()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detalles Técnicos + Descripción + Formulario de Consulta */}
        <div className="mt-16 lg:mt-24 pt-12 border-t border-foreground/5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Especificaciones */}
            <div className="lg:col-span-1">
              <h2 className="text-lg font-space font-black uppercase tracking-tight text-foreground mb-6">
                Especificaciones
              </h2>
              <div className="flex flex-col gap-3">
                <SpecRow label="Año" value={vehicle.anio} />
                <SpecRow label="Kilometraje" value={`${vehicle.kilometraje.toLocaleString("es-AR")} KM`} />
                <SpecRow label="Combustible" value={vehicle.combustible || "N/A"} />
                <SpecRow label="Transmisión" value={vehicle.transmision || "N/A"} />
                <SpecRow label="Potencia" value={vehicle.potencia ? `${vehicle.potencia} CV` : "N/A"} />
                <SpecRow label="Color" value={vehicle.color || "N/A"} />
                <SpecRow label="Puertas" value={vehicle.puertas || "N/A"} />
              </div>
            </div>

            {/* Descripción */}
            <div className="lg:col-span-2">
              <h2 className="text-lg font-space font-black uppercase tracking-tight text-foreground mb-6">
                Descripción
              </h2>
              {vehicle.descripcion ? (
                <p className="text-base text-foreground/70 leading-relaxed font-medium whitespace-pre-line">
                  {vehicle.descripcion}
                </p>
              ) : (
                <p className="text-sm text-foreground/40 italic">
                  El vendedor no ha añadido una descripción para este vehículo.
                </p>
              )}
            </div>

          </div>
        </div>

        {/* Sección de Consulta */}
        <div className="mt-16 lg:mt-24 pt-12 border-t border-foreground/5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Texto izquierdo */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary block mb-4">
                ¿Te interesa?
              </span>
              <h2 className="text-3xl font-space font-black tracking-tight text-foreground uppercase mb-4">
                Consultá por esta unidad
              </h2>
              <p className="text-foreground/60 font-medium leading-relaxed mb-6">
                Completá el formulario y un asesor de JBJ Automotores se comunicará con vos a la brevedad para coordinar una visita o responder todas tus preguntas.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-foreground/50 hover:text-primary transition-colors"
              >
                <MessageCircle size={14} />
                O escribinos directo por WhatsApp
              </a>
            </div>

            {/* Formulario derecho */}
            <ContactForm
              vehiculoId={vehicle.id}
              vehiculoNombre={vehiculoNombre}
            />
          </div>
        </div>

      </div>
    </div>
  );
}

const SpecRow = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex justify-between items-center py-3 border-b border-foreground/5">
    <span className="text-sm font-medium text-foreground/60">{label}</span>
    <span className="text-sm font-bold text-foreground truncate pl-4">{value}</span>
  </div>
);
