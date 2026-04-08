import { prisma } from "@/lib/prisma";
import Link from "next/link";

export async function RecentVehicles() {
  // Obtenemos los 3 vehículos más recientes directamente en el componente
  const recentVehicles = await prisma.vehiculo.findMany({
    take: 3,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      categoria: true,
    },
  });

  return (
    <section className="max-w-7xl mx-auto py-20 px-6">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Últimos Ingresos</h2>
          <div className="h-1.5 w-20 bg-blue-600 mt-2"></div>
        </div>
        <Link href="/catalogo" className="text-blue-600 font-bold hover:underline">Ver todos</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {recentVehicles.map((vehicle) => (
          <div key={vehicle.id} className="group border rounded-2xl overflow-hidden hover:shadow-xl transition-shadow bg-white">
            <div className="aspect-video bg-gray-200 relative">
              {/* Placeholder para la imagen */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium">Imagen del Vehículo</div>
            </div>
            <div className="p-6">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                {vehicle.categoria?.nombre || "General"}
              </span>
              <h3 className="text-xl font-bold text-gray-900 mt-1">{vehicle.marca} {vehicle.modelo}</h3>
              <p className="text-2xl font-black text-gray-900 mt-4">${Number(vehicle.precio).toLocaleString()}</p>
              <Link href={`/vehicles/${vehicle.id}`} className="mt-6 block text-center bg-gray-100 py-2 rounded-lg font-semibold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                Ver Detalles
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}