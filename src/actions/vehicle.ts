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

  const { imagenes, ...data } = validatedFields.data;

  try {
    await prisma.vehiculo.create({
      data: {
        ...data,
        imagenes: {
          create: imagenes?.map((url, index) => ({
            url,
            esPrincipal: index === 0,
            orden: index,
          })),
        },
      },
    });

    revalidatePath("/dashboard/vehicles");
    revalidatePath("/catalogo");
    return { success: "Vehículo creado con éxito" };
  } catch (error) {
    console.error(error);
    return { error: "Error al crear el vehículo" };
  }
};

export const getVehicles = async () => {
  try {
    const vehicles = await prisma.vehiculo.findMany({
      include: {
        categoria: true,
        imagenes: {
          orderBy: { orden: "asc" }
        },
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
    revalidatePath("/catalogo");
    return { success: "Vehículo eliminado correctamente" };
  } catch {
    return { error: "Error al eliminar el vehículo" };
  }
};

export const updateVehicle = async (id: string, values: z.infer<typeof VehicleSchema>) => {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    return { error: "No autorizado" };
  }

  const validatedFields = VehicleSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Campos inválidos" };
  }

  const { imagenes, ...data } = validatedFields.data;

  try {
    await prisma.vehiculo.update({
      where: { id },
      data: {
        ...data,
        imagenes: {
          deleteMany: {},
          create: imagenes?.map((url, index) => ({
            url,
            esPrincipal: index === 0,
            orden: index,
          })),
        },
      },
    });

    revalidatePath("/dashboard/vehicles");
    revalidatePath("/catalogo");
    return { success: "Vehículo actualizado con éxito" };
  } catch (error) {
    console.error(error);
    return { error: "Error al actualizar el vehículo" };
  }
};

export const getVehicleById = async (id: string) => {
  try {
    const vehicle = await prisma.vehiculo.findUnique({
      where: { id },
      include: {
        categoria: true,
        imagenes: {
          orderBy: { orden: "asc" },
        },
      },
    });
    return vehicle;
  } catch {
    return null;
  }
};