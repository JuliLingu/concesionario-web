/**
 * Reglas de lectura del rendimiento del stock.
 *
 * Acá no se toca la base: son funciones puras sobre números ya contados, para
 * que el criterio con el que se le dice a un concesionario "esta unidad está
 * cara" se pueda leer —y probar— sin levantar nada. El servicio que junta los
 * datos vive en `services/metricas.service.ts`.
 */

/**
 * Zona horaria del concesionario.
 *
 * Los días se cortan acá y no en UTC. El servidor corre en `iad1`, tres o
 * cuatro horas por delante según la época del año: sin esto, cada visita entre
 * las 21 y la medianoche se contaría en el día siguiente, que es justo la franja
 * en la que la gente mira autos.
 */
export const ZONA_HORARIA = "America/Argentina/Buenos_Aires";

const MILISEGUNDOS_POR_DIA = 24 * 60 * 60 * 1000;

/**
 * `en-CA` formatea como `2026-09-10`, que es el orden que hace falta para poder
 * partir el resultado por guiones. Es el mismo truco que usar `sv-SE`; el
 * idioma no importa, importa el patrón.
 */
const formatoDeDia = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZONA_HORARIA,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * El día calendario argentino al que pertenece un instante, como medianoche UTC.
 *
 * La columna es `DATE`, sin hora: guardar medianoche UTC es la forma en que
 * Prisma representa una fecha sin huso, y además hace que restar dos de estas
 * fechas dé siempre un múltiplo exacto de 24 horas.
 */
export function diaLocal(momento: Date = new Date()): Date {
  const [anio, mes, dia] = formatoDeDia.format(momento).split("-").map(Number);
  return new Date(Date.UTC(anio, mes - 1, dia));
}

/** El día calendario de hace N días. Para el borde inferior de la ventana. */
export function diaLocalHace(dias: number, momento: Date = new Date()): Date {
  const desde = diaLocal(momento);
  desde.setUTCDate(desde.getUTCDate() - dias);
  return desde;
}

/**
 * Días que la unidad lleva —o llevó— en stock.
 *
 * El reloj arranca en el alta y no en la publicación: el capital se inmoviliza
 * cuando el auto entra al playón, no cuando alguien se acuerda de sacarle las
 * fotos. Un borrador de tres semanas es exactamente el problema que esta
 * métrica tiene que hacer visible, no algo que deba quedar fuera de la cuenta.
 *
 * Los dos extremos se llevan a día calendario antes de restar, así "ayer a la
 * noche" y "hoy a la mañana" dan 1 y no 0.
 */
export function diasEnStock(
  createdAt: Date,
  vendidoAt: Date | null,
  ahora: Date = new Date(),
): number {
  const desde = diaLocal(createdAt).getTime();
  const hasta = diaLocal(vendidoAt ?? ahora).getTime();
  return Math.max(0, Math.round((hasta - desde) / MILISEGUNDOS_POR_DIA));
}

// ── Umbrales ─────────────────────────────────────────────────────────────────

/**
 * Ventana de medición. Un mes es lo que tarda una publicación en mostrar si
 * anda o no, y coincide con el ciclo con el que el dueño revisa precios.
 */
export const VENTANA_DIAS = 30;

/**
 * A partir de acá la unidad es capital dormido. Noventa días es el número con
 * el que trabaja el rubro: pasado ese punto el auto se desvaloriza más rápido
 * de lo que baja el precio al que se publica.
 */
export const DIAS_INMOVILIZADA = 90;

/**
 * Visitas mínimas para animarse a decir que el precio espanta. Con menos que
 * esto, cero consultas es lo esperable por puro azar y no significa nada.
 */
export const VISTAS_PARA_JUZGAR_PRECIO = 20;

/**
 * Días mínimos de publicación antes de emitir cualquier juicio. Una unidad
 * subida anteayer todavía no tuvo tiempo de ser mirada.
 */
export const DIAS_MINIMOS_PARA_JUZGAR = 7;

// ── Señales ──────────────────────────────────────────────────────────────────

export type Senal =
  /** Se mira mucho y nadie pregunta: el precio es lo primero que hay que mirar. */
  | "MIRAN_Y_NO_PREGUNTAN"
  /** No entra nadie a la ficha: foto, título o precio de publicación. */
  | "NADIE_LA_MIRA"
  /** Más de tres meses en el playón. */
  | "INMOVILIZADA"
  /** Recién publicada: todavía no hay con qué juzgarla. */
  | "EN_MEDICION"
  /** Fuera de vidriera: no se la mide porque no se la puede ver. */
  | "PAUSADA"
  /** Cargada pero nunca publicada: ocupa lugar y no la ve nadie. */
  | "SIN_PUBLICAR"
  /** Nada que reportar. */
  | "SIN_NOVEDAD";

