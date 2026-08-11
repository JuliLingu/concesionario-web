import { prisma } from "@/lib/prisma";
import { VehicleForm } from "@/components/dashboard/VehicleForm";
import { requireAdmin } from "@/lib/sesion";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCachedCategorias } from "@/services/cache.service";
import { getConfiguracion } from "@/services/configuracion.service";

interface EditVehiclePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditVehiclePage({ params }: EditVehiclePageProps) {
  await requireAdmin();

  const { id } = await params;

  const [vehiculo, categorias, configuracion] = await Promise.all([
    prisma.vehiculo.findUnique({
      where: { id },
      include: {
        imagenes: { orderBy: { orden: "asc" } },
        categoria: true,
      },
    }),
    getCachedCategorias(),
    getConfiguracion(),
  ]);

  if (!vehiculo) {
    notFound();
  }

  // Los Decimal de Prisma no son serializables hacia el formulario, que es de cliente.
  const initialData = {
    ...vehiculo,
    precio: Number(vehiculo.precio),
  };

  return (
    <div className="max-w-5xl mx-auto pt-header pb-16 px-6 min-h-screen">
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
      <VehicleForm
        categorias={categorias}
        initialData={initialData}
        cotizacionDolar={configuracion.cotizacionDolar}
      />
    </div>
  );
}
