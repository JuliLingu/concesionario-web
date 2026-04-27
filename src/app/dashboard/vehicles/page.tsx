import { getVehicles } from "@/actions/vehicle";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DeleteVehicleButton } from "@/components/dashboard/DeleteVehicleButton";
import { Plus, Pencil } from "lucide-react";

export default async function VehiclesAdminPage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/");
  }

  const vehicles = await getVehicles();

  const publicados = vehicles.filter((v) => v.publicacion === "PUBLICADO").length;
  const borradores = vehicles.filter((v) => v.publicacion === "BORRADOR").length;

  return (
    <div className="min-h-screen bg-background pt-32 pb-16 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary block mb-2">
              Panel de Control
            </span>
            <h1 className="text-4xl font-black text-foreground tracking-tight font-space">
              Inventario
            </h1>
            <p className="text-foreground/50 font-medium mt-1">
              {vehicles.length} unidades totales · {publicados} publicadas · {borradores} en borrador
            </p>
          </div>
          <Link
            href="/dashboard/vehicles/new"
            className="inline-flex items-center gap-2 bg-racing text-white px-6 py-3 text-[11px] font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-primary/25 self-start md:self-auto"
          >
            <Plus size={15} />
            Agregar Vehículo
          </Link>
        </div>

        {/* Table */}
        <div className="bg-surface-lowest shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-low">
                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                  Vehículo
                </th>
                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hidden md:table-cell">
                  Categoría
                </th>
                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                  Precio
                </th>
                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                  Visibilidad
                </th>
                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-foreground/40 text-sm font-medium italic">
                    No hay vehículos cargados aún.
                  </td>
                </tr>
              )}
              {vehicles.map((v) => (
                <tr
                  key={v.id}
                  className="border-t border-foreground/[0.04] hover:bg-surface-low/50 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="font-black text-foreground text-sm">
                      {v.marca} {v.modelo}
                    </div>
                    <div className="text-xs text-foreground/40 font-medium mt-0.5">
                      {v.anio} · {v.kilometraje.toLocaleString("es-AR")} KM
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60 bg-surface-low px-2 py-1">
                      {v.categoria.nombre}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-black text-foreground">
                      {v.moneda} ${Number(v.precio).toLocaleString("es-AR")}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 ${
                        v.publicacion === "PUBLICADO"
                          ? "bg-green-500/10 text-green-700"
                          : v.publicacion === "VENDIDO"
                          ? "bg-foreground/10 text-foreground/60"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {v.publicacion}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/dashboard/vehicles/${v.id}`}
                        className="text-foreground/60 hover:text-primary transition-colors flex items-center gap-1 text-sm font-bold"
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </Link>
                      <DeleteVehicleButton
                        vehicleId={v.id}
                        vehicleName={`${v.marca} ${v.modelo} ${v.anio}`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}