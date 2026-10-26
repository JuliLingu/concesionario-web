import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { registrarError } from "@/lib/log";
import { elegirSimilares } from "@/lib/similares";
import type { Moneda, Prisma } from "../../generated/prisma";

/**
 * Días que una unidad vendida sigue a la vista en el catálogo público, con la
 * etiqueta "Vendido". Muestra que el stock rota; pasado ese plazo ya es una
 * grilla llena de autos que no se pueden comprar.
 */
const DIAS_VENDIDO_VISIBLE = 30;

/**
 * Qué puede ver el público: lo publicado y, por un tiempo, lo vendido.
 *
 * Vive acá y no en la página del catálogo porque la usan también los guardados
 * y el comparador, que reciben ids desde el navegador: sin este filtro, pegar en
 * la URL el id de un borrador lo mostraría.
 */
export function visibleAlPublico(): Prisma.VehiculoWhereInput {
  const vendidoDesde = new Date(Date.now() - DIAS_VENDIDO_VISIBLE * 86_400_000);
  return {
    OR: [
      { publicacion: "PUBLICADO" },
      { publicacion: "VENDIDO", vendidoAt: { gte: vendidoDesde } },
    ],
  };
}

/**
 * Las unidades de una lista de ids que el público puede ver, en el mismo orden
 * de la lista. Para "Mis guardados" y el comparador.
 *
 * Los ids llegan de la URL, así que quien llama tiene que haberlos depurado
 * (`lib/seleccion.ts`): acá se confía en que son pocos y con forma de id. Lo que
 * no aparece —dado de baja, pausado, vuelto a borrador— simplemente no vuelve,
 * y quien llama decide qué hacer con el faltante.
 */
export async function getVehiculosPorIds(ids: string[]) {
  if (ids.length === 0) return [];

  const vehiculos = await prisma.vehiculo.findMany({
    where: { id: { in: ids }, AND: [visibleAlPublico()] },
    include: {
      categoria: true,
      imagenes: { orderBy: { orden: "asc" } },
    },
  });

  // El `in` no conserva el orden: se reordena según la lista recibida.
  const porId = new Map(vehiculos.map((v) => [v.id, v]));
  return ids
    .map((id) => porId.get(id))
    .filter((v) => v !== undefined)
    .map((v) => ({ ...v, precio: Number(v.precio) }));
}

export type VehiculoElegido = Awaited<ReturnType<typeof getVehiculosPorIds>>[number];

/**
 * Las unidades para el bloque "similares" al pie de una ficha. El criterio vive
 * en `lib/similares.ts`.
 *
 * Dos lecturas en vez de una: primero lo justo para decidir (id, categoría y
 * precio de todo lo publicado, que en una concesionaria son decenas de filas
 * angostas), y después las fotos solo de las elegidas. Traer el stock entero
 * con imágenes para mostrar tres sería pagar por todas.
 *
 * Solo lo publicado: una vendida no es una alternativa. No lanza — es un
 * extra de la ficha, y si falla la ficha se muestra igual, sin el bloque.
 */
export async function getSimilares(
  vehiculo: { id: string; categoriaId: string; precio: number; moneda: Moneda },
  cotizacionDolar: number | null,
) {
  try {
    const candidatos = await prisma.vehiculo.findMany({
      where: { publicacion: "PUBLICADO", id: { not: vehiculo.id } },
      select: { id: true, categoriaId: true, precio: true, moneda: true },
      // A igual cercanía de precio gana la más nueva (ver `elegirSimilares`).
      orderBy: { createdAt: "desc" },
    });

    const ids = elegirSimilares(
      vehiculo,
      candidatos.map((c) => ({ ...c, precio: Number(c.precio) })),
      cotizacionDolar,
    );
    return await getVehiculosPorIds(ids);
  } catch (error) {
    registrarError("getSimilares", error);
    return [];
  }
}

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
