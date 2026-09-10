/**
 * Nombres legibles de los enums del vehículo.
 *
 * Estaban repetidos en cada pantalla que los mostraba, con la misma mezcla de
 * mapa parcial y `capitalizar()` para el resto. Eso alcanzaba mientras solo los
 * leyera una persona en pantalla; ahora también los lee Google —van en el
 * título, en la descripción y en el JSON-LD de cada ficha—, así que conviene
 * que digan lo mismo en todos lados y estén escritos correctamente.
 */
import { Combustible, EstadoVehiculo, Transmision } from "../../generated/prisma";

/** Primera letra en mayúscula, el resto en minúscula: "NAFTA" → "Nafta". */
function capitalizar(valor: string): string {
  return valor.charAt(0) + valor.slice(1).toLowerCase();
}

/**
 * Solo se declaran los que `capitalizar()` no resuelve bien: los que llevan
 * tilde y las siglas, que no son palabras y no se capitalizan.
 */
const ETIQUETAS: Record<string, string> = {
  AUTOMATICA: "Automática",
  CVT: "CVT",
  DIESEL: "Diésel",
  ELECTRICO: "Eléctrico",
  HIBRIDO: "Híbrido",
  GNC: "GNC",
};

/**
 * Etiqueta de cualquier valor de enum del vehículo. Un valor sin entrada propia
 * se capitaliza, que es lo correcto para "MANUAL", "NAFTA", "NUEVO" y "USADO".
 */
export function etiquetaEnum(
  valor: Transmision | Combustible | EstadoVehiculo | string,
): string {
  return ETIQUETAS[valor] ?? capitalizar(valor);
}
