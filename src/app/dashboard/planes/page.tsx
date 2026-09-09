import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/sesion";
import { getPlanes } from "@/actions/financiacion";
import { PlanesClient } from "./PlanesClient";
import { getConfiguracion } from "@/services/configuracion.service";

export default async function PlanesPage() {
  // Financiación apagada desde Configuración: la pantalla existe pero no es
  // alcanzable.
  if (!(await getConfiguracion()).financiacionActiva) notFound();

  await requireAdmin();

  const rawPlanes = await getPlanes(true);
  
  const planes = rawPlanes.map(p => ({
    ...p,
    tasaAnual: p.tasaAnual.toNumber(),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return <PlanesClient planes={planes} />;
}
