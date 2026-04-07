"use server";

import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { VehicleSchema } from "@/schemas/vehicle";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export const createVehicle = async (values: z.infer<typeof VehicleSchema>) => {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    return { error: "No autorizado" };
  }

  const validatedFields = VehicleSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Campos inválidos" };
  }

  try {
    await prisma.vehiculo.create({
      data: {
        ...validatedFields.data,
      },
    });

    revalidatePath("/dashboard/vehicles");
    return { success: "Vehículo creado con éxito" };
  } catch (error) {
    return { error: "Error al crear el vehículo" };
  }
};

export const getVehicles = async () => {
  try {
    const vehicles = await prisma.vehiculo.findMany({
      include: {
        categoria: true,
        imagenes: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return vehicles;
  } catch {
    return [];
  }
};

export const deleteVehicle = async (id: string) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "No autorizado" };

  try {
    await prisma.vehiculo.delete({ where: { id } });
    revalidatePath("/dashboard/vehicles");
    return { success: "Vehículo eliminado correctamente" };
  } catch {
    return { error: "Error al eliminar el vehículo" };
  }
};