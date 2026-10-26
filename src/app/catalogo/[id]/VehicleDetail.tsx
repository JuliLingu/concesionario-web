import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, Fuel, AlignJustify, Disc, MessageCircle, Handshake } from "lucide-react";
import { VehicleCard } from "@/components/catalog/VehicleCard";
import { VehicleGallery } from "@/components/catalog/VehicleGallery";
import { ContactForm } from "@/components/catalog/ContactForm";
import { FinancingSimulator } from "@/components/catalog/FinancingSimulator";
import { RegistrarVista } from "@/components/catalog/RegistrarVista";
import { WhatsappLink } from "@/components/catalog/WhatsappLink";
import { AccionesFicha } from "@/components/catalog/BotonesSeleccion";
import { precioEnPesos } from "@/lib/precio";
import { precioDeVitrina, type PlanDeCuotas } from "@/lib/vitrina";
import { etiquetaEnum } from "@/lib/etiquetas";
import type { VehiculoElegido, VehiculoFicha as Vehiculo } from "@/services/vehiculo.service";

interface VehicleDetailProps {
  vehicle: Vehiculo;
  vehiculoNombre: string;
  /** Null cuando la concesionaria todavía no cargó un teléfono. */
  whatsappUrl: string | null;
  cotizacionDolar?: number | null;
  /**
   * Precios a la vista, según Configuración. Con `false` la ficha va sin importe
   * y sin simulador de cuotas, que también lo dejaría a la vista.
   */
  mostrarPrecios?: boolean;
  /** Módulo de financiación encendido en Configuración: muestra el simulador. */
  financiacionActiva?: boolean;
  /**
   * Módulo de tasación encendido: ofrece entregar el usado en parte de pago por
   * esta unidad. El enlace la lleva preseleccionada.
   */
  tasacion?: { activa: boolean; ctaTexto: string };
  planes: { id: string; nombre: string; cuotas: number; tasaAnual: number }[];
  contacto: {
    eyebrow: string;
    titulo: string;
    texto: string;
    whatsappTexto: string;
  };
  /** Ver `getSimilares`. Vacío si no hay ninguna que se parezca. */
  similares: VehiculoElegido[];
  /**
   * Planes activos para la cuota de las tarjetas de similares. No son `planes`:
   * esos llegan vacíos si esta unidad es solo contado, y las otras pueden no serlo.
   */
  planesDeTarjeta: PlanDeCuotas[];
}

