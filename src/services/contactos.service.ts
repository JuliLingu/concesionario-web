/**
 * Contactos: la persona detrás de cada consulta, tasación y solicitud.
 *
 * La regla de quién es quién vive en `lib/contacto.ts`; acá está lo que toca la
 * base: vincular un pedido nuevo con su contacto y leer la bandeja unificada.
 */
import { prisma } from "@/lib/prisma";
import { registrarError } from "@/lib/log";
import { datosAActualizar, normalizarEmail, type DatosDeContacto } from "@/lib/contacto";
import { POR_PAGINA, paginaMezclada, type TipoPedido } from "@/lib/bandeja";
import { Prisma, type EstadoConsulta } from "../../generated/prisma";

/**
 * Id del contacto de ese email, creándolo si es el primer pedido.
 *
 * No lanza: devuelve null si algo falla. Lo llaman los formularios públicos
 * antes de guardar el pedido, y perder una consulta porque no se pudo agendar
 * a quien la mandó sería perder justo lo que el CRM tiene que cuidar. El pedido
 * sin contacto sigue apareciendo en la bandeja; solo no se agrupa.
 */
export async function vincularContacto(datos: DatosDeContacto): Promise<string | null> {
  const email = normalizarEmail(datos.email);
  const actualizar = datosAActualizar(datos);

  try {
    const contacto = await prisma.contacto.upsert({
      where: { email },
      create: { email, nombre: actualizar.nombre, telefono: actualizar.telefono ?? null },
      update: actualizar,
      select: { id: true },
    });
    return contacto.id;
  } catch (error) {
    // Dos pedidos del mismo email al mismo tiempo: los dos intentan crear y el
    // índice único rechaza al segundo. Para entonces el contacto ya existe.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const existente = await prisma.contacto
        .findUnique({ where: { email }, select: { id: true } })
        .catch(() => null);
      if (existente) return existente.id;
    }
    registrarError("vincularContacto", error);
    return null;
  }
}

// ── Lectura (panel) ──────────────────────────────────────────────────────────
//
// Sin control de sesión acá: este archivo no es "use server", así que nada de
// lo que exporta es un endpoint. Las páginas que lo usan llaman antes a
// `requireAdmin()`.

const VEHICULO_RESUMIDO = { select: { id: true, marca: true, modelo: true, anio: true } } as const;

/** Un pedido de la bandeja, con su tipo para saber cómo mostrarlo. */
export type Pedido =
  | ({ tipo: "CONSULTA" } & Prisma.ConsultaGetPayload<{ include: { vehiculo: typeof VEHICULO_RESUMIDO } }>)
  | ({ tipo: "TASACION" } & Prisma.TasacionGetPayload<{ include: { vehiculoInteres: typeof VEHICULO_RESUMIDO } }>)
  | ({ tipo: "SOLICITUD" } & Prisma.SolicitudFinanciacionGetPayload<{ include: { vehiculo: typeof VEHICULO_RESUMIDO } }>);

interface FiltroDePedidos {
  /** Tipos a leer: los activos, o uno solo si se filtró. */
  tipos: TipoPedido[];
  estado?: EstadoConsulta;
  contactoId?: string;
  /** Solo lo anterior a esta fecha (paginación). */
  antes?: Date;
  /** Cuántos pedir de cada tabla. */
  cantidad?: number;
}

/**
 * Los pedidos de las tablas pedidas, cada uno marcado con su tipo. Las tres
 * lecturas van en paralelo; mezclarlas y cortar la página es de `lib/bandeja.ts`.
 */
async function leerPedidos({ tipos, estado, contactoId, antes, cantidad }: FiltroDePedidos): Promise<Pedido[][]> {
  const where = {
    ...(estado ? { estado } : {}),
    ...(contactoId ? { contactoId } : {}),
    ...(antes ? { createdAt: { lt: antes } } : {}),
  };
  const comun = { where, orderBy: { createdAt: "desc" as const }, ...(cantidad ? { take: cantidad } : {}) };

  return Promise.all([
    tipos.includes("CONSULTA")
      ? prisma.consulta
          .findMany({ ...comun, include: { vehiculo: VEHICULO_RESUMIDO } })
          .then((filas) => filas.map((f) => ({ tipo: "CONSULTA" as const, ...f })))
      : [],
    tipos.includes("TASACION")
      ? prisma.tasacion
          .findMany({ ...comun, include: { vehiculoInteres: VEHICULO_RESUMIDO } })
          .then((filas) => filas.map((f) => ({ tipo: "TASACION" as const, ...f })))
      : [],
    tipos.includes("SOLICITUD")
      ? prisma.solicitudFinanciacion
          .findMany({ ...comun, include: { vehiculo: VEHICULO_RESUMIDO } })
          .then((filas) => filas.map((f) => ({ tipo: "SOLICITUD" as const, ...f })))
      : [],
  ]);
}

/** Una página de la bandeja unificada, más los pendientes de cada tipo. */
export async function getBandeja(filtro: {
  tipos: TipoPedido[];
  estado?: EstadoConsulta;
  antes?: Date;
}) {
  const [listas, pendientes] = await Promise.all([
    leerPedidos({ ...filtro, cantidad: POR_PAGINA + 1 }),
    contarPendientes(filtro.tipos),
  ]);
  return { ...paginaMezclada(listas), pendientes };
}

/** Pendientes por tipo, para las pestañas y el globo del encabezado. */
async function contarPendientes(tipos: TipoPedido[]): Promise<Record<TipoPedido, number>> {
  const pendiente = { where: { estado: "PENDIENTE" as const } };
  const [consultas, tasaciones, solicitudes] = await Promise.all([
    tipos.includes("CONSULTA") ? prisma.consulta.count(pendiente) : 0,
    tipos.includes("TASACION") ? prisma.tasacion.count(pendiente) : 0,
    tipos.includes("SOLICITUD") ? prisma.solicitudFinanciacion.count(pendiente) : 0,
  ]);
  return { CONSULTA: consultas, TASACION: tasaciones, SOLICITUD: solicitudes };
}

/**
 * Un contacto con todo lo que mandó y las notas del equipo. Null si no existe.
 * Los pedidos van completos, sin paginar: una persona no manda cientos.
 */
export async function getContacto(id: string, tipos: TipoPedido[]) {
  const contacto = await prisma.contacto.findUnique({
    where: { id },
    include: { notas: { orderBy: { createdAt: "desc" } } },
  });
  if (!contacto) return null;

  const listas = await leerPedidos({ tipos, contactoId: id });
  const pedidos = listas.flat().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return { ...contacto, pedidos };
}
