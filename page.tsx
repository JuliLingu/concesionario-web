import { prisma } from "@/lib/prisma";
import { VehicleCard } from "@/components/catalog/VehicleCard";

export default async function CatalogPage() {
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Nuestro Catálogo</h1>
          <p className="text-gray-500 mt-2">Encuentra el vehículo perfecto para ti entre nuestra selección premium.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            brand={vehicle.brand}
            model={vehicle.model}
            year={vehicle.year}
            price={vehicle.price}
            mileage={vehicle.mileage}
            transmission={vehicle.transmission}
            image={vehicle.images[0] || "/placeholder-car.jpg"}
          />
        ))}
      </div>
    </div>
  );
}