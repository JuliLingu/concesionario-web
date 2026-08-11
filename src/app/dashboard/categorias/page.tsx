import { requireAdmin } from "@/lib/sesion";
import { getCategorias } from "@/actions/categorias";
import { CategoriasClient } from "./CategoriasClient";

export default async function CategoriasPage() {
  await requireAdmin();

  const categorias = await getCategorias();

  return <CategoriasClient initialCategorias={categorias} />;
}
