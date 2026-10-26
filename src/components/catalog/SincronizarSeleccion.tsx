"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { mismasListas, urlConIds } from "@/lib/seleccion";
import { useSeleccion } from "./useSeleccion";

/**
 * "Mis guardados": la lista está en el navegador y las unidades en la base.
 *
 * La página se renderiza en el servidor a partir de `?ids=`, como el
 * comparador, y este componente mantiene esa URL al día con lo guardado: si no
 * coinciden, la reemplaza y el servidor vuelve a renderizar. Así no hace falta
 * un endpoint para leer vehículos desde el cliente —una acción de servidor no
 * es para lecturas— y la grilla es la misma tarjeta del catálogo.
 *
 * Mientras no se sabe qué hay guardado (render del servidor, hidratación) o la
 * URL todavía no se puso al día, se muestra `cargando` en lugar de afirmar que
 * no hay nada.
 */
export const SincronizarGuardados = ({
  idsEnUrl,
  idsEncontrados,
  vacio,
  cargando,
  children,
}: {
  idsEnUrl: string[];
  /** Los de la URL que el servidor encontró visibles. */
  idsEncontrados: string[];
  vacio: React.ReactNode;
  cargando: React.ReactNode;
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const { ids, listo, reemplazar } = useSeleccion("guardados");
  const alDia = listo && mismasListas(ids, idsEnUrl);

  useEffect(() => {
    if (!listo) return;
    if (!mismasListas(ids, idsEnUrl)) {
      router.replace(urlConIds("/guardados", ids), { scroll: false });
      return;
    }
    // Lo que el servidor no devolvió ya no está a la vista del público (se dio
    // de baja, se pausó, pasó el plazo de vendida): se saca de la lista para
    // que el contador del encabezado no cuente unidades que no se muestran.
    const faltantes = ids.filter((id) => !idsEncontrados.includes(id));
    if (faltantes.length > 0) reemplazar(ids.filter((id) => !faltantes.includes(id)));
  }, [listo, ids, idsEnUrl, idsEncontrados, router, reemplazar]);

  if (!listo) return cargando;
  if (alDia) return ids.length === 0 ? vacio : children;
  // Se quitó una desde la grilla y la URL viene en camino: la grilla anterior
  // atenuada es mejor que un parpadeo a vacío.
  return idsEnUrl.length > 0 ? <div className="opacity-50 transition-opacity">{children}</div> : cargando;
};

/**
 * El comparador funciona al revés: manda la URL, que es lo que se comparte por
 * WhatsApp. Al abrirlo, la bandeja pasa a tener exactamente lo que se está
 * viendo, así quitar o agregar desde ahí sigue siendo coherente.
 */
export const SincronizarComparacion = ({ ids }: { ids: string[] }) => {
  const { ids: elegidos, listo, reemplazar } = useSeleccion("comparar");

  useEffect(() => {
    if (listo && !mismasListas(elegidos, ids)) reemplazar(ids);
  }, [listo, elegidos, ids, reemplazar]);

  return null;
};
