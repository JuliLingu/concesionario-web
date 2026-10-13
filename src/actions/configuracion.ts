"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/services/cache.service";
import { ConfiguracionSchema } from "@/schemas/configuracion";
import { registrarError } from "@/lib/log";

// `values` llega sin tipar a propósito: es la entrada de una server action, o
// sea un límite de confianza. La forma la garantiza Zod, no el compilador.
export async function updateConfiguracion(values: unknown) {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    return { success: false, error: "No autorizado" };
  }

  const validatedFields = ConfiguracionSchema.safeParse(values);

  if (!validatedFields.success) {
    const primerError = validatedFields.error.issues[0];
    return {
      success: false,
      error: primerError?.message ?? "Campos inválidos",
    };
  }

  const data = validatedFields.data;

  try {
    await prisma.configuracion.upsert({
      where: { id: "1" },
      update: data,
      create: { id: "1", ...data },
    });

    // Invalida la lectura cacheada del service...
    revalidateTag(CACHE_TAGS.CONFIGURACION, "max");
    // ...y el render de todas las rutas, ya que la config afecta al layout.
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    registrarError("updateConfiguracion", error);
    return { success: false, error: "Error al actualizar la configuración." };
  }
}
