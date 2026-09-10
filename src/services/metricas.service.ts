/**
 * Medición del interés por unidad y lectura del rendimiento del stock.
 *
 * La escritura la disparan el catálogo público (una visita a la ficha, un click
 * al botón de WhatsApp) y siempre por fuera del camino crítico del visitante.
 * La lectura la consume el panel. Las reglas con las que se interpreta lo
 * contado —qué es "estar cara", cuántos días es demasiado— viven en
 * `lib/metricas.ts`, sin base de datos de por medio.
 */
import { prisma } from "@/lib/prisma";
import { registrarError } from "@/lib/log";
import {
  DIAS_INMOVILIZADA,
  VENTANA_DIAS,
  diaLocal,
  diaLocalHace,
  diasEnStock,
  promedio,
  senalesDeUnidad,
  type Senal,
  type Visibilidad,
} from "@/lib/metricas";
import type { EstadoPublicacion, Moneda } from "../../generated/prisma";

// ── Escritura ────────────────────────────────────────────────────────────────

type Contador = "vistas" | "clicksWhatsapp";

/**
 * Suma uno al contador del día de esa unidad, creando la fila si es la primera
 * del día. Un solo viaje a la base: es un INSERT ... ON DUPLICATE KEY UPDATE.
 *
 * No lanza. Corre con la respuesta ya entregada al visitante, así que un fallo
 * acá no tiene a quién avisarle: se pierde una visita del contador y se
 * registra. Ninguna métrica vale romperle la ficha a un cliente.
 */
async function sumarUno(vehiculoId: string, contador: Contador): Promise<void> {
  const fecha = diaLocal();

  // Dos ramas literales y no una clave calculada: Prisma tipa cada contador por
  // separado y `{ [contador]: 1 }` obligaría a castear justo el objeto que se
  // escribe en la base.
  const primera = contador === "vistas" ? { vistas: 1 } : { clicksWhatsapp: 1 };
  const siguiente =
    contador === "vistas"
      ? { vistas: { increment: 1 } }
      : { clicksWhatsapp: { increment: 1 } };

  try {
    await prisma.metricaVehiculoDia.upsert({
      where: { vehiculoId_fecha: { vehiculoId, fecha } },
      create: { vehiculoId, fecha, ...primera },
      update: siguiente,
    });
  } catch (error) {
    registrarError(`sumarUno:${contador}`, error);
  }
}

/**
 * ¿Esta unidad se puede medir?
 *
 * El esquema usa `relationMode = "prisma"`, así que la base no tiene claves
 * foráneas y nada impide insertar una métrica con un id inventado. Como las
 * acciones que llaman acá son endpoints públicos, se comprueba antes: sin esto,
 * cualquiera podría llenar la tabla de filas huérfanas que después no se
 * borrarían al dar de baja ningún vehículo, porque no cuelgan de ninguno.
 *
 * De paso deja fuera lo que no está en vidriera: un borrador que el
 * administrador está revisando no es interés de mercado.
 */
async function esMedible(vehiculoId: string): Promise<boolean> {
  try {
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { id: vehiculoId },
      select: { publicacion: true },
    });
    return vehiculo?.publicacion === "PUBLICADO";
  } catch (error) {
    registrarError("esMedible", error);
    return false;
  }
}

/** Una visita más a la ficha de esa unidad. */
export async function registrarVista(vehiculoId: string): Promise<void> {
  if (await esMedible(vehiculoId)) await sumarUno(vehiculoId, "vistas");
}

/** Un click más al botón de WhatsApp de esa unidad. */
export async function registrarClickWhatsapp(vehiculoId: string): Promise<void> {
  if (await esMedible(vehiculoId)) await sumarUno(vehiculoId, "clicksWhatsapp");
}

// ── Lectura ──────────────────────────────────────────────────────────────────

export type UnidadRendimiento = {
  id: string;
  nombre: string;
  anio: number;
  precio: number;
  moneda: Moneda;
  publicacion: EstadoPublicacion;
  diasEnStock: number;
  vistas: number;
  clicksWhatsapp: number;
  /** Consultas + solicitudes de crédito + permutas + clicks, en la ventana. */
  contactos: number;
  senales: Senal[];
};

export type VentaMedida = {
  id: string;
  nombre: string;
  anio: number;
  vendidoAt: Date;
  diasHastaLaVenta: number;
};

export type RendimientoStock = {
  ventanaDias: number;
  /** Stock vivo (todo lo que no está vendido), de más viejo a más nuevo. */
  unidades: UnidadRendimiento[];
  /** Ventas del último año con fecha registrada, de la más reciente a la más vieja. */
  ventas: VentaMedida[];
  resumen: {
    unidadesEnStock: number;
    diasPromedioEnStock: number | null;
    inmovilizadas: number;
    caras: number;
    invisibles: number;
    /** Null hasta que haya una venta con fecha: la rotación no se inventa. */
    diasPromedioHastaLaVenta: number | null;
  };
};

const VISIBILIDAD: Record<EstadoPublicacion, Visibilidad> = {
  PUBLICADO: "PUBLICADA",
  PAUSADO: "PAUSADA",
  BORRADOR: "SIN_PUBLICAR",
  // Las vendidas no llegan a pedir visibilidad —se separan antes—, pero el
  // Record tiene que cubrir el enum entero.
  VENDIDO: "SIN_PUBLICAR",
};

const UN_DIA_MS = 24 * 60 * 60 * 1000;

