import { prisma } from "@/lib/prisma";
import { RecentVehiclesUI } from "./RecentVehiclesUI";

export async function RecentVehicles({
  cotizacionDolar,
  mostrarPrecios,
}: {
  cotizacionDolar?: number | null;
  /** Precios a la vista, según Configuración. */
  mostrarPrecios?: boolean;
}) {
  const rawVehicles = await prisma.vehiculo.findMany({
    // Sin este filtro la portada mostraba también los borradores, que son
    // unidades que el administrador todavía no publicó.
    where: { publicacion: "PUBLICADO" },
    take: 3,
    orderBy: { createdAt: "desc" },
    include: {
      // Solo una foto: la tarjeta muestra la principal, no la galería. El
      // orden reproduce su misma preferencia (principal, si no la primera),
      // así que una unidad vieja sin principal marcada tampoco queda sin foto.
      imagenes: { orderBy: [{ esPrincipal: "desc" }, { orden: "asc" }], take: 1 },
    },
  });

  const recentVehicles = rawVehicles.map((v) => ({
    ...v,
    precio: Number(v.precio),
  }));

  return (
    <RecentVehiclesUI
      vehicles={recentVehicles}
      cotizacionDolar={cotizacionDolar}
      mostrarPrecios={mostrarPrecios}
    />
  );
}
