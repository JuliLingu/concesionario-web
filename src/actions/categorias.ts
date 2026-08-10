"use server";

import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const CategoriaSchema = z.object({
  nombre: z.string().min(1, "El nombre de la categoría es obligatorio"),
});

export const createCategoria = async (values: z.infer<typeof CategoriaSchema>) => {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    return { error: "No autorizado" };
  }

  const validatedFields = CategoriaSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Campos inválidos" };
  }

  const { nombre } = validatedFields.data;
  
  // Generar slug
  const slug = nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remover acentos
    .replace(/[^a-z0-9]+/g, "-") // reemplazar espacios y especiales por guiones
    .replace(/(^-|-$)+/g, ""); // remover guiones al inicio o final

  try {
    const existing = await prisma.categoria.findUnique({
      where: { slug }
    });
    
    if (existing) {
      return { error: "Ya existe una categoría con este nombre" };
    }

    await prisma.categoria.create({
      data: {
        nombre,
        slug
      },
    });

    revalidatePath("/dashboard/categorias");
    revalidatePath("/dashboard/vehicles/new");
    revalidatePath("/catalogo");
    return { success: "Categoría creada con éxito" };
  } catch (error) {
    console.error(error);
    return { error: "Error al crear la categoría" };
  }
};

export const getCategorias = async () => {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: {
        nombre: "asc",
      },
      include: {
        _count: {
          select: { vehiculos: true }
        }
      }
    });
    return categorias;
  } catch {
    return [];
  }
};

export const deleteCategoria = async (id: string) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "No autorizado" };

  try {
    const vehiculosCount = await prisma.vehiculo.count({
      where: { categoriaId: id }
    });

    if (vehiculosCount > 0) {
      return { error: "No se puede eliminar la categoría porque hay vehículos asociados a ella" };
    }

    await prisma.categoria.delete({ where: { id } });
    revalidatePath("/dashboard/categorias");
    revalidatePath("/dashboard/vehicles/new");
    revalidatePath("/catalogo");
    return { success: "Categoría eliminada correctamente" };
  } catch {
    return { error: "Error al eliminar la categoría" };
  }
};
