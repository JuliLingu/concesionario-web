/**
 * Arma URLs de Cloudinary con transformaciones de entrega.
 *
 * La decisión importante acá es el modo de encuadre:
 *
 * - `recorte`   recorta a la relación pedida desde el centro geométrico. Se usa
 *               en grillas y miniaturas, donde todas las tarjetas tienen que
 *               medir lo mismo. Recorta con `g_center` y no con `g_auto`: el
 *               recorte automático elige la zona por saliencia y en fotos de
 *               vehículos suele quedarse con un reflejo o con algo del fondo,
 *               dejando el auto descentrado.
 * - `completa`  no descarta un solo píxel: escala la foto y rellena hasta llegar
 *               a la relación pedida. El relleno lo saca Cloudinary del borde de
 *               la propia imagen, así que no se ven barras de un color ajeno.
 * - `original`  la imagen tal cual se subió, sólo optimizada. Para el visor.
 */

type Relacion = "4:3" | "16:9" | "1:1";
type Modo = "recorte" | "completa" | "original";

interface OpcionesImagen {
  modo?: Modo;
  relacion?: Relacion;
}

/** Formato y calidad negociados por Cloudinary según el navegador. */
const OPTIMIZACION = "f_auto,q_auto";

/**
 * Color del relleno en modo `completa`. `b_auto` lo deduce del borde de la
 * imagen. Si la cuenta de Cloudinary no lo habilitara, alcanza con cambiarlo
 * por un color fijo (por ejemplo `b_rgb:f4f4f5`).
 */
const RELLENO = "b_auto";

// Un segmento de la URL es una transformación si todas sus partes separadas por
// coma tienen forma de parámetro (`c_fill`, `ar_4:3`, ...). La versión (`v1234`)
// y los nombres de carpeta no la tienen.
const PARAMETRO = /^(c|g|w|h|ar|b|f|q|e|r|o|a|z|x|y|dpr|fl|co|bo)_/;

function yaTieneTransformacion(segmento: string): boolean {
  return segmento.split(",").every((parte) => PARAMETRO.test(parte));
}

/**
 * Parte la URL en el punto donde se insertan las transformaciones.
 * Devuelve null si no es una URL de Cloudinary o si ya viene transformada
 * —en ese caso alguien ya eligió el encuadre y se respeta—.
 */
function partir(url: string): { base: string; resto: string } | null {
  if (!url || !url.includes("cloudinary.com")) return null;

  const corte = url.indexOf("/upload/");
  if (corte === -1) return null;

  const base = url.slice(0, corte + "/upload/".length);
  const resto = url.slice(corte + "/upload/".length);

  return yaTieneTransformacion(resto.split("/")[0]) ? null : { base, resto };
}

export function getCldUrl(
  url: string,
  { modo = "recorte", relacion = "4:3" }: OpcionesImagen = {},
): string {
  const partes = partir(url);
  if (!partes) return url;

  const { base, resto } = partes;

  const transformacion =
    modo === "original"
      ? OPTIMIZACION
      : modo === "completa"
        ? `c_pad,${RELLENO},ar_${relacion},${OPTIMIZACION}`
        : `c_fill,g_center,ar_${relacion},${OPTIMIZACION}`;

  return `${base}${transformacion}/${resto}`;
}

/**
 * Foto para la imagen de Open Graph: la que se ve en WhatsApp, Facebook o
 * Instagram cuando alguien comparte el enlace de una unidad.
 *
 * Dos diferencias con `getCldUrl`, y las dos importan:
 *
 * - Medida exacta en píxeles en lugar de una relación. La imagen social tiene
 *   un lienzo fijo de 1200×630, y pedir la foto original —que puede venir de
 *   4000 px— significaría descargar varios megas para descartarlos al escalar,
 *   dentro de una ruta que se genera del lado del servidor.
 * - `f_jpg` en vez de `f_auto`. `f_auto` elige el formato según la cabecera
 *   `Accept` de quien pide, y acá quien pide es el renderizador de la imagen,
 *   que no negocia: puede recibir AVIF o WebP y no sabe decodificarlos.
 */
export function getCldUrlOg(url: string, ancho: number, alto: number): string {
  const partes = partir(url);
  if (!partes) return url;

  return `${partes.base}c_fill,g_center,w_${ancho},h_${alto},f_jpg,q_auto/${partes.resto}`;
}
