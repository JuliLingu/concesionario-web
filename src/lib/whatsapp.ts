/**
 * Enlaces a WhatsApp armados con el teléfono cargado en /dashboard/settings.
 *
 * wa.me espera el número en formato internacional y sin separadores, así que
 * se descarta todo lo que no sea un dígito (espacios, guiones, paréntesis y
 * el "+" con el que se suele escribir el prefijo del país).
 *
 * Devuelve null si todavía no hay un teléfono cargado: quien llama esconde el
 * botón en lugar de enlazar a un wa.me sin destino.
 */
export function whatsappUrl(telefono: string, mensaje: string): string | null {
  const numero = telefono.replace(/\D/g, "");
  if (!numero) return null;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}
