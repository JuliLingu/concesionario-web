import { prisma } from "@/lib/prisma";
import { VehicleForm } from "@/components/dashboard/VehicleForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function NewVehiclePage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/");
  }

  const categorias = await prisma.categoria.findMany({
    select:  { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  });

  return (
    <div className="max-w-5xl mx-auto pt-32 pb-16 px-6 min-h-screen">
      <div className="mb-10">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary block mb-2">
          Panel de Control
        </span>
        <h1 className="text-4xl font-black text-foreground tracking-tight font-space">
          Nuevo Vehículo
        </h1>
        <p className="text-foreground/50 font-medium mt-1">
          Completá la información técnica para dar de alta el auto en el catálogo.
        </p>
      </div>
      <VehicleForm categorias={categorias} />
    </div>
  );
}