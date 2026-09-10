import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

/**
 * Ficha de una unidad. La usa el catálogo público, así que un borrador solo se
 * devuelve si quien mira es el administrador: el listado ya filtraba por
 * publicación, pero entrar por la URL de la ficha esquivaba ese filtro.
 *
 * Envuelta en `cache()` de React porque la ficha la pide dos veces por request:
 * primero `generateMetadata`, para armar el título, la descripción y el JSON-LD,
 * y después la página para renderizarla. Sin esto serían dos consultas idénticas
 * —más la de sesión— en cada visita a una ficha.
 *
 * Vive en un service y no en `actions/vehicle.ts` justamente por eso: en un
 * archivo "use server" toda función exportada es un endpoint, y ahí no se puede
 * exportar algo que no sea una función async declarada.
 */
export const getVehiculoPorId = cache(async (id: string) => {
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
      precio: Number(vehicle.precio),
    };
  } catch {
    return null;
  }
});

export type VehiculoFicha = NonNullable<Awaited<ReturnType<typeof getVehiculoPorId>>>;

/**
 * La misma ficha, pero sin mirar la sesión: solo devuelve unidades publicadas.
 *
 * La necesita la ruta que genera la imagen de Open Graph, que se cachea y se
 * sirve igual a todo el mundo. Si ahí se leyera la sesión, la respuesta pasaría
 * a depender de una cookie y quedaría fuera de la caché — y, peor, la primera
 * visita del administrador podría dejar cacheada la foto de un borrador.
 */
export const getVehiculoPublicado = cache(async (id: string) => {
  try {
    const vehiculo = await prisma.vehiculo.findFirst({
      where: { id, publicacion: "PUBLICADO" },
      include: {
        categoria: true,
        imagenes: { orderBy: { orden: "asc" } },
      },
    });

    return vehiculo ? { ...vehiculo, precio: Number(vehiculo.precio) } : null;
  } catch {
    return null;
  }
});
