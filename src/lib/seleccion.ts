/**
 * Listas de unidades que arma el visitante sin cuenta: las que guardó y las que
 * eligió para comparar.
 *
 * Las dos viven en el navegador (`localStorage`) y viajan al servidor en la URL
 * (`?ids=a,b,c`), así que todo lo que llega acá se trata como dato no
 * confiable: puede haberlo escrito cualquiera a mano o desde las herramientas
 * del navegador. Se queda solo lo que tiene forma de id, sin repetidos y con un
 * tope, antes de que llegue a Prisma como un `IN`.
 *
 * Son funciones puras, sin `window` ni base de datos, para poder probarlas.
 */

/** Unidades que se pueden guardar. Un tope que nadie que esté eligiendo auto alcanza. */
export const MAXIMO_GUARDADOS = 30;

/** De a cuántas se compara. Con cuatro columnas la tabla ya no entra en un teléfono. */
export const MAXIMO_COMPARAR = 3;
export const MINIMO_COMPARAR = 2;

/**
 * Forma de los ids de `Vehiculo` (cuid: minúsculas y dígitos). No hace falta
 * reconocer exactamente un cuid —el servidor igual busca en la base—, alcanza
 * con descartar lo que claramente no lo es.
 */
const FORMA_DE_ID = /^[a-z0-9]{20,32}$/;

export function esIdValido(valor: unknown): valor is string {
  return typeof valor === "string" && FORMA_DE_ID.test(valor);
}

/** Válidos, sin repetidos y como mucho `maximo`, conservando el orden. */
export function depurarIds(valores: unknown[], maximo: number): string[] {
  const vistos = new Set<string>();
  for (const valor of valores) {
    if (vistos.size >= maximo) break;
    if (esIdValido(valor)) vistos.add(valor);
  }
  return [...vistos];
}

/** Lo que haya quedado guardado en el navegador, que puede ser cualquier cosa. */
export function idsGuardados(crudo: string | null, maximo: number): string[] {
  if (!crudo) return [];
  try {
    const leido: unknown = JSON.parse(crudo);
    return Array.isArray(leido) ? depurarIds(leido, maximo) : [];
  } catch {
    return [];
  }
}

/** El `?ids=` de la URL. Acepta tanto `ids=a,b` como `ids=a&ids=b`. */
export function idsDeUrl(valor: string | string[] | undefined, maximo: number): string[] {
  if (!valor) return [];
  const partes = (Array.isArray(valor) ? valor : [valor]).flatMap((v) => v.split(","));
  return depurarIds(
    partes.map((p) => p.trim()),
    maximo,
  );
}

/** El `?ids=` para armar un enlace. */
export function urlConIds(ruta: string, ids: string[]): string {
  return ids.length > 0 ? `${ruta}?ids=${ids.join(",")}` : ruta;
}

/**
 * Agrega o quita una unidad. Lo último que se agrega va primero, que es el
 * orden en que el visitante espera encontrar lo que acaba de guardar.
 *
 * Con la lista llena no se agrega nada: sacar en silencio la más vieja sería
 * perderle una unidad que eligió sin que se entere.
 */
export function alternarId(ids: string[], id: string, maximo: number): string[] {
  if (ids.includes(id)) return ids.filter((otro) => otro !== id);
  if (ids.length >= maximo || !esIdValido(id)) return ids;
  return [id, ...ids];
}

export function mismasListas(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((id, i) => id === b[i]);
}
