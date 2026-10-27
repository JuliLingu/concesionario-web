"use server";

import { prisma } from "@/lib/prisma";
import { ConsultaSchema, type ConsultaInput } from "@/schemas/consulta";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { EstadoConsulta } from "../../generated/prisma";
import { avisarConsulta } from "@/services/avisos.service";
import { vincularContacto } from "@/services/contactos.service";
import {
  REGLAS,
  esperaRestante,
  ipDelCliente,
  mensajeDeEspera,
  registrarIntento,
} from "@/lib/rate-limit";

// ── Crear consulta (acción pública, sin auth requerida) ──────────────────────
export const createConsulta = async (values: ConsultaInput) => {
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
    const contactoId = await vincularContacto(validated.data);

    await prisma.consulta.create({
      data: {
        contactoId,
        nombre:    validated.data.nombre,
        email:     validated.data.email,
        telefono:  validated.data.telefono,
        mensaje:   validated.data.mensaje,
        medioContacto: validated.data.medioContacto,
        franjaHoraria: validated.data.franjaHoraria,
        vehiculoId: validated.data.vehiculoId || null,
      },
    });

    revalidatePath("/dashboard/bandeja");

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
        medioContacto: validated.data.medioContacto,
        franjaHoraria: validated.data.franjaHoraria,
        vehiculoId: validated.data.vehiculoId || null,
      }),
    );

    return { success: "Consulta enviada con éxito. Nos pondremos en contacto a la brevedad." };
  } catch {
    return { error: "Error al enviar la consulta. Por favor intentá de nuevo." };
  }
};

// La lectura de la bandeja se mudó a `services/contactos.service.ts`, que la
// une con tasaciones y solicitudes. Acá quedan las escrituras.

// ── Cambiar estado de consulta (solo ADMIN) ───────────────────────────────────
export const updateConsultaEstado = async (id: string, estado: EstadoConsulta) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "No autorizado" };

  try {
    await prisma.consulta.update({
      where: { id },
      data: { estado },
    });
    revalidatePath("/dashboard/bandeja");
    return { success: true };
  } catch {
    return { error: "Error al actualizar el estado" };
  }
};
