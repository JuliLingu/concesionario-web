import { getVehicles } from "@/actions/vehicle";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function VehiclesAdminPage() {
  const session = await auth();

  const vehicles = await getVehicles();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Inventario</h1>
          <p className="text-gray-500">Gestiona los vehículos publicados en el catálogo.</p>
        </div>
        <Link
          href="/dashboard/vehicles/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg"
        >
          + AGREGAR AUTO
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 font-bold text-gray-600 text-sm">Vehículo</th>
              <th className="p-4 font-bold text-gray-600 text-sm">Categoría</th>
              <th className="p-4 font-bold text-gray-600 text-sm">Precio</th>
              <th className="p-4 font-bold text-gray-600 text-sm">Estado</th>
              <th className="p-4 font-bold text-gray-600 text-sm text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {vehicles.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-gray-900">{v.marca} {v.modelo}</div>
                  <div className="text-xs text-gray-400">{v.anio} • {v.kilometraje.toLocaleString()} KM</div>
                </td>
                <td className="p-4 text-sm text-gray-600">
                  <span className="bg-gray-100 px-2 py-1 rounded-md">{v.categoria.nombre}</span>
                </td>
                <td className="p-4 font-bold text-gray-900">
                  {v.moneda} ${Number(v.precio).toLocaleString()}
                </td>
                <td className="p-4 text-sm">
                  <span className={`font-semibold ${v.publicacion === "PUBLICADO" ? "text-green-600" : "text-amber-600"}`}>
                    {v.publicacion}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link 
                      href={`/dashboard/vehicles/${v.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-bold"
                    >
                      Editar
                    </Link>
                    {/* Aquí podrías agregar un botón de eliminar más adelante */}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}