"use server";

import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { VehicleSchema } from "@/schemas/vehicle";
import { auth } from "@/auth";
import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/services/cache.service";
import { registrarError } from "@/lib/log";
import { EstadoPublicacion } from "../../generated/prisma";

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

/**
 * Cuándo se vendió la unidad, según el estado al que pasa.
 *
 * La fecha es un hecho derivado del cambio de estado, no un campo del
 * formulario: pedírsela al administrador sería garantizar que a la mitad de las
 * ventas les falte, y con eso no hay rotación que calcular.
 *
 * Tres casos, y el del medio es el que importa: una unidad que ya estaba
 * vendida y se vuelve a guardar —porque se corrigió el kilometraje, o la
 * descripción— conserva la fecha de la venta original. Si acá se pusiera `new
 * Date()` sin mirar, cada edición posterior rejuvenecería la venta y el
 * promedio de días hasta vender se acercaría a cero solo por editar.
 */
function fechaDeVenta(
  estadoNuevo: EstadoPublicacion,
  vendidoAtActual: Date | null,
  ahora: Date = new Date(),
): Date | null {
  // Sale de vendida (una venta que se cayó): la fecha deja de ser cierta.
  if (estadoNuevo !== EstadoPublicacion.VENDIDO) return null;
  return vendidoAtActual ?? ahora;
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
        // Raro pero posible: cargar una unidad ya vendida para dejarla en el
        // histórico. Sin esto entraría al registro de rotación sin fecha.
        vendidoAt: fechaDeVenta(data.publicacion, null),
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
    // La fecha de venta depende de la que ya tenga guardada, así que hay que
    // leerla antes: es lo que distingue "se vendió recién" de "se editó una
    // unidad que ya estaba vendida".
    const actual = await prisma.vehiculo.findUnique({
      where: { id },
      select: { vendidoAt: true },
    });

    if (!actual) return { error: "El vehículo ya no existe" };

    await prisma.vehiculo.update({
      where: { id },
      data: {
        ...data,
        vendidoAt: fechaDeVenta(data.publicacion, actual.vendidoAt),
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
 * Cambia solo la visibilidad de una unidad, desde el listado del inventario.
 *
 * Existe por la fecha de venta. Hasta acá, marcar un auto como vendido obligaba
 * a abrir el formulario completo, cambiar un `select` entre otros veinte campos
 * y guardar; con esa fricción la mitad de las ventas se registran tarde o no se
 * registran, y una rotación calculada sobre fechas puestas a destiempo miente.
 * Un botón en la fila es lo que hace que el dato exista.
 */
export const cambiarPublicacion = async (id: string, publicacion: EstadoPublicacion) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "No autorizado" };

  // Llega desde el navegador: se comprueba contra el enum antes de la base.
  if (!Object.values(EstadoPublicacion).includes(publicacion)) {
    return { error: "Estado inválido" };
  }

  try {
    const actual = await prisma.vehiculo.findUnique({
      where: { id },
      select: { vendidoAt: true },
    });

    if (!actual) return { error: "El vehículo ya no existe" };

    await prisma.vehiculo.update({
      where: { id },
      data: {
        publicacion,
        vendidoAt: fechaDeVenta(publicacion, actual.vendidoAt),
      },
    });

    revalidarCatalogo();
    revalidatePath("/dashboard/metricas");
    return { success: true };
  } catch (error) {
    registrarError("cambiarPublicacion", error);
    return { error: "Error al cambiar el estado de la publicación" };
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