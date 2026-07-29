"use client";

import Link from "next/link";
import { MessageSquare, ExternalLink } from "lucide-react";
import { SolicitudStatusButton } from "@/components/dashboard/SolicitudStatusButton";

export const SolicitudesClient = ({ solicitudes, pendientes, TABS, estadoValido }: any) => {

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("es-AR", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    }).format(new Date(date));

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(val);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="mb-6">
          <div className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--primary))] mb-1">
            Panel de Control
          </div>
          <h1 className="text-[2.5rem] font-bold tracking-tight mb-0.5 text-[hsl(var(--foreground))]">
            Solicitudes de Crédito
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-[hsl(var(--muted-foreground))] font-medium">
              {solicitudes.length} solicitud{solicitudes.length !== 1 ? "es" : ""}
            </span>
            {pendientes.length > 0 && (
              <span className="bg-[hsl(var(--primary))] text-white text-[9px] font-black px-2 py-1 rounded-full">
                {pendientes.length} pendiente{pendientes.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="inline-flex gap-1 mb-4 bg-white p-1 rounded border border-[#e5e7eb] shadow-sm">
          {TABS.map((tab: any) => {
            const isActive = tab.value === "TODAS" ? !estadoValido : estadoValido === tab.value;
            const href = tab.value === "TODAS" ? "/dashboard/solicitudes" : `/dashboard/solicitudes?estado=${tab.value}`;
            return (
              <Link
                key={tab.value}
                href={href}
                className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded transition ${
                  isActive 
                    ? "bg-[hsl(var(--foreground))] text-white" 
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[#f3f3f6]"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Table */}
        {solicitudes.length === 0 ? (
          <div className="py-10 text-center bg-white rounded shadow-[0_20px_40px_rgba(26,28,30,0.06)] flex flex-col items-center gap-2">
            <MessageSquare size={32} className="text-[hsl(var(--muted-foreground))] opacity-40" />
            <span className="text-[hsl(var(--muted-foreground))] font-medium text-sm">
              No hay solicitudes en esta categoría.
            </span>
          </div>
        ) : (
          <div className="bg-white rounded shadow-[0_20px_40px_rgba(26,28,30,0.06)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#f3f3f6]">
                  <tr className="border-b border-[#e5e7eb]">
                    <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Cliente / DNI</th>
                    <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))] hidden lg:table-cell">Vehículo</th>
                    <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Financiación</th>
                    <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))] hidden md:table-cell">Fecha</th>
                    <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.map((c: any) => (
                    <tr key={c.id} className="border-b border-[#e5e7eb]/50 hover:bg-[hsl(var(--surface-low))] transition align-top">
                      <td className="py-3 px-4">
                        <div className="font-bold text-sm text-[hsl(var(--foreground))]">{c.nombre} {c.apellido}</div>
                        <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">DNI: {c.dni}</div>
                        <Link href={`mailto:${c.email}`} className="text-xs font-medium text-[hsl(var(--primary))] hover:underline block mt-0.5">{c.email}</Link>
                        {c.telefono && (
                          <Link href={`tel:${c.telefono}`} className="text-xs font-medium text-[hsl(var(--muted-foreground))] hover:underline block mt-0.5">{c.telefono}</Link>
                        )}
                      </td>
                      <td className="py-3 px-4 hidden lg:table-cell">
                        {c.vehiculo ? (
                          <Link href={`/catalogo/${c.vehiculo.id}`} target="_blank" className="text-sm font-bold text-[hsl(var(--foreground))] flex items-center gap-1 hover:text-[hsl(var(--primary))]">
                            {c.vehiculo.marca} {c.vehiculo.modelo} {c.vehiculo.anio}
                            <ExternalLink size={11} className="opacity-40" />
                          </Link>
                        ) : (
                          <span className="text-sm text-[hsl(var(--muted-foreground))] italic">General</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-bold text-[hsl(var(--foreground))]">
                          {c.cuotas} Cuotas
                        </div>
                        <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                          Anticipo: {formatCurrency(c.anticipo)}
                        </div>
                        <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                          Ingresos: {c.ingresos ? formatCurrency(c.ingresos) : "No especificado"}
                        </div>
                        {c.mensaje && (
                          <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1 italic line-clamp-2">
                            "{c.mensaje}"
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium whitespace-nowrap">
                          {formatDate(c.createdAt)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <SolicitudStatusButton solicitudId={c.id} estadoActual={c.estado} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
