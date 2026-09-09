"use server";

import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { TasacionSchema } from "@/schemas/tasacion";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { EstadoConsulta } from "../../generated/prisma";
import { getConfiguracion } from "@/services/configuracion.service";
import { avisarTasacion } from "@/services/avisos.service";
import { codigoDeReferencia } from "@/lib/referencia";
import {
  REGLAS,
  esperaRestante,
  ipDelCliente,
  mensajeDeEspera,
  registrarIntento,
} from "@/lib/rate-limit";

/**
 * Unidad del catálogo por la que el visitante quiere permutar.
 *
 * El id llega de la URL o de un desplegable, así que se verifica contra la
 * base antes de guardarlo. Si no existe o no está publicada, se guarda la
 * tasación igual con el campo en null: el auto que ofrecen sigue interesando
 * aunque la unidad que miraban ya se haya vendido.
 */
async function unidadDeInteresValida(id: string | null): Promise<string | null> {
  if (!id) return null;

  try {
    const vehiculo = await prisma.vehiculo.findFirst({
      where: { id, publicacion: "PUBLICADO" },
      select: { id: true },
    });
    return vehiculo?.id ?? null;
  } catch {
    return null;
  }
}

// ── Crear tasación (acción pública, sin auth requerida) ──────────────────────

export const createTasacion = async (values: z.infer<typeof TasacionSchema>) => {
  // Primero de todo: con el módulo apagado no se aceptan tasaciones nuevas,
  // porque nadie estaría mirando esa bandeja. Los docs de Next lo advierten
  // explícito — una server action se puede invocar con un POST directo, sin
  // pasar por la interfaz, así que apagar el formulario no apaga la acción.
  if (!(await getConfiguracion()).tasacionActiva) {
    return { error: "La tasación de usados no está disponible por el momento." };
  }

  // Antes del cupo: un formulario mal completado no debería gastarlo.
  const validated = TasacionSchema.safeParse(values);
  if (!validated.success) return { error: "Datos del formulario inválidos" };

  // Formulario abierto que guarda datos de contacto: sin cupo, cualquiera
  // puede llenar la tabla desde un script.
  const clave = `tasacion:ip:${await ipDelCliente()}`;
  const espera = esperaRestante(clave, REGLAS.TASACION_POR_IP);
  if (espera > 0) return { error: mensajeDeEspera(espera) };
  registrarIntento(clave, REGLAS.TASACION_POR_IP);

  try {
    const vehiculoInteresId = await unidadDeInteresValida(
      validated.data.vehiculoInteresId,
    );

    const tasacion = await prisma.tasacion.create({
      data: { ...validated.data, vehiculoInteresId },
      select: { id: true },
    });

    // Viaja de vuelta al formulario y va también en el aviso: es lo que permite
    // que las fotos que lleguen por WhatsApp se aten a esta fila sin preguntar.
    const referencia = codigoDeReferencia(tasacion.id);

    revalidatePath("/dashboard/tasaciones");

    // El aviso sale con la respuesta ya entregada: quien completó el formulario
    // ve la confirmación al instante y no espera al proveedor de correo. Va
    // después del create a propósito: si guardar falló, no hay de qué avisar.
    after(() =>
      avisarTasacion({
        nombre:           validated.data.nombre,
        email:            validated.data.email,
        telefono:         validated.data.telefono,
        marca:            validated.data.marca,
        modelo:           validated.data.modelo,
        anio:             validated.data.anio,
        kilometraje:      validated.data.kilometraje,
        precioPretendido: validated.data.precioPretendido,
        moneda:           validated.data.moneda,
        observaciones:    validated.data.observaciones,
        vehiculoInteresId,
        referencia,
      }),
    );

    return {
      success:
        "Recibimos los datos de tu usado. Un asesor se va a comunicar con vos para cotizarlo.",
      referencia,
    };
  } catch {
    return { error: "Error al enviar la tasación. Por favor intentá de nuevo." };
  }
};

// ── Bandeja del panel (solo ADMIN) ───────────────────────────────────────────

export const getTasaciones = async (estado?: EstadoConsulta) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return [];

  try {
    return await prisma.tasacion.findMany({
      where: estado ? { estado } : undefined,
      include: {
        vehiculoInteres: {
          select: { id: true, marca: true, modelo: true, anio: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
};

export const updateTasacionEstado = async (id: string, estado: EstadoConsulta) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "No autorizado" };

  try {
    await prisma.tasacion.update({
      where: { id },
      data: { estado },
    });
    revalidatePath("/dashboard/tasaciones");
    return { success: true };
  } catch {
    return { error: "Error al actualizar el estado" };
  }
};
