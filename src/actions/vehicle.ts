"use server";

import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { VehicleSchema } from "@/schemas/vehicle";
import { auth } from "@/auth";
import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/services/cache.service";
import { registrarError } from "@/lib/log";

/**
 * Las opciones de los filtros del catálogo se calculan a partir del stock, así
 * que cualquier alta, edición o baja puede sumar o dejar sin uso una marca, una
 * transmisión, un combustible o un año.
 *
 * Se usa updateTag y no revalidateTag: el administrador acaba de guardar y
 * espera ver el cambio reflejado ya, sin la ventana de contenido viejo que
 * implica el stale-while-revalidate.
 */
function revalidarCatalogo() {
  updateTag(CACHE_TAGS.FILTROS);
  revalidatePath("/dashboard/vehicles");
  revalidatePath("/catalogo");
}

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

    revalidarCatalogo();
    return { success: "Vehículo creado con éxito" };
  } catch (error) {
    registrarError("createVehicle", error);
    return { error: "Error al crear el vehículo" };
  }
};

/**
 * Inventario completo, borradores incluidos: es información del panel.
 *
 * La comprobación va acá dentro y no solo en la página que la consume porque
 * toda función exportada de un archivo "use server" es un endpoint alcanzable
 * por sí mismo.
 */
export const getVehicles = async () => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return [];

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
    return vehicles.map(v => ({
      ...v,
      precio: Number(v.precio)
    }));
  } catch {
    return [];
  }
};

export const deleteVehicle = async (id: string) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "No autorizado" };

  try {
    await prisma.vehiculo.delete({ where: { id } });
    revalidarCatalogo();
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

    revalidarCatalogo();
    return { success: "Vehículo actualizado con éxito" };
  } catch (error) {
    registrarError("updateVehicle", error);
    return { error: "Error al actualizar el vehículo" };
  }
};

/**
 * Ficha de una unidad. La usa el catálogo público, así que un borrador solo se
 * devuelve si quien mira es el administrador: el listado ya filtraba por
 * publicación, pero entrar por la URL de la ficha esquivaba ese filtro.
 */
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

    if (!vehicle) return null;

    if (vehicle.publicacion !== "PUBLICADO") {
      const session = await auth();
      // Mismo null que un id inexistente: la página responde 404 y no confirma
      // que la unidad exista.
      if (session?.user?.role !== "ADMIN") return null;
    }

    return {
      ...vehicle,
      precio: Number(vehicle.precio)
    };
  } catch {
    return null;
  }
};