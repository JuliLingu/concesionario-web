import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/sesion";
import { getConfiguracion } from "@/services/configuracion.service";
import { DashboardView } from "./DashboardView";

export default async function DashboardPage() {
  const session = await requireAdmin();

  const [
    configuracion,
    totalVehiculos,
    publicados,
    borradores,
    consultasPendientes,
    rawUltimasConsultas,
  ] = await Promise.all([
    getConfiguracion(),
    prisma.vehiculo.count(),
    prisma.vehiculo.count({ where: { publicacion: "PUBLICADO" } }),
    prisma.vehiculo.count({ where: { publicacion: "BORRADOR"  } }),
    prisma.consulta.count({ where: { estado: "PENDIENTE" } }),
    prisma.consulta.findMany({
      where:   { estado: "PENDIENTE" },
      select:  {
        id: true,
        nombre: true,
        email: true,
        estado: true,
        createdAt: true,
        vehiculo: { select: { id: true, marca: true, modelo: true } },
      },
      orderBy: { createdAt: "desc" },
      take:    5,
    }),
  ]);

  // Las fechas no son serializables hacia un Client Component (el botón de
  // estado lo es), así que viajan como texto.
  const ultimasConsultas = rawUltimasConsultas.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <DashboardView
      userName={session.user?.name?.split(" ")[0] ?? "Admin"}
      nombreConcesionaria={configuracion.nombreConcesionaria}
      totalVehiculos={totalVehiculos}
      publicados={publicados}
      borradores={borradores}
      consultasPendientes={consultasPendientes}
      ultimasConsultas={ultimasConsultas}
    />
  );
}
