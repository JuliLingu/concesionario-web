import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/sesion";
import { getConfiguracion } from "@/services/configuracion.service";
import { getRendimientoStock } from "@/services/metricas.service";
import { DashboardView } from "./DashboardView";

export default async function DashboardPage() {
  const session = await requireAdmin();

  const [
    configuracion,
    rendimiento,
    totalVehiculos,
    publicados,
    borradores,
    consultasPendientes,
    tasacionesPendientes,
    rawUltimasConsultas,
  ] = await Promise.all([
    getConfiguracion(),
    // El mismo cálculo que la página de métricas, para que el número del atajo y
    // el de la tabla no puedan contradecirse.
    getRendimientoStock(),
    prisma.vehiculo.count(),
    prisma.vehiculo.count({ where: { publicacion: "PUBLICADO" } }),
    prisma.vehiculo.count({ where: { publicacion: "BORRADOR"  } }),
    prisma.consulta.count({ where: { estado: "PENDIENTE" } }),
    prisma.tasacion.count({ where: { estado: "PENDIENTE" } }),
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
      tasacionesPendientes={tasacionesPendientes}
      unidadesConSenal={
        rendimiento.resumen.inmovilizadas +
        rendimiento.resumen.caras +
        rendimiento.resumen.invisibles
      }
      diasPromedioEnStock={rendimiento.resumen.diasPromedioEnStock}
      ultimasConsultas={ultimasConsultas}
      financiacionActiva={configuracion.financiacionActiva}
      tasacionActiva={configuracion.tasacionActiva}
    />
  );
}