/** Suma los conteos de un groupBy en un mapa por id, salteando los nulos. */
function porVehiculo<T extends { _count: number }>(
  filas: (T & { vehiculoId?: string | null; vehiculoInteresId?: string | null })[],
): Map<string, number> {
  const mapa = new Map<string, number>();
  for (const fila of filas) {
    const id = fila.vehiculoId ?? fila.vehiculoInteresId;
    if (!id) continue;
    mapa.set(id, (mapa.get(id) ?? 0) + fila._count);
  }
  return mapa;
}

/**
 * Todo lo que hace falta para responder las tres preguntas de un dueño: qué se
 * mira y no se consulta, qué no se mira, y cuánto hace que cada auto está ahí.
 *
 * Las cinco consultas van en paralelo y ninguna trae filas por visita: las
 * métricas llegan ya sumadas por unidad desde la tabla diaria, y los contactos
 * como conteos agrupados. Sobre una concesionaria de cien unidades esto son
 * cinco lecturas de unos pocos cientos de filas.
 */
export async function getRendimientoStock(
  ahora: Date = new Date(),
): Promise<RendimientoStock> {
  // Las métricas se guardan por día calendario; las consultas, con hora exacta.
  // De ahí los dos bordes: el mismo mes, expresado como corresponde en cada
  // tabla. La diferencia entre uno y otro son las horas del día más viejo de la
  // ventana, que a esta escala no cambia ninguna conclusión.
  const desdeDia = diaLocalHace(VENTANA_DIAS - 1, ahora);
  const desdeInstante = new Date(ahora.getTime() - VENTANA_DIAS * UN_DIA_MS);
  const haceUnAnio = new Date(ahora.getTime() - 365 * UN_DIA_MS);

  const [vehiculos, metricas, consultas, solicitudes, permutas] = await Promise.all([
    prisma.vehiculo.findMany({
      select: {
        id: true,
        marca: true,
        modelo: true,
        anio: true,
        precio: true,
        moneda: true,
        publicacion: true,
        createdAt: true,
        vendidoAt: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.metricaVehiculoDia.groupBy({
      by: ["vehiculoId"],
      where: { fecha: { gte: desdeDia } },
      _sum: { vistas: true, clicksWhatsapp: true },
    }),
    prisma.consulta.groupBy({
      by: ["vehiculoId"],
      where: { vehiculoId: { not: null }, createdAt: { gte: desdeInstante } },
      _count: true,
    }),
    prisma.solicitudFinanciacion.groupBy({
      by: ["vehiculoId"],
      where: { vehiculoId: { not: null }, createdAt: { gte: desdeInstante } },
      _count: true,
    }),
    prisma.tasacion.groupBy({
      by: ["vehiculoInteresId"],
      where: { vehiculoInteresId: { not: null }, createdAt: { gte: desdeInstante } },
      _count: true,
    }),
  ]);

  const vistasPorId = new Map(
    metricas.map((m) => [
      m.vehiculoId,
      { vistas: m._sum.vistas ?? 0, clicks: m._sum.clicksWhatsapp ?? 0 },
    ]),
  );
  const consultasPorId = porVehiculo(consultas);
  const solicitudesPorId = porVehiculo(solicitudes);
  const permutasPorId = porVehiculo(permutas);

  const unidades: UnidadRendimiento[] = [];
  const ventas: VentaMedida[] = [];

  for (const v of vehiculos) {
    const nombre = `${v.marca} ${v.modelo}`;
    const dias = diasEnStock(v.createdAt, v.vendidoAt, ahora);

    if (v.publicacion === "VENDIDO") {
      // Una venta anterior a esta funcionalidad no tiene fecha, y no se le
      // inventa una: queda fuera de la rotación en vez de ensuciar el promedio.
      if (v.vendidoAt && v.vendidoAt >= haceUnAnio) {
        ventas.push({ id: v.id, nombre, anio: v.anio, vendidoAt: v.vendidoAt, diasHastaLaVenta: dias });
      }
      continue;
    }

    const medido = vistasPorId.get(v.id);
    const vistas = medido?.vistas ?? 0;
    const clicksWhatsapp = medido?.clicks ?? 0;
    const contactos =
      clicksWhatsapp +
      (consultasPorId.get(v.id) ?? 0) +
      (solicitudesPorId.get(v.id) ?? 0) +
      (permutasPorId.get(v.id) ?? 0);

    unidades.push({
      id: v.id,
      nombre,
      anio: v.anio,
      precio: Number(v.precio),
      moneda: v.moneda,
      publicacion: v.publicacion,
      diasEnStock: dias,
      vistas,
      clicksWhatsapp,
      contactos,
      senales: senalesDeUnidad({
        visibilidad: VISIBILIDAD[v.publicacion],
        diasEnStock: dias,
        vistas,
        contactos,
      }),
    });
  }

  // Lo más viejo primero: es el orden en el que hay que tomar decisiones.
  unidades.sort((a, b) => b.diasEnStock - a.diasEnStock);
  ventas.sort((a, b) => b.vendidoAt.getTime() - a.vendidoAt.getTime());

  const tiene = (unidad: UnidadRendimiento, senal: Senal) => unidad.senales.includes(senal);

  return {
    ventanaDias: VENTANA_DIAS,
    unidades,
    ventas,
    resumen: {
      unidadesEnStock: unidades.length,
      diasPromedioEnStock: promedio(unidades.map((u) => u.diasEnStock)),
      inmovilizadas: unidades.filter((u) => u.diasEnStock >= DIAS_INMOVILIZADA).length,
      caras: unidades.filter((u) => tiene(u, "MIRAN_Y_NO_PREGUNTAN")).length,
      invisibles: unidades.filter((u) => tiene(u, "NADIE_LA_MIRA")).length,
      diasPromedioHastaLaVenta: promedio(ventas.map((v) => v.diasHastaLaVenta)),
    },
  };
}
