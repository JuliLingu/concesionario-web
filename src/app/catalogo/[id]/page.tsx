import { getVehicleById } from "@/actions/vehicle";
import { getConfiguracion } from "@/actions/configuracion";
import { getPlanes } from "@/actions/financiacion";
import { notFound } from "next/navigation";
import { VehicleDetailClient } from "./VehicleDetailClient";

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

  const [configuracion, rawPlanes] = await Promise.all([
    getConfiguracion(),
    getPlanes(false) // solo activos
  ]);
  
  // Clean phone number for WhatsApp
  const rawPhone = configuracion?.telefono || "5492234214414";
  const cleanPhone = rawPhone.replace(/\D/g, "");

  const vehiculoNombre = `${vehicle.marca} ${vehicle.modelo} ${vehicle.anio}`;
  const whatsappText = encodeURIComponent(
    `Hola, me interesa el ${vehiculoNombre}. ¿Podría darme más información?`
  );
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${whatsappText}`;

  const planes = rawPlanes.map(p => ({
    id: p.id,
    nombre: p.nombre,
    cuotas: p.cuotas,
    tasaAnual: p.tasaAnual.toNumber(),
  }));

  return (
    <VehicleDetailClient 
      vehicle={vehicle} 
      vehiculoNombre={vehiculoNombre} 
      whatsappUrl={whatsappUrl} 
      cotizacionDolar={configuracion?.cotizacionDolar}
      planes={planes}
    />
  );
}
