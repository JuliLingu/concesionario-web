import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { getSolicitudes } from "@/actions/financiacion";
import { EstadoConsulta } from "../../../../generated/prisma";
import { SolicitudesClient } from "./SolicitudesClient";
import { FEATURE_FINANCIACION } from "@/lib/features";

const TABS: { value: EstadoConsulta | "TODAS"; label: string }[] = [
  { value: "TODAS",      label: "Todas"      },
  { value: "PENDIENTE",  label: "Pendientes" },
  { value: "VISTA",      label: "Vistas"     },
  { value: "RESPONDIDA", label: "Respondidas"},
  { value: "CERRADA",    label: "Cerradas"   },
];

interface SolicitudesPageProps {
  searchParams: Promise<{ estado?: string }>;
}

export default async function SolicitudesPage({ searchParams }: SolicitudesPageProps) {
  // Financiación en stand by: las solicitudes guardadas siguen en la base, pero
  // la pantalla no es alcanzable.
  if (!FEATURE_FINANCIACION) notFound();

  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") redirect("/");

  const params   = await searchParams;
  const estadoRaw = params.estado as EstadoConsulta | undefined;
  const estadoValido = estadoRaw && Object.keys(EstadoConsulta).includes(estadoRaw)
    ? estadoRaw as EstadoConsulta
    : undefined;

  const rawSolicitudes = await getSolicitudes(estadoValido);
  const rawPendientes = await getSolicitudes("PENDIENTE");

  const solicitudes = rawSolicitudes.map(c => ({
    ...c,
    ingresos: c.ingresos?.toNumber() || 0,
    anticipo: c.anticipo.toNumber(),
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  const pendientes = rawPendientes.map(c => ({
    ...c,
    ingresos: c.ingresos?.toNumber() || 0,
    anticipo: c.anticipo.toNumber(),
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  return (
    <SolicitudesClient 
      solicitudes={solicitudes} 
      pendientes={pendientes} 
      TABS={TABS} 
      estadoValido={estadoValido} 
    />
  );
}