export const VehicleDetail = ({
  vehicle,
  vehiculoNombre,
  whatsappUrl,
  cotizacionDolar,
  mostrarPrecios = true,
  financiacionActiva = false,
  tasacion,
  planes,
  contacto,
  similares,
  planesDeTarjeta,
}: VehicleDetailProps) => {
  const precioArs = precioEnPesos(vehicle.precio, vehicle.moneda, cotizacionDolar);
  const precio = mostrarPrecios
    ? precioDeVitrina(vehicle.precio, vehicle.moneda, cotizacionDolar)
    : null;

  return (
    // En mobile el pie deja lugar a la barra fija de WhatsApp, que si no tapa
    // lo último de la página.
    <div className={`min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] pt-header ${whatsappUrl ? "pb-28 lg:pb-8" : "pb-8"}`}>
      <RegistrarVista vehiculoId={vehicle.id} />
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
                    {etiquetaEnum(vehicle.estado)}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.1em] text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] px-1 py-0.5 rounded">
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

              {precio && (
                <div>
                  <p className="text-[2.5rem] font-black text-[hsl(var(--primary))] tracking-tighter leading-none">
                    {precio.principal}
                  </p>
                  {precio.secundario && (
                    <p className="mt-1 text-sm font-bold text-[hsl(var(--muted-foreground))] tabular-nums">
                      {precio.secundario}
                    </p>
                  )}
                </div>
              )}

              {whatsappUrl && (
                <WhatsappLink
                  href={whatsappUrl}
                  vehiculoId={vehicle.id}
                  className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] py-2 px-4 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-[0.1em] rounded shadow-lg hover:brightness-90 transition-colors"
                >
                  Consultar por WhatsApp
                  <MessageCircle size={18} />
                </WhatsappLink>
              )}

              {/* Secundario a propósito: el botón principal de la ficha sigue
                  siendo consultar por la unidad. La permuta es el otro camino,
                  no el mismo con otro color. */}
              {tasacion?.activa && (
                <Link
                  href={`/tasacion?vehiculo=${vehicle.id}`}
                  className="bg-[hsl(var(--surface-low))] text-[hsl(var(--foreground))] py-2 px-4 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-[0.1em] rounded hover:bg-[hsl(var(--muted))] transition-colors"
                >
                  <Handshake size={18} />
                  {tasacion.ctaTexto}
                </Link>
              )}

              <AccionesFicha vehiculoId={vehicle.id} vendido={vehicle.publicacion === "VENDIDO"} />

              <div className="bg-[hsl(var(--card))] rounded-lg p-4 lg:p-6 shadow-sm border border-black/5">
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[hsl(var(--muted-foreground))] mb-4">Ficha Rápida</p>
                {/* El separador va entre filas y no en cada una: con un dato sin
                    cargar la última fila cambia, y un borde fijo quedaba colgando. */}
                <div className="flex flex-col gap-3 [&>*:not(:last-child)]:pb-3 [&>*:not(:last-child)]:border-b [&>*:not(:last-child)]:border-black/5">
                  <SpecItem icon={<Calendar size={16} />} label="Año" value={vehicle.anio} />
                  <SpecItem icon={<Disc size={16} />} label="KM" value={vehicle.kilometraje.toLocaleString("es-AR")} />
                  {vehicle.transmision && (
                    <SpecItem icon={<AlignJustify size={16} />} label="Transmisión" value={etiquetaEnum(vehicle.transmision)} />
                  )}
                  {vehicle.combustible && (
                    <SpecItem icon={<Fuel size={16} />} label="Combustible" value={etiquetaEnum(vehicle.combustible)} />
                  )}
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
              {/* Los datos opcionales que no se cargaron no se listan: un "N/A"
                  le habla a una planilla, no a quien está por comprar el auto. */}
              <div className="flex flex-col">
                <SpecRow label="Año" value={vehicle.anio} />
                <SpecRow label="Kilometraje" value={`${vehicle.kilometraje.toLocaleString("es-AR")} KM`} />
                {vehicle.combustible && <SpecRow label="Combustible" value={etiquetaEnum(vehicle.combustible)} />}
                {vehicle.transmision && <SpecRow label="Transmisión" value={etiquetaEnum(vehicle.transmision)} />}
                {vehicle.motor && <SpecRow label="Motor" value={vehicle.motor} />}
                {vehicle.potencia ? <SpecRow label="Potencia" value={`${vehicle.potencia} CV`} /> : null}
                {vehicle.color && <SpecRow label="Color" value={vehicle.color} />}
                {vehicle.puertas ? <SpecRow label="Puertas" value={vehicle.puertas} /> : null}
              </div>
            </div>

            <div className="lg:col-span-8">
              <h2 className="text-lg font-black uppercase tracking-tight mb-3">
                Descripción
              </h2>
              {vehicle.descripcion ? (
                <p className="text-base text-[hsl(var(--foreground))]/80 leading-relaxed font-medium whitespace-pre-line">
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

        {/* Sin planes activos el simulador se renderiza vacío: el bloque entero
            se omite para no dejar el título colgado. */}
        {financiacionActiva &&
          mostrarPrecios &&
          precioArs !== null &&
          planes.length > 0 && (
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
                planes={planes}
              />
            </div>
          </div>
        </div>
        )}

        <div className="mt-8 lg:mt-12 pt-6 lg:pt-8 border-t border-black/5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
            <div className="lg:col-span-6">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[hsl(var(--primary))] mb-2">
                {contacto.eyebrow}
              </p>
              <h2 className="text-3xl font-black tracking-tight uppercase mb-2 whitespace-pre-line">
                {contacto.titulo}
              </h2>
              <p className="text-[hsl(var(--muted-foreground))] font-medium leading-relaxed mb-3 whitespace-pre-line">
                {contacto.texto}
              </p>
              {whatsappUrl && (
                <WhatsappLink
                  href={whatsappUrl}
                  vehiculoId={vehicle.id}
                  className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.1em] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
                >
                  <MessageCircle size={14} />
                  {contacto.whatsappTexto}
                </WhatsappLink>
              )}
            </div>

            <div className="lg:col-span-6">
              <ContactForm vehiculoId={vehicle.id} vehiculoNombre={vehiculoNombre} />
            </div>
          </div>
        </div>

        {/* La ficha terminaba en el formulario: quien no se convenció con esta
            unidad no tenía a dónde seguir. Sin similares, el bloque no va. */}
        {similares.length > 0 && (
          <section className="mt-8 lg:mt-12 pt-6 lg:pt-8 border-t border-black/5" aria-labelledby="similares">
            <div className="flex items-end justify-between gap-3 mb-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[hsl(var(--primary))] mb-2">
                  Seguí mirando
                </p>
                <h2 id="similares" className="text-3xl font-black tracking-tight uppercase">
                  Unidades similares
                </h2>
              </div>
              <Link
                href={`/catalogo?categoria=${vehicle.categoria.slug}`}
                className="shrink-0 inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-[0.1em] text-[hsl(var(--primary))] hover:text-[hsl(var(--foreground))] transition-colors"
              >
                Ver más <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similares.map((v) => (
                <VehicleCard
                  key={v.id}
                  vehiculo={v}
                  cotizacionDolar={cotizacionDolar}
                  mostrarPrecios={mostrarPrecios}
                  planes={planesDeTarjeta}
                />
              ))}
            </div>
          </section>
        )}

      </div>

      {/* Barra fija en mobile: el botón de arriba queda fuera de pantalla en
          cuanto se baja a ver las fotos y las especificaciones, que es justo
          cuando se decide consultar. En escritorio la columna lateral ya lo
          deja a la vista. */}
      {whatsappUrl && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-[hsl(var(--card))]/95 backdrop-blur border-t border-black/10 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(26,28,30,0.08)]">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase truncate">
                {vehicle.marca} {vehicle.modelo}
              </p>
              {precio && (
                <p className="text-sm font-black text-[hsl(var(--primary))] tabular-nums truncate">
                  {precio.principal}
                </p>
              )}
            </div>
            <WhatsappLink
              href={whatsappUrl}
              vehiculoId={vehicle.id}
              className="shrink-0 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] py-3 px-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.1em] rounded shadow-lg hover:brightness-90 transition-colors"
            >
              <MessageCircle size={16} />
              WhatsApp
            </WhatsappLink>
          </div>
        </div>
      )}
    </div>
  );
};

const SpecItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) => (
  <div className="flex flex-row items-center justify-between">
    <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
      {icon}
      <span className="text-sm font-bold">{label}</span>
    </div>
    <span className="text-sm font-black">{value}</span>
  </div>
);

const SpecRow = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex flex-row py-3 border-b border-black/5 items-center justify-between">
    <span className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{label}</span>
    <span className="text-sm font-bold whitespace-nowrap pl-4">{value}</span>
  </div>
);
