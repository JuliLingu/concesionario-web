import { after } from "next/server";
import { revalidateTag, unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/services/cache.service";
import { registrarError } from "@/lib/log";
import {
  REGLAS,
  esperaRestante,
  ipDelCliente,
  registrarIntento,
} from "@/lib/rate-limit";
import {
  configuracionBusquedaIa,
  consultarBusquedaIa,
  reindexarBusquedaIa,
  type FiltrosIa,
} from "@/lib/busqueda-ia";

/**
 * Qué pasó con una búsqueda con IA, en los términos en que le importa a la
 * página: con resultado, sin servicio (caído, lento o sin configurar) o con el
 * cupo agotado. Ninguno de los dos últimos es un error para el visitante: el
 * catálogo se muestra igual, con un aviso.
 */
export type BusquedaIa =
  | { estado: "ok"; ids: string[]; filtros: FiltrosIa }
  | { estado: "no-disponible" }
  | { estado: "limite" };

/**
 * La misma frase devuelve lo mismo mientras el stock no cambie, y cada página
 * del paginado vuelve a renderizar la búsqueda: sin caché, pasar a la página 2
 * sería otra llamada al modelo.
 *
 * Una falla lanza y no se guarda, así el reintento siguiente vuelve a probar.
 * El tag se invalida después de reindexar (ver `reindexarDespuesDeResponder`);
 * los diez minutos son el techo por si esa invalidación no llega.
 */
const consultarConCache = unstable_cache(
  async (texto: string) => consultarBusquedaIa(texto),
  ["busqueda-ia"],
  { tags: [CACHE_TAGS.BUSQUEDA_IA], revalidate: 600 },
);

/** La búsqueda con IA existe en esta instalación (hay servicio configurado). */
export function busquedaIaDisponible(): boolean {
  return configuracionBusquedaIa() !== null;
}

export async function buscarConIa(texto: string): Promise<BusquedaIa> {
  if (!busquedaIaDisponible()) return { estado: "no-disponible" };

  const ip = await ipDelCliente();
  const claveOrigen = `busqueda-ia:${ip}`;
  const claveFrase = `busqueda-ia:frase:${ip}:${texto.toLowerCase()}`;

  // Una frase que este origen ya buscó en la última hora no cuenta de nuevo:
  // es el paginado, el botón de atrás o una recarga.
  const yaContada = esperaRestante(claveFrase, REGLAS.BUSQUEDA_IA_REPETIDA) > 0;
  if (!yaContada) {
    if (esperaRestante(claveOrigen, REGLAS.BUSQUEDA_IA_POR_IP) > 0) return { estado: "limite" };
    registrarIntento(claveOrigen, REGLAS.BUSQUEDA_IA_POR_IP);
    registrarIntento(claveFrase, REGLAS.BUSQUEDA_IA_REPETIDA);
  }

  try {
    const { ids, filtros } = await consultarConCache(texto);
    return { estado: "ok", ids, filtros };
  } catch (error) {
    registrarError("buscarConIa", error);
    return { estado: "no-disponible" };
  }
}

/**
 * Avisa al servicio que el stock cambió. Lo llaman las acciones que tocan algo
 * que el servicio indexa: unidades, cotización, precios a la vista.
 *
 * Corre con `after`, una vez que el administrador ya tiene su respuesta: el
 * servicio tiene que pedir el inventario y embeddear lo nuevo, y eso no puede
 * demorar el "Guardado". Si falla se registra y nada más; el guardado ya ocurrió
 * y el índice se pone al día con el próximo cambio.
 *
 * La caché de búsquedas se invalida dos veces a propósito. Ya mismo, para que
 * nadie siga viendo resultados de antes del cambio. Y de nuevo al terminar de
 * reindexar, porque una búsqueda hecha mientras el servicio reindexaba pudo
 * guardar en caché la respuesta del índice viejo.
 */
export function reindexarDespuesDeResponder(): void {
  if (!busquedaIaDisponible()) return;

  revalidateTag(CACHE_TAGS.BUSQUEDA_IA, { expire: 0 });

  after(async () => {
    try {
      await reindexarBusquedaIa();
      revalidateTag(CACHE_TAGS.BUSQUEDA_IA, { expire: 0 });
    } catch (error) {
      registrarError("reindexarBusquedaIa", error);
    }
  });
}
