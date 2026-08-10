import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/");
  }

  const [totalVehiculos, publicados, borradores, consultasPendientes, rawUltimasConsultas] =
    await Promise.all([
      prisma.vehiculo.count(),
      prisma.vehiculo.count({ where: { publicacion: "PUBLICADO" } }),
      prisma.vehiculo.count({ where: { publicacion: "BORRADOR"  } }),
      prisma.consulta.count({ where: { estado: "PENDIENTE" } }),
      prisma.consulta.findMany({
        where:   { estado: "PENDIENTE" },
        include: { vehiculo: { select: { id: true, marca: true, modelo: true } } },
        orderBy: { createdAt: "desc" },
        take:    5,
      }),
    ]);

  const ultimasConsultas = rawUltimasConsultas.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  const userName = session.user?.name?.split(" ")[0] ?? "Admin";

  return (
    <DashboardClient 
      userName={userName}
      totalVehiculos={totalVehiculos}
      publicados={publicados}
      borradores={borradores}
      consultasPendientes={consultasPendientes}
      ultimasConsultas={ultimasConsultas}
    />
  );
}