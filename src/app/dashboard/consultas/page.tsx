import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getConsultas } from "@/actions/consulta";
import { ConsultaStatusButton } from "@/components/dashboard/ConsultaStatusButton";
import { EstadoConsulta } from "../../../../generated/prisma";
import Link from "next/link";
import { MessageSquare, ExternalLink } from "lucide-react";

const TABS: { value: EstadoConsulta | "TODAS"; label: string }[] = [
  { value: "TODAS",      label: "Todas"      },
  { value: "PENDIENTE",  label: "Pendientes" },
  { value: "VISTA",      label: "Vistas"     },
  { value: "RESPONDIDA", label: "Respondidas"},
  { value: "CERRADA",    label: "Cerradas"   },
];

interface ConsultasPageProps {
  searchParams: Promise<{ estado?: string }>;
}

export default async function ConsultasPage({ searchParams }: ConsultasPageProps) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") redirect("/");

  const params   = await searchParams;
  const estadoRaw = params.estado as EstadoConsulta | undefined;
  const estadoValido = estadoRaw && Object.keys(EstadoConsulta).includes(estadoRaw)
    ? estadoRaw as EstadoConsulta
    : undefined;

  const consultas = await getConsultas(estadoValido);
  const pendientes = await getConsultas("PENDIENTE");

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("es-AR", {
      day:   "2-digit",
      month: "short",
      year:  "numeric",
      hour:  "2-digit",
      minute:"2-digit",
    }).format(new Date(date));

  return (
    <div className="min-h-screen bg-background pt-32 pb-16 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary block mb-2">
            Panel de Control
          </span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-foreground tracking-tight font-space">
                Consultas
              </h1>
              <p className="text-foreground/50 font-medium mt-1">
                {consultas.length} consulta{consultas.length !== 1 ? "s" : ""}
                {pendientes.length > 0 && (
                  <span className="ml-2 bg-primary text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                    {pendientes.length} pendiente{pendientes.length !== 1 ? "s" : ""}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs de estado */}
        <div className="flex gap-1 mb-8 bg-surface-lowest shadow-sm p-1 w-fit">
          {TABS.map((tab) => {
            const isActive =
              tab.value === "TODAS" ? !estadoValido : estadoValido === tab.value;
            const href =
              tab.value === "TODAS"
                ? "/dashboard/consultas"
                : `/dashboard/consultas?estado=${tab.value}`;
            return (
              <Link
                key={tab.value}
                href={href}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                  isActive
                    ? "bg-foreground text-white"
                    : "text-foreground/40 hover:text-foreground"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Tabla */}
        {consultas.length === 0 ? (
          <div className="py-20 text-center bg-surface-lowest flex flex-col items-center gap-4">
            <MessageSquare size={32} className="text-foreground/20" />
            <p className="text-foreground/40 font-medium text-sm">
              No hay consultas en esta categoría.
            </p>
          </div>
        ) : (
          <div className="bg-surface-lowest shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-low">
                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                    Cliente
                  </th>
                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hidden lg:table-cell">
                    Vehículo
                  </th>
                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hidden md:table-cell">
                    Mensaje
                  </th>
                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hidden md:table-cell">
                    Fecha
                  </th>
                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {consultas.map((c) => (
                  <tr
                    key={c.id}
                    className="border-t border-foreground/[0.04] hover:bg-surface-low/50 transition-colors align-top"
                  >
                    {/* Cliente */}
                    <td className="px-5 py-4">
                      <div className="font-black text-foreground text-sm">{c.nombre}</div>
                      <a
                        href={`mailto:${c.email}`}
                        className="text-xs text-primary hover:underline font-medium block mt-0.5"
                      >
                        {c.email}
                      </a>
                      {c.telefono && (
                        <a
                          href={`tel:${c.telefono}`}
                          className="text-xs text-foreground/40 font-medium block mt-0.5"
                        >
                          {c.telefono}
                        </a>
                      )}
                    </td>

                    {/* Vehículo */}
                    <td className="px-5 py-4 hidden lg:table-cell">
                      {c.vehiculo ? (
                        <Link
                          href={`/catalogo/${c.vehiculo.id}`}
                          target="_blank"
                          className="flex items-center gap-1 text-sm font-bold text-foreground hover:text-primary transition-colors"
                        >
                          {c.vehiculo.marca} {c.vehiculo.modelo} {c.vehiculo.anio}
                          <ExternalLink size={11} className="opacity-40" />
                        </Link>
                      ) : (
                        <span className="text-sm text-foreground/30 italic">General</span>
                      )}
                    </td>

                    {/* Mensaje */}
                    <td className="px-5 py-4 hidden md:table-cell max-w-[260px]">
                      <p className="text-sm text-foreground/60 font-medium line-clamp-2">
                        {c.mensaje || <span className="italic text-foreground/30">Sin mensaje</span>}
                      </p>
                    </td>

                    {/* Fecha */}
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-xs text-foreground/40 font-medium whitespace-nowrap">
                        {formatDate(c.createdAt)}
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="px-5 py-4">
                      <ConsultaStatusButton
                        consultaId={c.id}
                        estadoActual={c.estado}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
