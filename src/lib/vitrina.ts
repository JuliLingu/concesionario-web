/**
 * Lo que la tarjeta y la ficha muestran además de los datos crudos de la unidad:
 * las etiquetas ("Nuevo ingreso", "Bajo km"...), el precio en su moneda con la
 * referencia en pesos, y la cuota mínima cuando la unidad se financia.
 *
 * Vive en `lib` y no en el componente porque cada regla tiene un umbral que hay
 * que poder leer y probar sin montar una tarjeta: qué cuenta como "nuevo
 * ingreso" o como "bajo kilometraje" es una decisión comercial, no de diseño.
 */
import { Moneda } from "../../generated/prisma";
import { formatArs, formatUsd, precioEnPesos } from "./precio";

/** Días desde el alta durante los que una unidad se anuncia como nuevo ingreso. */
export const DIAS_NUEVO_INGRESO = 14;

/**
 * Un usado es "bajo km" si cumple las dos cosas: pocos kilómetros en total y
 * pocos por año de uso. Solo el total premiaría a un 0 km de agencia de un año
 * con 45.000 km; solo el promedio, a un auto de 2008 con 150.000.
 */
export const BAJO_KM_TOTAL = 50_000;
export const BAJO_KM_POR_ANIO = 10_000;

/**
 * Anticipo con el que se calcula el "desde $X/mes" de la tarjeta. Es el mismo
 * con el que arranca el simulador de la ficha: la cuota que promete la tarjeta
 * tiene que poder encontrarse ahí sin tocar el anticipo, eligiendo el plan.
 */
export const ANTICIPO_POR_DEFECTO = 50;

export type Insignia = "VENDIDO" | "NUEVO_INGRESO" | "FINANCIABLE" | "BAJO_KM";

interface DatosDeInsignias {
  publicacion: string;
  estado: string;
  anio: number;
  kilometraje: number;
  financiable: boolean;
  createdAt: Date;
}

/**
 * Etiquetas de una unidad, en el orden en que se muestran.
 *
 * Una vendida lleva solo esa: anunciarla además como financiable o nuevo
 * ingreso invita a consultar por algo que ya no está. `financiacionActiva` va
 * aparte porque la marca de la unidad no alcanza: con el módulo apagado nadie
 * puede pedir el crédito.
 */
export function insigniasDeVehiculo(
  v: DatosDeInsignias,
  financiacionActiva: boolean,
  ahora: Date = new Date(),
): Insignia[] {
  if (v.publicacion === "VENDIDO") return ["VENDIDO"];

  const insignias: Insignia[] = [];

  const diasDesdeAlta = (ahora.getTime() - v.createdAt.getTime()) / 86_400_000;
  if (diasDesdeAlta <= DIAS_NUEVO_INGRESO) insignias.push("NUEVO_INGRESO");

  if (financiacionActiva && v.financiable) insignias.push("FINANCIABLE");

  // Un 0 km no es "bajo km": es nuevo, y ya lo dice su condición.
  if (v.estado === "USADO") {
    const aniosDeUso = Math.max(1, ahora.getFullYear() - v.anio);
    if (
      v.kilometraje <= BAJO_KM_TOTAL &&
      v.kilometraje / aniosDeUso <= BAJO_KM_POR_ANIO
    ) {
      insignias.push("BAJO_KM");
    }
  }

  return insignias;
}

export const ETIQUETA_INSIGNIA: Record<Insignia, string> = {
  VENDIDO: "Vendido",
  NUEVO_INGRESO: "Nuevo ingreso",
  FINANCIABLE: "Financiable",
  BAJO_KM: "Bajo km",
};

/**
 * Precio para la vitrina: el importe en la moneda en que se publicó y, si es en
 * dólares, la referencia en pesos debajo. Quien compra un usado compara en
 * dólares; el equivalente en pesos es un dato de apoyo, no el precio.
 *
 * Sin cotización cargada el secundario es null: no se inventa un importe.
 */
export function precioDeVitrina(
  precio: number,
  moneda: Moneda,
  cotizacionDolar?: number | null,
): { principal: string; secundario: string | null } {
  if (moneda === Moneda.ARS) return { principal: formatArs(precio), secundario: null };

  const pesos = precioEnPesos(precio, moneda, cotizacionDolar);
  return {
    principal: formatUsd(precio),
    secundario: pesos === null ? null : `≈ ${formatArs(pesos)}`,
  };
}

export interface PlanDeCuotas {
  cuotas: number;
  tasaAnual: number;
}

/**
 * Cuota fija mensual con interés simple sobre el saldo, como la calcula el
 * simulador de la ficha.
 */
export function cuotaMensual(
  precioArs: number,
  anticipoPorcentaje: number,
  plan: PlanDeCuotas,
): number {
  const capital = precioArs * (1 - anticipoPorcentaje / 100);
  const total = capital + capital * (plan.tasaAnual / 100) * (plan.cuotas / 12);
  return total / plan.cuotas;
}

/**
 * La cuota más baja que ofrecen los planes activos con el anticipo por defecto.
 * Null si no hay planes o si el precio no se puede pasar a pesos.
 */
export function cuotaDesde(
  precioArs: number | null,
  planes: PlanDeCuotas[],
): number | null {
  if (precioArs === null || planes.length === 0) return null;
  return Math.min(
    ...planes.map((plan) => cuotaMensual(precioArs, ANTICIPO_POR_DEFECTO, plan)),
  );
}
