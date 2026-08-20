/**
 * Constantes compartidas del catálogo.
 *
 * Viven acá y no en la página porque las necesitan tanto el servidor —para
 * validar el parámetro `sort` de la URL y armar el `orderBy`— como el
 * desplegable de orden, que es de cliente. Antes viajaban como prop desde la
 * página hasta el componente, serializadas en el HTML de cada request.
 */

export const ITEMS_PER_PAGE = 9;

export const SORT_OPTIONS = [
  { value: "newest",     label: "Más Recientes"    },
  { value: "oldest",     label: "Más Antiguos"     },
  { value: "price_asc",  label: "Menor Precio"     },
  { value: "price_desc", label: "Mayor Precio"     },
  { value: "km_asc",     label: "Menor Kilometraje" },
  { value: "km_desc",    label: "Mayor Kilometraje" },
  { value: "year_desc",  label: "Año (más nuevo)"  },
  { value: "year_asc",   label: "Año (más antiguo)" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number];
export type SortValue = SortOption["value"];

/** Criterios que ordenan por importe: no aplican si la concesionaria oculta los precios. */
const ORDENES_POR_PRECIO: SortValue[] = ["price_asc", "price_desc"];

export function esOrdenPorPrecio(sort: SortValue) {
  return ORDENES_POR_PRECIO.includes(sort);
}

/**
 * Opciones del desplegable de orden. Con los precios ocultos se caen las dos que
 * ordenan por importe: sin precio a la vista no significan nada, y ordenar por
 * él dejaría adivinar cuál unidad es más cara.
 */
export function opcionesDeOrden(mostrarPrecios: boolean): readonly SortOption[] {
  return mostrarPrecios
    ? SORT_OPTIONS
    : SORT_OPTIONS.filter((opcion) => !esOrdenPorPrecio(opcion.value));
}
