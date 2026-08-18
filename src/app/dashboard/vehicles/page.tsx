import { getVehicles } from "@/actions/vehicle";
import { requireAdmin } from "@/lib/sesion";
import { VehiclesView } from "./VehiclesView";
import { getConfiguracion } from "@/services/configuracion.service";

export default async function VehiclesAdminPage() {
  await requireAdmin();

  const [vehicles, configuracion] = await Promise.all([
    getVehicles(),
    getConfiguracion(),
  ]);

  const publicados = vehicles.filter((v) => v.publicacion === "PUBLICADO").length;
  const borradores = vehicles.filter((v) => v.publicacion === "BORRADOR").length;

  return (
    <VehiclesView
      vehicles={vehicles}
      publicados={publicados}
      borradores={borradores}
      cotizacionDolar={configuracion.cotizacionDolar}
      mostrarPrecios={configuracion.mostrarPrecios}
    />
  );
}
