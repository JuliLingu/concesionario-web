/**
 * Inventario para el buscador con IA.
 *
 * El servicio `ai-search` no tiene acceso a la base: le pide el stock a esta
 * ruta cada vez que arranca o que se le avisa que algo cambió. Así la regla de
 * qué está publicado, la conversión de dólares a pesos y la decisión de mostrar
 * o no los precios viven en un solo lugar, y el servicio no necesita ninguna
 * credencial de la base.
 *
 * No es pública: devuelve solo lo que ya se ve en el catálogo, pero de un saque
 * y en un formato cómodo para copiarse el stock entero. Se protege con un
 * secreto compartido que el servicio manda como Bearer.
 */
import { timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getConfiguracion } from "@/services/configuracion.service";
import { precioEnPesos } from "@/lib/precio";

function secretoValido(cabecera: string | null): boolean {
  const esperado = process.env.AI_INVENTARIO_SECRET?.trim();
  // Sin secreto configurado la ruta no existe: sin esto, una instalación que
  // no usa la IA quedaría con el inventario abierto a cualquiera.
  if (!esperado || !cabecera?.startsWith("Bearer ")) return false;

  const recibido = Buffer.from(cabecera.slice("Bearer ".length));
  const correcto = Buffer.from(esperado);
  // Comparación en tiempo constante; `timingSafeEqual` exige el mismo largo.
  return recibido.length === correcto.length && timingSafeEqual(recibido, correcto);
}

export async function GET(request: Request): Promise<Response> {
  if (!secretoValido(request.headers.get("authorization"))) {
    return new Response(null, { status: 401 });
  }

  const [configuracion, categorias, vehiculos] = await Promise.all([
    getConfiguracion(),
    prisma.categoria.findMany({ select: { slug: true }, orderBy: { slug: "asc" } }),
    prisma.vehiculo.findMany({
      where: { publicacion: "PUBLICADO" },
      select: {
        id: true,
        marca: true,
        modelo: true,
        version: true,
        anio: true,
        estado: true,
        kilometraje: true,
        transmision: true,
        combustible: true,
        descripcion: true,
        precio: true,
        moneda: true,
        categoria: { select: { slug: true } },
      },
    }),
  ]);

  const preciosVisibles = configuracion.mostrarPrecios;

  return Response.json(
    {
      categorias: categorias.map((c) => c.slug),
      preciosVisibles,
      cotizacionDolar: configuracion.cotizacionDolar,
      vehiculos: vehiculos.map(({ precio, moneda, categoria, ...v }) => {
        const enPesos = precioEnPesos(Number(precio), moneda, configuracion.cotizacionDolar);
        return {
          ...v,
          categoria: categoria.slug,
          // Con los precios ocultos no viaja ninguno: lo que el servicio no
          // tiene, no lo puede filtrar ni repetir en una respuesta.
          precioArs: preciosVisibles && enPesos !== null ? Math.round(enPesos) : null,
        };
      }),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
