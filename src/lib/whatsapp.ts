/**
 * Enlaces a WhatsApp armados con el teléfono cargado en /dashboard/settings.
 *
 * wa.me espera el número en formato internacional y sin separadores, así que
 * se descarta todo lo que no sea un dígito (espacios, guiones, paréntesis y
 * el "+" con el que se suele escribir el prefijo del país).
 */
export function whatsappUrl(telefono: string, mensaje: string) {
  const numero = telefono.replace(/\D/g, "");
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}
