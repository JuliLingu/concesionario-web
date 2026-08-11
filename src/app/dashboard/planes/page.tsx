import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/sesion";
import { getPlanes } from "@/actions/financiacion";
import { PlanesClient } from "./PlanesClient";
import { FEATURE_FINANCIACION } from "@/lib/features";

export default async function PlanesPage() {
  // Financiación en stand by: la pantalla existe pero no es alcanzable.
  if (!FEATURE_FINANCIACION) notFound();

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
