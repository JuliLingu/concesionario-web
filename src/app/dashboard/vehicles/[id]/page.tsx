import { prisma } from "@/lib/prisma";
import { VehicleForm } from "@/components/dashboard/VehicleForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface EditVehiclePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditVehiclePage({ params }: EditVehiclePageProps) {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/");
  }

  const resolvedParams = await params;

  const vehiculo = await prisma.vehiculo.findUnique({
    where: { id: resolvedParams.id },
    include: {
      imagenes: { orderBy: { orden: "asc" } },
      categoria: true,
    },
  });

  if (!vehiculo) {
    notFound();
  }

  const categorias = await prisma.categoria.findMany({
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  });

  // Serialize Decimal to number to avoid Next.js serialization error
  const initialData = {
    ...vehiculo,
    precio: Number(vehiculo.precio),
  };

  return (
    <div className="max-w-5xl mx-auto pt-32 pb-16 px-6 min-h-screen">
      <div className="mb-10">
        <Link
          href="/dashboard/vehicles"
          className="inline-flex items-center gap-2 text-sm font-bold text-foreground/50 hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Volver al Inventario
        </Link>
        <h1 className="text-4xl font-black text-foreground tracking-tight font-space">
          Editar Vehículo
        </h1>
        <p className="text-foreground/50 font-medium mt-1">
          {vehiculo.marca} {vehiculo.modelo} — {vehiculo.anio}
        </p>
      </div>
      <VehicleForm categorias={categorias} initialData={initialData} />
    </div>
  );
}
