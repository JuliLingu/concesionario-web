"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  MAXIMO_COMPARAR,
  MAXIMO_GUARDADOS,
  alternarId,
  depurarIds,
  idsGuardados,
} from "@/lib/seleccion";

/**
 * Las dos listas que el visitante arma sin cuenta: las unidades que guardó y
 * las que eligió para comparar.
 *
 * Viven en `localStorage` y se leen con `useSyncExternalStore`, así cada botón
 * de corazón, el contador del encabezado y la bandeja del comparador ven la
 * misma lista sin pasarse props, y una pestaña se entera de lo que se guardó en
 * otra (el evento `storage`).
 *
 * En el servidor —y en el primer render del navegador, el de hidratación— la
 * lista es vacía: lo guardado solo se conoce del lado del cliente, y leerlo
 * durante ese render desfasaría el HTML. Por eso el hook devuelve `listo`, para
 * que quien tenga que distinguir "vacía" de "todavía no la leí" pueda hacerlo.
 *
 * `localStorage` puede no estar (modo privado, almacenamiento bloqueado): en
 * ese caso la lista vive en memoria mientras dure la pestaña.
 */

export type Lista = "guardados" | "comparar";

const CONFIG: Record<Lista, { clave: string; maximo: number }> = {
  guardados: { clave: "guardados:v1", maximo: MAXIMO_GUARDADOS },
  comparar: { clave: "comparar:v1", maximo: MAXIMO_COMPARAR },
};

const VACIA: string[] = [];

/**
 * Última lectura de cada lista. `useSyncExternalStore` exige que dos lecturas
 * seguidas sin cambios devuelvan el mismo arreglo —si no, vuelve a renderizar
 * para siempre—, así que solo se arma uno nuevo cuando cambia el texto guardado.
 */
const ultimaLectura = new Map<Lista, { crudo: string | null; ids: string[] }>();
/** Respaldo cuando `localStorage` no se deja usar. */
const enMemoria = new Map<Lista, string>();
const oyentes = new Set<() => void>();

function textoGuardado(lista: Lista): string | null {
  try {
    return window.localStorage.getItem(CONFIG[lista].clave);
  } catch {
    return enMemoria.get(lista) ?? null;
  }
}

function leer(lista: Lista): string[] {
  const crudo = textoGuardado(lista);
  const anterior = ultimaLectura.get(lista);
  if (anterior && anterior.crudo === crudo) return anterior.ids;

  const ids = idsGuardados(crudo, CONFIG[lista].maximo);
  ultimaLectura.set(lista, { crudo, ids });
  return ids;
}

function escribir(lista: Lista, ids: string[]) {
  const texto = JSON.stringify(depurarIds(ids, CONFIG[lista].maximo));
  try {
    window.localStorage.setItem(CONFIG[lista].clave, texto);
  } catch {
    enMemoria.set(lista, texto);
  }
  // El evento `storage` solo llega a las otras pestañas: a esta hay que avisarle.
  oyentes.forEach((avisar) => avisar());
}

function alCambiarEnOtraPestana(evento: StorageEvent) {
  const nuestra = Object.values(CONFIG).some((c) => c.clave === evento.key);
  // `key` null es un `localStorage.clear()`: también nos toca.
  if (evento.key === null || nuestra) oyentes.forEach((avisar) => avisar());
}

function suscribir(avisar: () => void) {
  if (oyentes.size === 0) window.addEventListener("storage", alCambiarEnOtraPestana);
  oyentes.add(avisar);
  return () => {
    oyentes.delete(avisar);
    if (oyentes.size === 0) window.removeEventListener("storage", alCambiarEnOtraPestana);
  };
}

const sinSuscripcion = () => () => {};

export function useSeleccion(lista: Lista) {
  const ids = useSyncExternalStore(
    suscribir,
    () => leer(lista),
    () => VACIA,
  );
  // true recién después de hidratar: ver el comentario del archivo.
  const listo = useSyncExternalStore(
    sinSuscripcion,
    () => true,
    () => false,
  );

  const { maximo } = CONFIG[lista];

  const alternar = useCallback(
    (id: string) => escribir(lista, alternarId(leer(lista), id, maximo)),
    [lista, maximo],
  );
  const reemplazar = useCallback((nuevos: string[]) => escribir(lista, nuevos), [lista]);

  return {
    ids,
    listo,
    maximo,
    lleno: ids.length >= maximo,
    tiene: (id: string) => ids.includes(id),
    alternar,
    reemplazar,
  };
}
