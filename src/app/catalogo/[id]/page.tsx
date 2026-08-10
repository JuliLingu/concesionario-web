import { getVehicleById } from "@/actions/vehicle";
import { getConfiguracion } from "@/services/configuracion.service";
import { conNombreConcesionaria } from "@/lib/configuracion-defaults";
import { getPlanes } from "@/actions/financiacion";
import { notFound } from "next/navigation";
import { VehicleDetailClient } from "./VehicleDetailClient";
import { FEATURE_FINANCIACION } from "@/lib/features";
import { whatsappUrl } from "@/lib/whatsapp";

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

  // Con la financiación en stand by no se consultan los planes: la ficha no
  // muestra el simulador.
  const [configuracion, rawPlanes] = await Promise.all([
    getConfiguracion(),
    FEATURE_FINANCIACION ? getPlanes(false) : [] // solo activos
  ]);
  
  const vehiculoNombre = `${vehicle.marca} ${vehicle.modelo} ${vehicle.anio}`;
  const whatsappHref = whatsappUrl(
    configuracion.telefono,
    `Hola, me interesa el ${vehiculoNombre}. ¿Podría darme más información?`,
  );

  const planes = rawPlanes.map(p => ({
    id: p.id,
    nombre: p.nombre,
    cuotas: p.cuotas,
    tasaAnual: p.tasaAnual.toNumber(),
  }));

  // Textos de la sección de consulta: se editan en /dashboard/settings y
  // admiten el marcador {concesionaria}, que se resuelve acá.
  const contacto = {
    eyebrow: configuracion.contactoEyebrow,
    titulo: configuracion.contactoTitulo,
    texto: conNombreConcesionaria(
      configuracion.contactoTexto,
      configuracion.nombreConcesionaria,
    ),
    whatsappTexto: configuracion.contactoWhatsappTexto,
  };

  return (
    <VehicleDetailClient
      vehicle={vehicle}
      vehiculoNombre={vehiculoNombre}
      whatsappUrl={whatsappHref}
      cotizacionDolar={configuracion?.cotizacionDolar}
      planes={planes}
      contacto={contacto}
    />
  );
}
