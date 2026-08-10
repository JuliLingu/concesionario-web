import { headers } from "next/headers";

/**
 * Limitador de intentos por ventana fija, en memoria.
 *
 * Cubre el caso que importa acá: un atacante probando contraseñas o inundando
 * los formularios públicos desde un puñado de orígenes. No pretende ser un
 * limitador distribuido — el contador vive en el proceso, así que con varias
 * instancias cada una lleva el suyo y el cupo efectivo se multiplica por el
 * número de instancias. Si el sitio pasa a correr replicado, esto se
 * reemplaza por Redis (@upstash/ratelimit) manteniendo la misma interfaz.
 */

type Ventana = { cuenta: number; expira: number };

export type Regla = {
  /** Intentos permitidos dentro de la ventana. */
  cupo: number;
  /** Duración de la ventana en milisegundos. */
  ventanaMs: number;
};

const MINUTO = 60_000;
const HORA = 60 * MINUTO;

/**
 * Reglas del sitio. Los dos cupos del login son complementarios: el de IP corta
 * el barrido de muchas cuentas desde un origen, y el de cuenta corta el ataque
 * distribuido contra una cuenta concreta (que es el que importa, porque el
 * objetivo real es el único usuario ADMIN).
 */
export const REGLAS = {
  LOGIN_POR_IP: { cupo: 10, ventanaMs: 15 * MINUTO },
  LOGIN_POR_CUENTA: { cupo: 5, ventanaMs: 15 * MINUTO },
  REGISTRO_POR_IP: { cupo: 3, ventanaMs: HORA },
  CONSULTA_POR_IP: { cupo: 5, ventanaMs: HORA },
  SOLICITUD_POR_IP: { cupo: 3, ventanaMs: HORA },
} as const satisfies Record<string, Regla>;

const globalParaLimites = globalThis as unknown as {
  limitesDeIntentos: Map<string, Ventana> | undefined;
};

// Igual que con el cliente de Prisma: en desarrollo el hot reload reevalúa el
// módulo, y sin esto cada recarga vaciaría los contadores.
const limites = globalParaLimites.limitesDeIntentos ?? new Map<string, Ventana>();
if (process.env.NODE_ENV !== "production") {
  globalParaLimites.limitesDeIntentos = limites;
}

/**
 * Techo de claves distintas en memoria. Al superarlo se barren las vencidas;
 * si aun así no alcanza, se vacía todo. Preferimos perder los contadores antes
 * que dejar crecer el mapa sin límite: un atacante que rote la IP de origen no
 * debe poder convertir el limitador en una fuga de memoria.
 */
const MAXIMO_CLAVES = 10_000;

function purgarSiHaceFalta(ahora: number) {
  if (limites.size < MAXIMO_CLAVES) return;

  for (const [clave, ventana] of limites) {
    if (ventana.expira <= ahora) limites.delete(clave);
  }
  if (limites.size >= MAXIMO_CLAVES) limites.clear();
}

/**
 * Segundos que faltan para que la clave vuelva a tener cupo. Devuelve 0 si
 * todavía puede intentar. No consume cupo: para eso está `registrarIntento`.
 */
export function esperaRestante(clave: string, regla: Regla): number {
  const ventana = limites.get(clave);
  const ahora = Date.now();

  if (!ventana || ventana.expira <= ahora) return 0;
  if (ventana.cuenta < regla.cupo) return 0;

  return Math.ceil((ventana.expira - ahora) / 1000);
}

/** Suma un intento a la clave, abriendo una ventana nueva si la anterior venció. */
export function registrarIntento(clave: string, regla: Regla): void {
  const ahora = Date.now();
  purgarSiHaceFalta(ahora);

  const ventana = limites.get(clave);

  if (!ventana || ventana.expira <= ahora) {
    limites.set(clave, { cuenta: 1, expira: ahora + regla.ventanaMs });
    return;
  }

  ventana.cuenta += 1;
}

/** Borra el historial de una clave. Se usa tras un inicio de sesión correcto. */
export function limpiarIntentos(clave: string): void {
  limites.delete(clave);
}

/**
 * IP del cliente según las cabeceras del proxy.
 *
 * Ojo con la confianza: `x-forwarded-for` lo puede falsificar cualquiera si la
 * aplicación queda expuesta sin un proxy que reescriba la cabecera. Por eso los
 * límites por IP son la primera barrera pero nunca la única — el límite por
 * cuenta del login no se puede evadir rotando este valor.
 */
export async function ipDelCliente(): Promise<string> {
  const cabeceras = await headers();

  // El primer valor de la lista es el cliente original; el resto son los proxies.
  const reenviada = cabeceras.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (reenviada) return reenviada;

  return cabeceras.get("x-real-ip")?.trim() || "ip-desconocida";
}

/** Mensaje uniforme para cuando se agota el cupo. */
export function mensajeDeEspera(segundos: number): string {
  const minutos = Math.ceil(segundos / 60);
  return minutos <= 1
    ? "Demasiados intentos. Esperá un minuto y probá de nuevo."
    : `Demasiados intentos. Esperá ${minutos} minutos y probá de nuevo.`;
}
