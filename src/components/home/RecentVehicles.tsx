import { prisma } from "@/lib/prisma";
import { RecentVehiclesUI } from "./RecentVehiclesUI";

export async function RecentVehicles() {
  const rawVehicles = await prisma.vehiculo.findMany({
    take: 3,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      imagenes: true,
      categoria: true,
    }
  });

  const recentVehicles = rawVehicles.map((v) => ({
    ...v,
    precio: Number(v.precio),
  }));

  return <RecentVehiclesUI vehicles={recentVehicles} />;
}
