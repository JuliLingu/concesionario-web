"use server";

import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { ConsultaSchema } from "@/schemas/consulta";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { EstadoConsulta } from "../../generated/prisma";
import { avisarConsulta } from "@/services/avisos.service";
import {
  REGLAS,
  esperaRestante,
  ipDelCliente,
  mensajeDeEspera,
  registrarIntento,
} from "@/lib/rate-limit";

// ── Crear consulta (acción pública, sin auth requerida) ──────────────────────
export const createConsulta = async (values: z.infer<typeof ConsultaSchema>) => {
  const validated = ConsultaSchema.safeParse(values);

  if (!validated.success) {
    return { error: "Datos del formulario inválidos" };
  }

  // Cinco consultas por hora y origen: de sobra para quien pregunta por varias
  // unidades, y suficiente para que la bandeja del panel no se llene de spam.
  const clave = `consulta:ip:${await ipDelCliente()}`;
  const espera = esperaRestante(clave, REGLAS.CONSULTA_POR_IP);
  if (espera > 0) return { error: mensajeDeEspera(espera) };
  registrarIntento(clave, REGLAS.CONSULTA_POR_IP);

  try {
    await prisma.consulta.create({
      data: {
        nombre:    validated.data.nombre,
        email:     validated.data.email,
        telefono:  validated.data.telefono,
        mensaje:   validated.data.mensaje,
        vehiculoId: validated.data.vehiculoId || null,
      },
    });

    revalidatePath("/dashboard/consultas");

    // El aviso sale con la respuesta ya entregada: el visitante ve la
    // confirmación al instante y no espera a que conteste el proveedor de
    // correo. Va después del create a propósito — si guardar falló, no hay
    // consulta de la que avisar.
    after(() =>
      avisarConsulta({
        nombre:    validated.data.nombre,
        email:     validated.data.email,
        telefono:  validated.data.telefono,
        mensaje:   validated.data.mensaje,
        vehiculoId: validated.data.vehiculoId || null,
      }),
    );

    return { success: "Consulta enviada con éxito. Nos pondremos en contacto a la brevedad." };
  } catch {
    return { error: "Error al enviar la consulta. Por favor intentá de nuevo." };
  }
};

// ── Obtener todas las consultas (solo ADMIN) ─────────────────────────────────
export const getConsultas = async (estado?: EstadoConsulta) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return [];

  try {
    return await prisma.consulta.findMany({
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

// ── Cambiar estado de consulta (solo ADMIN) ───────────────────────────────────
export const updateConsultaEstado = async (id: string, estado: EstadoConsulta) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "No autorizado" };

  try {
    await prisma.consulta.update({
      where: { id },
      data: { estado },
    });
    revalidatePath("/dashboard/consultas");
    return { success: true };
  } catch {
    return { error: "Error al actualizar el estado" };
  }
};
