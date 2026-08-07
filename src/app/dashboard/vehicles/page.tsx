import { getVehicles } from "@/actions/vehicle";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { VehiclesClient } from "./VehiclesClient";
import { getConfiguracion } from "@/services/configuracion.service";

export default async function VehiclesAdminPage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/");
  }

  const [vehicles, configuracion] = await Promise.all([
    getVehicles(),
    getConfiguracion(),
  ]);

  const publicados = vehicles.filter((v) => v.publicacion === "PUBLICADO").length;
  const borradores = vehicles.filter((v) => v.publicacion === "BORRADOR").length;

  return (
    <VehiclesClient
      vehicles={vehicles}
      publicados={publicados}
      borradores={borradores}
      cotizacionDolar={configuracion.cotizacionDolar}
    />
  );
}