import { getVehicleById } from "@/actions/vehicle";
import { getConfiguracion } from "@/services/configuracion.service";
import { getPlanes } from "@/actions/financiacion";
import { notFound } from "next/navigation";
import { VehicleDetail } from "./VehicleDetail";
import { FEATURE_FINANCIACION } from "@/lib/features";
import { whatsappUrl } from "@/lib/whatsapp";

interface VehiclePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function VehicleDetailPage({ params }: VehiclePageProps) {
  const { id } = await params;

  // Ninguna de las tres depende de las otras. Con la financiación en stand by
  // los planes ni se consultan: la ficha no muestra el simulador.
  const [vehicle, configuracion, rawPlanes] = await Promise.all([
    getVehicleById(id),
    getConfiguracion(),
    FEATURE_FINANCIACION ? getPlanes(false) : [], // solo activos
  ]);

  if (!vehicle) {
    notFound();
  }

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
      planes={planes}
      contacto={contacto}
    />
  );
}
