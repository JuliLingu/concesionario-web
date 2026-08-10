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

export function getCldUrl(
  url: string,
  { modo = "recorte", relacion = "4:3" }: OpcionesImagen = {},
): string {
  if (!url || !url.includes("cloudinary.com")) return url;

  const corte = url.indexOf("/upload/");
  if (corte === -1) return url;

  const base = url.slice(0, corte + "/upload/".length);
  const resto = url.slice(corte + "/upload/".length);

  // Si la URL ya viene transformada se respeta: alguien ya eligió el encuadre.
  if (yaTieneTransformacion(resto.split("/")[0])) return url;

  const transformacion =
    modo === "original"
      ? OPTIMIZACION
      : modo === "completa"
        ? `c_pad,${RELLENO},ar_${relacion},${OPTIMIZACION}`
        : `c_fill,g_center,ar_${relacion},${OPTIMIZACION}`;

  return `${base}${transformacion}/${resto}`;
}
