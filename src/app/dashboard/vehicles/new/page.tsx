import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { NewVehicleClient } from "./NewVehicleClient";
import { getConfiguracion } from "@/services/configuracion.service";

export default async function NewVehiclePage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/");
  }

  const [categorias, configuracion] = await Promise.all([
    prisma.categoria.findMany({
      select:  { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    }),
    getConfiguracion(),
  ]);

  return <NewVehicleClient categorias={categorias} cotizacionDolar={configuracion.cotizacionDolar} />;
}