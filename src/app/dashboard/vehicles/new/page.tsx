import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { NewVehicleClient } from "./NewVehicleClient";

export default async function NewVehiclePage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/");
  }

  const categorias = await prisma.categoria.findMany({
    select:  { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  });

  return <NewVehicleClient categorias={categorias} />;
}