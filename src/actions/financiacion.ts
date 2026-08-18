"use server";

import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { PlanFinanciacionSchema, SolicitudFinanciacionSchema } from "@/schemas/financiacion";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { EstadoConsulta } from "../../generated/prisma";
import { FEATURE_FINANCIACION } from "@/lib/features";
import { avisarSolicitud } from "@/services/avisos.service";
import {
  REGLAS,
  esperaRestante,
  ipDelCliente,
  mensajeDeEspera,
  registrarIntento,
} from "@/lib/rate-limit";

// ── Planes de Financiación (Admin) ──────────────────────────────────────────

/**
 * Planes de financiación.
 *
 * Los activos son públicos: los muestra el simulador de la ficha del vehículo.
 * Los inactivos son borradores comerciales, así que pedirlos exige ser
 * administrador.
 */
export const getPlanes = async (includeInactive = false) => {
  if (includeInactive) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return [];
  }

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
  // Es la única acción pública de financiación: con la feature en stand by no se
  // aceptan solicitudes nuevas (nadie estaría mirando esa bandeja).
  if (!FEATURE_FINANCIACION) return { error: "La financiación no está disponible por el momento." };

  const validated = SolicitudFinanciacionSchema.safeParse(values);
  if (!validated.success) return { error: "Datos inválidos" };

  // Formulario abierto que además guarda datos personales (DNI, ingresos): sin
  // cupo, cualquiera puede llenar la tabla desde un script.
  const clave = `solicitud:ip:${await ipDelCliente()}`;
  const espera = esperaRestante(clave, REGLAS.SOLICITUD_POR_IP);
  if (espera > 0) return { error: mensajeDeEspera(espera) };
  registrarIntento(clave, REGLAS.SOLICITUD_POR_IP);

  try {
    await prisma.solicitudFinanciacion.create({
      data: {
        ...validated.data,
        vehiculoId: validated.data.vehiculoId || null,
      },
    });
    revalidatePath("/dashboard/solicitudes");

    // Mismo criterio que en la consulta: el aviso no bloquea la respuesta. Sin
    // DNI ni ingresos en el correo, eso queda del lado del panel.
    after(() =>
      avisarSolicitud({
        nombre:    validated.data.nombre,
        apellido:  validated.data.apellido,
        email:     validated.data.email,
        telefono:  validated.data.telefono,
        cuotas:    validated.data.cuotas,
        vehiculoId: validated.data.vehiculoId || null,
      }),
    );

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
