import { getVehicleById } from "@/actions/vehicle";
import { getConfiguracion } from "@/actions/configuracion";
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

  const configuracion = await getConfiguracion();
  
  // Clean phone number for WhatsApp (remove spaces, dashes, plus sign, etc.)
  const rawPhone = configuracion?.telefono || "5492234214414";
  const cleanPhone = rawPhone.replace(/\D/g, "");

  const vehiculoNombre = `${vehicle.marca} ${vehicle.modelo} ${vehicle.anio}`;
  const whatsappText = encodeURIComponent(
    `Hola, me interesa el ${vehiculoNombre}. ¿Podría darme más información?`
  );
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${whatsappText}`;

  return (
    <VehicleDetailClient 
      vehicle={vehicle} 
      vehiculoNombre={vehiculoNombre} 
      whatsappUrl={whatsappUrl} 
      cotizacionDolar={configuracion?.cotizacionDolar}
    />
  );
}
