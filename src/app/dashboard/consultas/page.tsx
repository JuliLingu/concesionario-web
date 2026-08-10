import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getConsultas } from "@/actions/consulta";
import { EstadoConsulta } from "../../../../generated/prisma";
import { ConsultasClient } from "./ConsultasClient";

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

  const rawConsultas = await getConsultas(estadoValido);
  const rawPendientes = await getConsultas("PENDIENTE");

  const consultas = rawConsultas.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  const pendientes = rawPendientes.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  return (
    <ConsultasClient 
      consultas={consultas} 
      pendientes={pendientes} 
      TABS={TABS} 
      estadoValido={estadoValido} 
    />
  );
}
