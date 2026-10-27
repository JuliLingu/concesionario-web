import { redirect } from "next/navigation";
import { estadoDeUrl } from "@/lib/estados";

interface PageProps {
  searchParams: Promise<{ estado?: string }>;
}

/**
 * La pantalla de consultas pasó a la bandeja unificada (`/dashboard/bandeja`). La ruta
 * queda para que los enlaces viejos —avisos por correo ya enviados, marcadores
 * del navegador— sigan llevando al mismo lugar, con el filtro de estado.
 */
export default async function Page({ searchParams }: PageProps) {
  const estado = estadoDeUrl((await searchParams).estado);
  redirect(`/dashboard/bandeja?tipo=CONSULTA${estado ? `&estado=${estado}` : ""}`);
}
