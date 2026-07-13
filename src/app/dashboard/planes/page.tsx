import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getPlanes } from "@/actions/financiacion";
import { PlanesClient } from "./PlanesClient";

export default async function PlanesPage() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") redirect("/");

  const rawPlanes = await getPlanes(true);
  
  const planes = rawPlanes.map(p => ({
    ...p,
    tasaAnual: p.tasaAnual.toNumber(),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return <PlanesClient planes={planes} />;
}
