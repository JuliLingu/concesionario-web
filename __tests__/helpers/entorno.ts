/**
 * Utilidades comunes a las pruebas.
 *
 * El limitador de intentos guarda sus contadores en un Map a nivel de módulo,
 * así que sobrevive de una prueba a la otra dentro del mismo archivo. En vez de
 * resetear módulos —que obliga a reimportar todo y vuelve las pruebas frágiles—
 * cada prueba pide su propio origen: claves distintas, contadores
 * independientes.
 */

let contador = 0;

/**
 * Forma con la que las acciones le contestan al formulario.
 *
 * Cada acción devuelve una unión de objetos distintos según por dónde salga
 * (`{ error }` o `{ success }`), y TypeScript no deja leer un campo que no está
 * en todas las ramas. Las pruebas quieren mirar las dos, así que se castea a
 * este tipo al llamar. No afloja nada del código: el tipo real de la acción se
 * sigue verificando en su propio archivo.
 */
export type ResultadoAccion = { success?: string | boolean; error?: string };

/**
 * Un origen distinto por llamada, para que cada prueba tenga su propio cupo.
 * El limitador trata la IP como una cadena cualquiera, así que no importa que
 * el último octeto se pase de 255.
 */
export function ipUnica(): string {
  contador += 1;
  return `10.0.0.${contador}`;
}

/** Un email distinto por llamada, para el cupo de login por cuenta. */
export function emailUnico(): string {
  contador += 1;
  return `probando${contador}@ejemplo.com`;
}
