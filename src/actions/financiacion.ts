"use server";

import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { PlanFinanciacionSchema, SolicitudFinanciacionSchema } from "@/schemas/financiacion";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { EstadoConsulta } from "../../generated/prisma";

// ── Planes de Financiación (Admin) ──────────────────────────────────────────

export const getPlanes = async (includeInactive = false) => {
  try {
    return await prisma.planFinanciacion.findMany({
      where: includeInactive ? undefined : { activo: true },
      orderBy: { cuotas: "asc" },
    });
  } catch {
    return [];
  }
};

export const createPlan = async (values: z.infer<typeof PlanFinanciacionSchema>) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "No autorizado" };

  const validated = PlanFinanciacionSchema.safeParse(values);
  if (!validated.success) return { error: "Datos inválidos" };

  try {
    await prisma.planFinanciacion.create({
      data: validated.data,
    });
    revalidatePath("/dashboard/planes");
    return { success: true };
  } catch {
    return { error: "Error al crear el plan" };
  }
};

export const updatePlan = async (id: string, values: z.infer<typeof PlanFinanciacionSchema>) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "No autorizado" };

  const validated = PlanFinanciacionSchema.safeParse(values);
  if (!validated.success) return { error: "Datos inválidos" };

  try {
    await prisma.planFinanciacion.update({
      where: { id },
      data: validated.data,
    });
    revalidatePath("/dashboard/planes");
    return { success: true };
  } catch {
    return { error: "Error al actualizar el plan" };
  }
};

export const deletePlan = async (id: string) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "No autorizado" };

  try {
    await prisma.planFinanciacion.delete({ where: { id } });
    revalidatePath("/dashboard/planes");
    return { success: true };
  } catch {
    return { error: "Error al eliminar el plan" };
  }
};

// ── Solicitudes de Financiación ─────────────────────────────────────────────

export const createSolicitud = async (values: z.infer<typeof SolicitudFinanciacionSchema>) => {
  const validated = SolicitudFinanciacionSchema.safeParse(values);
  if (!validated.success) return { error: "Datos inválidos" };

  try {
    await prisma.solicitudFinanciacion.create({
      data: {
        ...validated.data,
        vehiculoId: validated.data.vehiculoId || null,
      },
    });
    revalidatePath("/dashboard/solicitudes");
    return { success: "Solicitud de crédito enviada con éxito. Nos pondremos en contacto." };
  } catch {
    return { error: "Error al enviar la solicitud. Por favor intentá de nuevo." };
  }
};

export const getSolicitudes = async (estado?: EstadoConsulta) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return [];

  try {
    return await prisma.solicitudFinanciacion.findMany({
      where: estado ? { estado } : undefined,
      include: {
        vehiculo: {
          select: { id: true, marca: true, modelo: true, anio: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
};

export const updateSolicitudEstado = async (id: string, estado: EstadoConsulta) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "No autorizado" };

  try {
    await prisma.solicitudFinanciacion.update({
      where: { id },
      data: { estado },
    });
    revalidatePath("/dashboard/solicitudes");
    return { success: true };
  } catch {
    return { error: "Error al actualizar el estado" };
  }
};
