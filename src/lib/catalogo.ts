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

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];
