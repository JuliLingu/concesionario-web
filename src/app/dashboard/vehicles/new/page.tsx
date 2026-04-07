import { prisma } from "@/lib/prisma";
import { VehicleForm } from "@/components/dashboard/VehicleForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function NewVehiclePage() {
  const session = await auth();

  // Solo administradores pueden acceder
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Obtenemos las categorías dinámicamente para el formulario
  const categorias = await prisma.categoria.findMany({
    select: {
      id: true,
      nombre: true,
    },
    orderBy: {
      nombre: "asc",
    }
  });

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Nuevo Vehículo</h1>
        <p className="text-gray-500 font-medium">Completa la información técnica para dar de alta el auto en el catálogo.</p>
      </div>
      <VehicleForm categorias={categorias} />
    </div>
  );
}