export const SENAL_COPY: Record<
  Senal,
  { label: string; detalle: string; tono: "alerta" | "aviso" | "neutro" | "ok" }
> = {
  MIRAN_Y_NO_PREGUNTAN: {
    label: "Está cara",
    detalle: "La miran y nadie pregunta. Revisá el precio antes que la foto.",
    tono: "alerta",
  },
  NADIE_LA_MIRA: {
    label: "Nadie la mira",
    detalle: "No entra tráfico a la ficha: foto principal, título o precio de publicación.",
    tono: "alerta",
  },
  INMOVILIZADA: {
    label: `+${DIAS_INMOVILIZADA} días`,
    detalle: "Capital dormido. Se desvaloriza más rápido de lo que baja el precio.",
    tono: "aviso",
  },
  EN_MEDICION: {
    label: "En medición",
    detalle: `Lleva menos de ${DIAS_MINIMOS_PARA_JUZGAR} días publicada. Todavía no hay con qué juzgarla.`,
    tono: "neutro",
  },
  PAUSADA: {
    label: "Pausada",
    detalle: "Está fuera de la vidriera, así que no se mide.",
    tono: "neutro",
  },
  SIN_PUBLICAR: {
    label: "Sin publicar",
    detalle: "Sigue en borrador: ya ocupa lugar en el playón y todavía no la vio nadie.",
    tono: "aviso",
  },
  SIN_NOVEDAD: {
    label: "Sin novedad",
    detalle: "Se mira y se consulta en proporción esperable.",
    tono: "ok",
  },
};

/**
 * Estado de vidriera de la unidad. Es lo único que la lectura necesita saber de
 * `EstadoPublicacion`, y así este archivo no depende del cliente de Prisma.
 */
export type Visibilidad = "PUBLICADA" | "PAUSADA" | "SIN_PUBLICAR";

export type UnidadMedida = {
  visibilidad: Visibilidad;
  diasEnStock: number;
  /** Visitas a la ficha dentro de la ventana. */
  vistas: number;
  /** Consultas, solicitudes de crédito, permutas y clicks a WhatsApp, en la ventana. */
  contactos: number;
};

/**
 * Qué le pasa a una unidad, en el orden en que conviene leerlo.
 *
 * Devuelve una lista y no un veredicto único porque las señales no compiten:
 * una unidad puede llevar cuatro meses en el playón *y* no recibir visitas, y
 * son dos cosas distintas para hacer. Nunca devuelve vacío — sin hallazgos, la
 * respuesta es `SIN_NOVEDAD`.
 */
export function senalesDeUnidad(unidad: UnidadMedida): Senal[] {
  // Fuera de la vidriera no hay nada que medir, pero el reloj del playón corre
  // igual: un borrador viejo sigue siendo capital parado y se lo dice.
  if (unidad.visibilidad !== "PUBLICADA") {
    const fuera: Senal = unidad.visibilidad === "PAUSADA" ? "PAUSADA" : "SIN_PUBLICAR";
    return unidad.diasEnStock >= DIAS_INMOVILIZADA ? [fuera, "INMOVILIZADA"] : [fuera];
  }

  if (unidad.diasEnStock < DIAS_MINIMOS_PARA_JUZGAR) return ["EN_MEDICION"];

  const senales: Senal[] = [];

  // Excluyentes por definición: o no la mira nadie, o la miran y no preguntan.
  if (unidad.vistas === 0) {
    senales.push("NADIE_LA_MIRA");
  } else if (unidad.vistas >= VISTAS_PARA_JUZGAR_PRECIO && unidad.contactos === 0) {
    senales.push("MIRAN_Y_NO_PREGUNTAN");
  }

  if (unidad.diasEnStock >= DIAS_INMOVILIZADA) senales.push("INMOVILIZADA");

  return senales.length > 0 ? senales : ["SIN_NOVEDAD"];
}

/** Promedio redondeado, o null si no hay de qué promediar. */
export function promedio(valores: number[]): number | null {
  if (valores.length === 0) return null;
  return Math.round(valores.reduce((total, valor) => total + valor, 0) / valores.length);
}
