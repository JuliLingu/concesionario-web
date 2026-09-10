/**
 * Aviso de métricas desde el navegador.
 *
 * Lo usan la ficha de vehículo (una visita) y el botón de WhatsApp (un click).
 * Nada de esto bloquea ni retrasa lo que el visitante quería hacer: si el aviso
 * no sale, no sale, y el catálogo funciona igual.
 */

const RUTA = "/api/metricas";

export type EventoMetrica = "vista" | "whatsapp";

/**
 * Lo ya avisado en esta sesión de navegación.
 *
 * El servidor tiene su propia ventana de media hora por origen y unidad —es la
 * que manda—, pero cortar acá evita el viaje de ida y vuelta cuando no hace
 * falta: el modo estricto de React monta cada efecto dos veces en desarrollo, y
 * volver a la misma ficha desde el catálogo no es una visita nueva.
 *
 * Vive en memoria a propósito. Guardarlo en `sessionStorage` sumaría una
 * segunda regla de deduplicación, con otra duración que la del servidor, y dos
 * criterios que no coinciden son peor que uno.
 */
const yaAvisado = new Set<string>();

export function avisarMetrica(vehiculoId: string, evento: EventoMetrica): void {
  const clave = `${evento}:${vehiculoId}`;
  if (yaAvisado.has(clave)) return;
  yaAvisado.add(clave);

  const cuerpo = JSON.stringify({ vehiculoId, evento });

  // `sendBeacon` es el único que garantiza el envío cuando la pestaña se está
  // yendo, que es exactamente el caso del click a WhatsApp. Devuelve false si el
  // navegador no lo pudo encolar.
  if (navigator.sendBeacon?.(RUTA, cuerpo)) return;

  // `keepalive` es el equivalente para los navegadores donde lo anterior falló.
  void fetch(RUTA, { method: "POST", body: cuerpo, keepalive: true }).catch(() => {});
}
