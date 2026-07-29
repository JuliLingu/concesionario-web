"use client";

import Link from "next/link";
import { Car, CheckCircle2, FileText, MessageSquare, Plus, LayoutList, ArrowRight, ExternalLink, Tags, Wallet, CreditCard } from "lucide-react";
import { ConsultaStatusButton } from "@/components/dashboard/ConsultaStatusButton";

export const DashboardClient = ({
  userName,
  totalVehiculos,
  publicados,
  borradores,
  consultasPendientes,
  ultimasConsultas
}: any) => {

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("es-AR", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
    }).format(new Date(date));

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* ── Header ── */}
        <div className="mb-6">
          <div className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--primary))] mb-1">
            Panel de Control
          </div>
          <h1 className="text-[2.5rem] font-bold tracking-tight mb-0.5 text-[hsl(var(--foreground))]">
            Bienvenido, {userName}
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] font-medium">
            Resumen de actividad de JBJ Automotores
          </p>
        </div>

        {/* ── Metric Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard label="Total Vehículos" value={totalVehiculos} icon={<Car size={20} />} href="/dashboard/vehicles" />
          <MetricCard label="Publicados" value={publicados} icon={<CheckCircle2 size={20} />} href="/dashboard/vehicles" accent="green" />
          <MetricCard label="Borradores" value={borradores} icon={<FileText size={20} />} href="/dashboard/vehicles" />
          <MetricCard label="Consultas Pendientes" value={consultasPendientes} icon={<MessageSquare size={20} />} href="/dashboard/consultas" accent={consultasPendientes > 0 ? "primary" : undefined} />
        </div>

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-4 lg:col-span-1">
            <QuickAction href="/dashboard/vehicles/new" icon={<Plus size={18} />} label="Agregar Vehículo" description="Dar de alta una nueva unidad" primary />
          </div>
          <div className="md:col-span-4 lg:col-span-1">
            <QuickAction href="/dashboard/vehicles" icon={<LayoutList size={18} />} label="Ver Inventario" description="Gestionar y editar el stock" />
          </div>
          <div className="md:col-span-4 lg:col-span-1">
            <QuickAction href="/dashboard/categorias" icon={<Tags size={18} />} label="Categorías" description="Administrar tipos de vehículos" />
          </div>
          <div className="md:col-span-6 lg:col-span-1">
            <QuickAction href="/dashboard/consultas" icon={<MessageSquare size={18} />} label="Ver Consultas" description={consultasPendientes > 0 ? `${consultasPendientes} sin atender` : "Historial completo"} badge={consultasPendientes > 0 ? consultasPendientes : undefined} />
          </div>
          <div className="md:col-span-6 lg:col-span-1">
            <QuickAction href="/dashboard/solicitudes" icon={<Wallet size={18} />} label="Solicitudes Crédito" description="Ver pedidos de financiación" />
          </div>
          <div className="md:col-span-6 lg:col-span-1">
            <QuickAction href="/dashboard/planes" icon={<CreditCard size={18} />} label="Planes Financiación" description="Configurar tasas y cuotas" />
          </div>
          <div className="md:col-span-6 lg:col-span-1">
            <QuickAction href="/dashboard/settings" icon={<ExternalLink size={18} />} label="Configuración" description="Ajustes generales del sitio" />
          </div>
        </div>

        {/* ── Últimas Consultas Pendientes ── */}
        {ultimasConsultas.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold uppercase tracking-tight text-[hsl(var(--foreground))]">
                Consultas Pendientes
              </h2>
              <Link href="/dashboard/consultas" className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--primary))] flex items-center gap-1 hover:underline">
                Ver todas <ArrowRight size={11} />
              </Link>
            </div>

            <div className="bg-white rounded shadow-[0_20px_40px_rgba(26,28,30,0.06)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#f3f3f6]">
                    <tr className="border-b border-[#e5e7eb]">
                      <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Cliente</th>
                      <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))] hidden md:table-cell">Vehículo</th>
                      <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))] hidden lg:table-cell">Fecha</th>
                      <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ultimasConsultas.map((c: any) => (
                      <tr key={c.id} className="border-b border-[#e5e7eb]/50 hover:bg-[hsl(var(--surface-low))] transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-sm text-[hsl(var(--foreground))]">{c.nombre}</div>
                          <Link href={`mailto:${c.email}`} className="text-xs text-[hsl(var(--primary))] hover:underline">{c.email}</Link>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          {c.vehiculo ? (
                            <Link href={`/catalogo/${c.vehiculo.id}`} target="_blank" className="text-sm font-bold text-[hsl(var(--foreground))] flex items-center gap-1 hover:text-[hsl(var(--primary))]">
                              {c.vehiculo.marca} {c.vehiculo.modelo}
                              <ExternalLink size={11} className="opacity-40" />
                            </Link>
                          ) : (
                            <span className="text-sm text-[hsl(var(--muted-foreground))] italic">General</span>
                          )}
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium">{formatDate(c.createdAt)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <ConsultaStatusButton consultaId={c.id} estadoActual={c.estado} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {ultimasConsultas.length === 0 && (
          <div className="py-8 text-center bg-white rounded shadow-[0_20px_40px_rgba(26,28,30,0.06)] flex flex-col items-center gap-2">
            <CheckCircle2 size={32} className="text-green-500 opacity-40" />
            <span className="text-[hsl(var(--muted-foreground))] font-medium text-sm">
              No hay consultas pendientes. ¡Todo al día!
            </span>
          </div>
        )}

      </div>
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const MetricCard = ({ label, value, icon, href, accent }: any) => {
  const iconColor = accent === "primary" ? "text-[hsl(var(--primary))]" : accent === "green" ? "text-green-600" : "text-[hsl(var(--muted-foreground))]";
  const textColor = accent === "primary" ? "text-[hsl(var(--primary))]" : accent === "green" ? "text-green-600" : "text-[hsl(var(--foreground))]";

  return (
    <Link href={href} className="block bg-white p-6 rounded shadow-[0_20px_40px_rgba(26,28,30,0.06)] transition hover:-translate-y-1 hover:shadow-2xl">
      <div className={`flex items-start justify-between mb-4 ${iconColor}`}>
        {icon}
        <ArrowRight size={14} className="opacity-50" />
      </div>
      <div className={`text-4xl font-black tracking-tight leading-none mb-2 ${textColor}`}>
        {value}
      </div>
      <div className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
        {label}
      </div>
    </Link>
  );
};

const QuickAction = ({ href, icon, label, description, primary, badge }: any) => (
  <Link href={href} className={`relative flex items-center gap-4 p-5 rounded transition ${primary ? 'bg-[#b5000b] hover:bg-[#9a3412]' : 'bg-white hover:bg-[hsl(var(--surface-low))] shadow-[0_20px_40px_rgba(26,28,30,0.06)]'}`}>
    <div className={`w-10 h-10 flex items-center justify-center shrink-0 rounded ${primary ? 'bg-white/10 text-white' : 'bg-[hsl(var(--foreground))] text-[hsl(var(--muted-foreground))]'}`}>
      {icon}
    </div>
    <div>
      <div className={`text-sm font-black ${primary ? 'text-white' : 'text-[hsl(var(--foreground))]'}`}>{label}</div>
      <div className={`text-xs font-medium ${primary ? 'text-white/60' : 'text-[hsl(var(--muted-foreground))]'}`}>{description}</div>
    </div>
    {badge && (
      <div className="absolute top-3 right-3 w-5 h-5 bg-[hsl(var(--primary))] text-white text-[9px] font-black rounded-full flex items-center justify-center">
        {badge}
      </div>
    )}
  </Link>
);
