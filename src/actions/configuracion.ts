"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getConfiguracion() {
  try {
    let config = await prisma.configuracion.findFirst();
    
    // Si no existe, creamos una por defecto
    if (!config) {
      config = await prisma.configuracion.create({
        data: {
          id: "1",
          nombreConcesionaria: "JBJ Automotores",
        },
      });
    }
    
    return {
      ...config,
      cotizacionDolar: config.cotizacionDolar ? Number(config.cotizacionDolar) : null,
    };
  } catch (error) {
    console.error("Error al obtener la configuración:", error);
    // Retornamos algo por defecto para evitar romper la página si falla la BD
    return {
      id: "1",
      nombreConcesionaria: "JBJ Automotores",
      telefono: null,
      email: null,
      direccion: null,
      facebookUrl: null,
      instagramUrl: null,
      cotizacionDolar: null,
    };
  }
}

export async function updateConfiguracion(data: any) {
  try {
    let config = await prisma.configuracion.findFirst();
    
    if (config) {
      await prisma.configuracion.update({
        where: { id: config.id },
        data: {
          nombreConcesionaria: data.nombreConcesionaria,
          telefono: data.telefono,
          email: data.email,
          direccion: data.direccion,
          facebookUrl: data.facebookUrl,
          instagramUrl: data.instagramUrl,
          cotizacionDolar: data.cotizacionDolar ? Number(data.cotizacionDolar) : null,
        }
      });
    } else {
      await prisma.configuracion.create({
        data: {
          id: "1",
          nombreConcesionaria: data.nombreConcesionaria,
          telefono: data.telefono,
          email: data.email,
          direccion: data.direccion,
          facebookUrl: data.facebookUrl,
          instagramUrl: data.instagramUrl,
          cotizacionDolar: data.cotizacionDolar ? Number(data.cotizacionDolar) : null,
        }
      });
    }
    
    // Revalidar en toda la app ya que afecta al header y footer
    revalidatePath("/", "layout");
    
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar la configuración:", error);
    return { success: false, error: "Error al actualizar la configuración." };
  }
}
