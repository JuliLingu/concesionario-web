import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Car, CheckCircle2, FileText, MessageSquare,
  Plus, LayoutList, ArrowRight, ExternalLink,
} from "lucide-react";
import { ConsultaStatusButton } from "@/components/dashboard/ConsultaStatusButton";

export default async function DashboardPage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/");
  }

  // ── Metrics ──────────────────────────────────────────────────────────────────
  const [totalVehiculos, publicados, borradores, consultasPendientes, ultimasConsultas] =
    await Promise.all([
      prisma.vehiculo.count(),
      prisma.vehiculo.count({ where: { publicacion: "PUBLICADO" } }),
      prisma.vehiculo.count({ where: { publicacion: "BORRADOR"  } }),
      prisma.consulta.count({ where: { estado: "PENDIENTE" } }),
      prisma.consulta.findMany({
        where:   { estado: "PENDIENTE" },
        include: { vehiculo: { select: { id: true, marca: true, modelo: true } } },
        orderBy: { createdAt: "desc" },
        take:    5,
      }),
    ]);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("es-AR", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
    }).format(new Date(date));

  const userName = session.user?.name?.split(" ")[0] ?? "Admin";

  return (
    <div className="min-h-screen bg-background pt-32 pb-16 px-6">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-12">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary block mb-2">
            Panel de Control
          </span>
          <h1 className="text-4xl font-black text-foreground tracking-tight font-space">
            Bienvenido, {userName}
          </h1>
          <p className="text-foreground/50 font-medium mt-1">
            Resumen de actividad de JBJ Automotores
          </p>
        </div>

        {/* ── Metric Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <MetricCard
            label="Total Vehículos"
            value={totalVehiculos}
            icon={<Car size={20} className="text-foreground/30" />}
            href="/dashboard/vehicles"
          />
          <MetricCard
            label="Publicados"
            value={publicados}
            icon={<CheckCircle2 size={20} className="text-green-500" />}
            href="/dashboard/vehicles"
            accent="green"
          />
          <MetricCard
            label="Borradores"
            value={borradores}
            icon={<FileText size={20} className="text-foreground/30" />}
            href="/dashboard/vehicles"
          />
          <MetricCard
            label="Consultas Pendientes"
            value={consultasPendientes}
            icon={<MessageSquare size={20} className="text-primary" />}
            href="/dashboard/consultas"
            accent={consultasPendientes > 0 ? "red" : undefined}
          />
        </div>

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <QuickAction
            href="/dashboard/vehicles/new"
            icon={<Plus size={18} />}
            label="Agregar Vehículo"
            description="Dar de alta una nueva unidad"
            primary
          />
          <QuickAction
            href="/dashboard/vehicles"
            icon={<LayoutList size={18} />}
            label="Ver Inventario"
            description="Gestionar y editar el stock"
          />
          <QuickAction
            href="/dashboard/consultas"
            icon={<MessageSquare size={18} />}
            label="Ver Consultas"
            description={consultasPendientes > 0 ? `${consultasPendientes} sin atender` : "Historial completo"}
            badge={consultasPendientes > 0 ? consultasPendientes : undefined}
          />
        </div>

        {/* ── Últimas Consultas Pendientes ── */}
        {ultimasConsultas.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-foreground tracking-tight font-space uppercase">
                Consultas Pendientes
              </h2>
              <Link
                href="/dashboard/consultas"
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1"
              >
                Ver todas <ArrowRight size={11} />
              </Link>
            </div>

            <div className="bg-surface-lowest shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-low">
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Cliente</th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hidden md:table-cell">Vehículo</th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hidden lg:table-cell">Fecha</th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimasConsultas.map((c) => (
                    <tr key={c.id} className="border-t border-foreground/[0.04] hover:bg-surface-low/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-black text-foreground text-sm">{c.nombre}</div>
                        <a href={`mailto:${c.email}`} className="text-xs text-primary hover:underline">{c.email}</a>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        {c.vehiculo ? (
                          <Link href={`/catalogo/${c.vehiculo.id}`} target="_blank" className="text-sm font-bold text-foreground hover:text-primary flex items-center gap-1">
                            {c.vehiculo.marca} {c.vehiculo.modelo}
                            <ExternalLink size={11} className="opacity-40" />
                          </Link>
                        ) : (
                          <span className="text-sm text-foreground/30 italic">General</span>
                        )}
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <span className="text-xs text-foreground/40 font-medium">{formatDate(c.createdAt)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <ConsultaStatusButton consultaId={c.id} estadoActual={c.estado} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {ultimasConsultas.length === 0 && (
          <div className="py-16 text-center bg-surface-lowest flex flex-col items-center gap-3">
            <CheckCircle2 size={32} className="text-green-500/40" />
            <p className="text-foreground/40 font-medium text-sm">
              No hay consultas pendientes. ¡Todo al día!
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

const MetricCard = ({
  label, value, icon, href, accent,
}: {
  label: string; value: number; icon: React.ReactNode;
  href: string; accent?: "green" | "red";
}) => (
  <Link href={href} className="bg-surface-lowest shadow-sm p-6 hover:shadow-premium transition-all group">
    <div className="flex items-start justify-between mb-4">
      {icon}
      <ArrowRight size={14} className="text-foreground/20 group-hover:text-primary transition-colors" />
    </div>
    <div className={`text-3xl font-black tracking-tighter mb-1 ${
      accent === "red" ? "text-primary" :
      accent === "green" ? "text-green-600" :
      "text-foreground"
    }`}>
      {value}
    </div>
    <div className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{label}</div>
  </Link>
);

const QuickAction = ({
  href, icon, label, description, primary, badge,
}: {
  href: string; icon: React.ReactNode; label: string;
  description: string; primary?: boolean; badge?: number;
}) => (
  <Link
    href={href}
    className={`relative flex items-center gap-4 p-5 transition-all group ${
      primary
        ? "bg-foreground text-white hover:bg-primary"
        : "bg-surface-lowest shadow-sm hover:shadow-premium"
    }`}
  >
    <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 ${
      primary ? "bg-white/10" : "bg-surface-low"
    }`}>
      <span className={primary ? "text-white" : "text-foreground/50 group-hover:text-primary transition-colors"}>
        {icon}
      </span>
    </div>
    <div>
      <div className={`text-sm font-black ${primary ? "text-white" : "text-foreground"}`}>{label}</div>
      <div className={`text-xs font-medium ${primary ? "text-white/60" : "text-foreground/40"}`}>{description}</div>
    </div>
    {badge && (
      <span className="absolute top-3 right-3 w-5 h-5 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center">
        {badge}
      </span>
    )}
  </Link>
);