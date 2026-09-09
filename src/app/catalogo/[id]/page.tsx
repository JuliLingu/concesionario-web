import { getVehicleById } from "@/actions/vehicle";
import { getConfiguracion } from "@/services/configuracion.service";
import { getPlanes } from "@/actions/financiacion";
import { notFound } from "next/navigation";
import { VehicleDetail } from "./VehicleDetail";
import { whatsappUrl } from "@/lib/whatsapp";

interface VehiclePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function VehicleDetailPage({ params }: VehiclePageProps) {
  const { id } = await params;

  const [vehicle, configuracion] = await Promise.all([
    getVehicleById(id),
    getConfiguracion(),
  ]);

  if (!vehicle) {
    notFound();
  }

  // Los planes son globales, así que la unidad tiene que estar marcada como
  // financiable para ofrecerlos: sin eso, un alta nueva entraría sola al
  // simulador. Si el módulo está apagado o la unidad es solo contado, los planes
  // ni se consultan.
  const rawPlanes =
    configuracion.financiacionActiva && vehicle.financiable
      ? await getPlanes(false) // solo activos
      : [];

  const vehiculoNombre = `${vehicle.marca} ${vehicle.modelo} ${vehicle.anio}`;
  const whatsappHref = whatsappUrl(
    configuracion.telefono,
    `Hola, me interesa el ${vehiculoNombre}. ¿Podría darme más información?`,
  );

  const planes = rawPlanes.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    cuotas: p.cuotas,
    tasaAnual: p.tasaAnual.toNumber(),
  }));

  // Textos de la sección de consulta: se editan en /dashboard/settings. El
  // marcador {concesionaria} ya viene resuelto por el service.
  const contacto = {
    eyebrow: configuracion.contactoEyebrow,
    titulo: configuracion.contactoTitulo,
    texto: configuracion.contactoTexto,
    whatsappTexto: configuracion.contactoWhatsappTexto,
  };

  return (
    <VehicleDetail
      vehicle={vehicle}
      vehiculoNombre={vehiculoNombre}
      whatsappUrl={whatsappHref}
      cotizacionDolar={configuracion.cotizacionDolar}
      mostrarPrecios={configuracion.mostrarPrecios}
      financiacionActiva={configuracion.financiacionActiva}
      planes={planes}
      contacto={contacto}
    />
  );
}
