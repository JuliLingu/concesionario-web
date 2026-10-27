"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { registrarError } from "@/lib/log";
import { NotaContactoSchema, type NotaContactoInput } from "@/schemas/contacto";

/**
 * Agrega una nota interna a un contacto. Solo administradores: toda función
 * exportada de un archivo "use server" es un endpoint alcanzable por sí mismo,
 * así que el control va acá adentro y no solo en la página.
 *
 * No hay editar ni borrar a propósito: las notas son el registro de lo que se
 * habló con un cliente, y uno que se puede reescribir deja de servir como tal.
 */
export const agregarNota = async (values: NotaContactoInput) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "No autorizado" };

  const validated = NotaContactoSchema.safeParse(values);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Nota inválida" };
  }

  const { contactoId, texto } = validated.data;

  try {
    // Sin claves foráneas en la base (`relationMode = "prisma"`): nada impide
    // colgar una nota de un id inventado, así que se comprueba antes.
    const existe = await prisma.contacto.findUnique({ where: { id: contactoId }, select: { id: true } });
    if (!existe) return { error: "El contacto ya no existe" };

    await prisma.notaContacto.create({
      data: { contactoId, texto, autor: session.user.name ?? null },
    });

    revalidatePath(`/dashboard/contactos/${contactoId}`);
    return { success: true };
  } catch (error) {
    registrarError("agregarNota", error);
    return { error: "No se pudo guardar la nota" };
  }
};
