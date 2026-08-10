"use client";

import Link from "next/link";
import { Plus, Pencil, ArrowLeft } from "lucide-react";
import { DeleteVehicleButton } from "@/components/dashboard/DeleteVehicleButton";
import { formatArs, formatPrecioOriginal, precioEnPesos } from "@/lib/precio";
import { Moneda } from "../../../../generated/prisma";

export const VehiclesClient = ({
  vehicles,
  publicados,
  borradores,
  cotizacionDolar,
}: any) => {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] pt-header pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 mb-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] text-sm font-medium transition"
          >
            <ArrowLeft size={16} /> Volver al Panel
          </Link>
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 mb-6 md:items-end justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--primary))] mb-1">
              Panel de Control
            </div>
            <h1 className="text-[2.5rem] font-bold tracking-tight mb-0.5 text-[hsl(var(--foreground))]">
              Inventario
            </h1>
            <p className="text-[hsl(var(--muted-foreground))] font-medium">
              {vehicles.length} unidades totales · {publicados} publicadas ·{" "}
              {borradores} en borrador
            </p>
          </div>
          <Link
            href="/dashboard/vehicles/new"
            className="inline-flex items-center gap-2 bg-[#b5000b] text-white px-6 py-3 text-[11px] font-black uppercase tracking-widest hover:bg-[#9a3412] transition rounded shadow-[0_20px_25px_-5px_rgba(181,0,11,0.25)] hover:scale-95"
          >
            <Plus size={15} />
            Agregar Vehículo
          </Link>
        </div>

        {/* Table */}
        <div className="bg-white rounded shadow-[0_20px_40px_rgba(26,28,30,0.06)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f3f3f6]">
                <tr className="border-b border-[#e5e7eb]">
                  <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
                    Vehículo
                  </th>
                  <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))] hidden md:table-cell">
                    Categoría
                  </th>
                  <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
                    Precio
                  </th>
                  <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
                    Visibilidad
                  </th>
                  <th className="text-right py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {vehicles.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-8 text-[hsl(var(--muted-foreground))] text-sm font-medium italic"
                    >
                      No hay vehículos cargados aún.
                    </td>
                  </tr>
                )}
                {vehicles.map((v: any) => (
                  <tr
                    key={v.id}
                    className="border-b border-[#e5e7eb]/50 hover:bg-[hsl(var(--surface-low))] transition"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-sm text-[hsl(var(--foreground))]">
                        {v.marca} {v.modelo}
                      </div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))] font-medium mt-0.5">
                        {v.anio} ·{" "}
                        {Number(v.kilometraje).toLocaleString("es-AR")} KM
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))] bg-[#f3f3f6] px-2 py-1 rounded inline-block">
                        {v.categoria.nombre}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-sm text-[hsl(var(--foreground))]">
                        {formatPrecioOriginal(Number(v.precio), v.moneda)}
                      </div>
                      {v.moneda === Moneda.USD && cotizacionDolar ? (
                        <div className="text-xs text-[hsl(var(--muted-foreground))] font-medium mt-0.5">
                          {formatArs(
                            precioEnPesos(
                              Number(v.precio),
                              v.moneda,
                              cotizacionDolar,
                            ) ?? 0,
                          )}{" "}
                          en vidriera
                        </div>
                      ) : null}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest inline-block px-2 py-1 rounded ${
                          v.publicacion === "PUBLICADO"
                            ? "bg-green-100 text-green-700"
                            : v.publicacion === "VENDIDO"
                              ? "bg-gray-100 text-gray-500"
                              : "bg-red-50 text-[hsl(var(--primary))]"
                        }`}
                      >
                        {v.publicacion}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/dashboard/vehicles/${v.id}`}
                          className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition"
                          title="Editar"
                        >
                          <Pencil size={16} />
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
    </div>
  );
};
