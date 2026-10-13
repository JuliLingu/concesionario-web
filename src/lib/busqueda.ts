/**
 * Búsqueda por texto del catálogo.
 *
 * Los filtros de la barra lateral solo sirven si uno ya sabe cómo está
 * clasificado el stock: quien busca "Amarok" tiene que deducir que eso es una
 * Volkswagen y tildar la marca. Acá se resuelve la otra mitad —escribir lo que
 * uno tiene en la cabeza— y convive con los filtros: la búsqueda recorta lo que
 * los filtros ya dejaron pasar.
 *
 * Vive en `lib` y no en la página porque la usan los dos lados: el servidor para
 * armar el `where`, y el cuadro de búsqueda —que es de cliente— para normalizar
 * lo tipeado antes de escribirlo en la URL. Que ambos apliquen la misma
 * normalización es lo que evita que el input se pelee con el valor que vuelve
 * del servidor mientras alguien escribe.
 */

import type { Prisma } from "../../generated/prisma";

/** Ninguna búsqueda legítima se acerca; el resto es alguien probando la URL. */
export const LARGO_MAXIMO_BUSQUEDA = 60;

/**
 * Cada término suma un OR sobre cuatro columnas. Media docena alcanza para
 * "vw amarok 2020 highline v6" y pone un techo a lo que puede pedir una URL
 * escrita a mano.
 */
export const MAXIMO_TERMINOS = 6;

/**
 * `%` y `_` son comodines de LIKE y Prisma no los escapa dentro de `contains`:
 * buscar "%" traería el catálogo entero y "____" cualquier texto de cuatro
 * letras. Se descartan junto con la barra invertida —el escape de LIKE, cuyo
 * significado depende del `sql_mode` del servidor— en lugar de escaparlos,
 * porque ninguno de los tres aparece jamás en el nombre de un auto.
 */
const COMODINES_LIKE = /[%_\\]/g;

/** Un término de cuatro dígitos con pinta de año se compara también contra `anio`. */
const PARECE_ANIO = /^(19|20)\d{2}$/;

/**
 * Términos de la búsqueda, ya saneados.
 *
 * Acepta la forma cruda del parámetro de la URL —que puede venir repetido, y
 * entonces llega como arreglo— y devuelve las palabras sueltas. Una búsqueda
 * vacía es un arreglo vacío, que es lo mismo que no haber buscado nada.
 */
export function terminosDeBusqueda(valor: string | string[] | undefined): string[] {
  const texto = Array.isArray(valor) ? valor[0] : valor;
  if (!texto) return [];

  return texto
    .slice(0, LARGO_MAXIMO_BUSQUEDA)
    .replace(COMODINES_LIKE, " ")
    .split(/\s+/)
    .filter((termino) => termino.length > 0)
    .slice(0, MAXIMO_TERMINOS);
}

/**
 * La búsqueda tal como se escribe en la URL y se muestra en el cuadro: los
 * mismos términos separados por un espacio.
 */
export function textoDeBusqueda(valor: string | string[] | undefined): string {
  return terminosDeBusqueda(valor).join(" ");
}

/**
 * Condiciones de la búsqueda, una por término, para combinar con `AND`.
 *
 * Los términos se cruzan con Y y las columnas con O: "ford ranger" pide una
 * unidad donde *ambas* palabras aparezcan en algún lado, no una donde aparezca
 * cualquiera de las dos. Al revés, escribir la segunda palabra ampliaría el
 * resultado en vez de achicarlo, que es exactamente lo contrario de lo que
 * espera quien sigue tecleando.
 *
 * Se busca en marca, modelo y versión, y en el año cuando el término tiene
 * pinta de serlo —"Amarok 2020" es una búsqueda de las normales y sin esto no
 * devolvería nada—. La descripción queda afuera a propósito: es texto libre
 * donde el vendedor compara con otros modelos ("similar a una Hilux"), y
 * meterla haría que buscar Hilux devuelva camionetas que no lo son.
 *
 * El `contains` se traduce a `LIKE '%termino%'`, que no puede usar índices y
 * recorre la tabla. Es aceptable acá: el stock de una concesionaria son decenas
 * o cientos de filas, no millones. Tampoco hace falta normalizar mayúsculas: las
 * tablas se crean con `utf8mb4_unicode_ci`, así que la comparación las ignora
 * —está probado contra la base— y por la misma colación tampoco distingue
 * acentos.
 */
export function condicionesDeBusqueda(terminos: string[]): Prisma.VehiculoWhereInput[] {
  return terminos.map((termino) => {
    const columnas: Prisma.VehiculoWhereInput[] = [
      { marca: { contains: termino } },
      { modelo: { contains: termino } },
      { version: { contains: termino } },
    ];

    if (PARECE_ANIO.test(termino)) columnas.push({ anio: Number(termino) });

    return { OR: columnas };
  });
}
