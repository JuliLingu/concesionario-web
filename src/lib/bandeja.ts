/**
 * Reglas de la bandeja unificada del panel: consultas, tasaciones y
 * solicitudes de crédito en una sola lista, de la más nueva a la más vieja.
 *
 * Son tres tablas distintas —cada pedido tiene sus propios datos— que se leen
 * por separado y se mezclan acá. Funciones puras, sin base, para poder probar
 * el orden y la paginación sin levantar nada.
 */

export type TipoPedido = "CONSULTA" | "TASACION" | "SOLICITUD";

export const ETIQUETA_TIPO: Record<TipoPedido, string> = {
  CONSULTA: "Consulta",
  TASACION: "Tasación",
  SOLICITUD: "Crédito",
};

/** Pedidos por página. */
export const POR_PAGINA = 25;

/**
 * Tipos que la bandeja muestra según los módulos encendidos. Con tasación o
 * financiación apagadas, sus pedidos guardados siguen en la base pero no se
 * listan: es el mismo criterio que tenían sus pantallas propias.
 */
export function tiposActivos(modulos: {
  tasacionActiva: boolean;
  financiacionActiva: boolean;
}): TipoPedido[] {
  return [
    "CONSULTA",
    ...(modulos.tasacionActiva ? (["TASACION"] as const) : []),
    ...(modulos.financiacionActiva ? (["SOLICITUD"] as const) : []),
  ];
}

/** El `?tipo=` de la URL, solo si es uno de los activos. Si no, todos. */
export function tipoDeUrl(valor: string | undefined, activos: TipoPedido[]): TipoPedido | undefined {
  return activos.find((tipo) => tipo === valor);
}

/**
 * El `?antes=` de la URL: fecha del último pedido de la página anterior. Una
 * fecha inválida se ignora y se arranca desde el principio.
 */
export function cursorDeUrl(valor: string | undefined): Date | undefined {
  if (!valor) return undefined;
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? undefined : fecha;
}

/**
 * Mezcla listas ya ordenadas de la más nueva a la más vieja y corta una página.
 *
 * Cada tabla se pide con un elemento de más (`porPagina + 1`): si después de
 * mezclar sobra alguno, hay página siguiente. El cursor es la fecha del último
 * que se muestra, y la página siguiente pide lo estrictamente anterior.
 */
export function paginaMezclada<T extends { createdAt: Date }>(
  listas: T[][],
  porPagina: number = POR_PAGINA,
): { items: T[]; siguiente: Date | null } {
  const todos = listas.flat().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const items = todos.slice(0, porPagina);
  const siguiente = todos.length > porPagina ? items[items.length - 1].createdAt : null;
  return { items, siguiente };
}
