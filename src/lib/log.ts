/**
 * Registro de errores del servidor.
 *
 * `console.error(error)` vuelca el objeto entero, y los errores de Prisma
 * traen la consulta renderizada con sus argumentos: basta con que una acción
 * maneje un DNI o una contraseña para que ese dato termine en el agregador de
 * logs. Acá se registra lo que sirve para diagnosticar —de dónde vino, de qué
 * tipo es y el código de Prisma— sin arrastrar los datos de entrada.
 *
 * El stack se conserva porque es lo que permite ubicar el fallo y no contiene
 * valores del usuario.
 */

/** Primera línea del mensaje, recortada: el resto suele ser la consulta. */
function resumirMensaje(mensaje: string): string {
  const primeraLinea = mensaje.split("\n").find((linea) => linea.trim().length > 0) ?? "";
  return primeraLinea.trim().slice(0, 200);
}

/**
 * Solo los marcos del stack (`at ...`).
 *
 * `error.stack` arranca repitiendo el mensaje completo, así que volcarlo entero
 * devolvería al log justo lo que se está tratando de dejar fuera. Las líneas
 * `at` son rutas de código, no datos de nadie.
 */
function marcosDelStack(stack: string): string {
  return stack
    .split("\n")
    .filter((linea) => linea.trim().startsWith("at "))
    .slice(0, 12)
    .join("\n");
}

export function registrarError(contexto: string, error: unknown): void {
  if (error instanceof Error) {
    // `code` lo traen los errores de Prisma (P2002, P2025, ...) y es lo más
    // informativo que se puede registrar sin riesgo.
    const codigo = (error as { code?: string }).code;

    console.error(
      `[${contexto}] ${error.name}${codigo ? ` (${codigo})` : ""}: ${resumirMensaje(error.message)}`,
    );
    if (error.stack) {
      const marcos = marcosDelStack(error.stack);
      if (marcos) console.error(marcos);
    }
    return;
  }

  console.error(`[${contexto}] error no estándar: ${resumirMensaje(String(error))}`);
}
