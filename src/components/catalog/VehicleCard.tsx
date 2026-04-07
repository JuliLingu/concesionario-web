import Image from "next/image";
import { Vehiculo, ImagenVehiculo } from "../../../generated/prisma";

interface VehicleCardProps {
  vehiculo: Vehiculo & {
    imagenes: ImagenVehiculo[];
  };
}

export const VehicleCard = ({ vehiculo }: VehicleCardProps) => {
  const imagenPrincipal = vehiculo.imagenes.find(img => img.esPrincipal)?.url || vehiculo.imagenes[0]?.url || "/placeholder-car.png";

  return (
    <div className="group overflow-hidden rounded-2xl bg-white shadow-md border border-gray-100 hover:shadow-xl transition-all">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={imagenPrincipal}
          alt={`${vehiculo.marca} ${vehiculo.modelo}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 leading-tight">
            {vehiculo.marca} {vehiculo.modelo}
          </h3>
          <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
            {vehiculo.anio}
          </span>
        </div>
        <p className="text-2xl font-black text-gray-900 mb-4">
          {vehiculo.moneda} ${Number(vehiculo.precio).toLocaleString()}
        </p>
        <div className="flex items-center gap-4 text-xs text-gray-500 font-medium uppercase tracking-wider">
          <span>{vehiculo.kilometraje.toLocaleString()} KM</span>
          <span>•</span>
          <span>{vehiculo.transmision}</span>
        </div>
      </div>
    </div>
  );
};