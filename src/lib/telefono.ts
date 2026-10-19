/**
 * Teléfonos argentinos: validación y forma única de guardarlos.
 *
 * El mismo celular llega escrito de diez maneras: "11 2345-6789",
 * "011 15 2345-6789", "+54 9 11 2345 6789", "(0351) 15-555-1234". Guardado así,
 * el enlace de WhatsApp del panel funcionaba con unos y no con otros, porque
 * wa.me espera el número internacional exacto: 54 + 9 + área + número.
 *
 * Todo se lleva a esa forma (`+5491123456789`). Se asume celular porque es lo
 * que la gente deja en un formulario, y porque el panel lo usa para WhatsApp.
 * La función es idempotente: normalizar algo ya normalizado devuelve lo mismo,
 * que es lo que necesita el esquema para volver a validar su propia salida.
 */

/** Dígitos de un número nacional: código de área + número, sin 0 ni 15. */
const DIGITOS_NACIONALES = 10;

export type ResultadoTelefono =
  | { ok: true; valor: string }
  | { ok: false; error: string };

export const ERROR_SIN_AREA = "Agregá el código de área (ej: 11 o 351)";
export const ERROR_TELEFONO =
  "Revisá el número: código de área + número, sin el 0 ni el 15";

/**
 * Saca el "15" que se escribe después del código de área. Los códigos de
 * área argentinos tienen 2 a 4 dígitos y suman 10 con el número local, así que
 * con 12 dígitos sobra justo un "15" y se busca dónde está.
 *
 * El único código de dos dígitos es el 11; el resto empieza con 2 o 3 y tiene
 * tres o cuatro. Si el 15 calza tanto en la posición 3 como en la 4, se toma
 * la 3, que es la de las ciudades más grandes (351, 341, 261...).
 */
function sinQuince(digitos: string): string | null {
  const largosDeArea = digitos.startsWith("11") ? [2] : [3, 4];
  for (const largo of largosDeArea) {
    if (digitos.slice(largo, largo + 2) === "15") {
      return digitos.slice(0, largo) + digitos.slice(largo + 2);
    }
  }
  return null;
}

export function normalizarTelefonoAr(texto: string): ResultadoTelefono {
  let d = texto.replace(/\D/g, "");

  // Prefijo internacional (54) y el 9 de celular que va detrás.
  if (d.startsWith("54") && d.length >= 12) d = d.slice(2);
  if (d.startsWith("9") && d.length === DIGITOS_NACIONALES + 1) d = d.slice(1);

  // El 0 de larga distancia nacional.
  if (d.startsWith("0")) d = d.slice(1);

  if (d.length === DIGITOS_NACIONALES + 2) {
    const sin15 = sinQuince(d);
    if (!sin15) return { ok: false, error: ERROR_TELEFONO };
    d = sin15;
  }

  // Un número local sin área ("2345-6789", o "15 2345-6789") queda corto o
  // empieza con 15, que no es un código de área.
  if (d.length < DIGITOS_NACIONALES || d.startsWith("15")) {
    return { ok: false, error: ERROR_SIN_AREA };
  }
  if (d.length !== DIGITOS_NACIONALES) return { ok: false, error: ERROR_TELEFONO };

  // Los códigos de área empiezan con 2 o 3, salvo el 11.
  if (!/^(11|[23])/.test(d)) return { ok: false, error: ERROR_TELEFONO };

  return { ok: true, valor: `+549${d}` };
}

/**
 * Enlace de WhatsApp a un cliente, desde el panel. Null si el número guardado
 * no se puede interpretar (filas viejas, cargadas antes de normalizar): quien
 * llama muestra solo el teléfono, en vez de un enlace que abre un chat vacío.
 */
export function whatsappDeCliente(telefono: string | null | undefined): string | null {
  if (!telefono) return null;
  const resultado = normalizarTelefonoAr(telefono);
  return resultado.ok ? `https://wa.me/${resultado.valor.slice(1)}` : null;
}
