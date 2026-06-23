import { getVehicleById } from "@/actions/vehicle";
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

  const vehiculoNombre = `${vehicle.marca} ${vehicle.modelo} ${vehicle.anio}`;
  const whatsappText = encodeURIComponent(
    `Hola, me interesa el ${vehiculoNombre}. ¿Podría darme más información?`
  );
  const whatsappUrl = `https://wa.me/5492234214414?text=${whatsappText}`;

  return (
    <VehicleDetailClient 
      vehicle={vehicle} 
      vehiculoNombre={vehiculoNombre} 
      whatsappUrl={whatsappUrl} 
    />
  );
}
