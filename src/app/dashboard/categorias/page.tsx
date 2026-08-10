import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCategorias } from "@/actions/categorias";
import { CategoriasClient } from "./CategoriasClient";

export default async function CategoriasPage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/");
  }

  const categorias = await getCategorias();

  return <CategoriasClient initialCategorias={categorias} />;
}
