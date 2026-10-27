/**
 * Cómo se reconoce a una persona entre consultas, tasaciones y solicitudes.
 *
 * Por email, porque es el único dato obligatorio en los tres formularios. Se
 * normaliza antes de comparar: "Juan@Mail.com " y "juan@mail.com" son la misma
 * casilla para cualquier proveedor real, y sin esto la misma persona quedaría
 * partida en dos contactos según cómo la haya tipeado ese día.
 *
 * La migración que creó la tabla aplica la misma regla en SQL
 * (`LOWER(TRIM(email))`): si esto cambia, los contactos viejos dejan de
 * coincidir con los nuevos.
 */
export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Lo que un pedido nuevo aporta a su contacto. */
export interface DatosDeContacto {
  email: string;
  nombre: string;
  telefono?: string | null;
}

/**
 * Qué se guarda en el contacto al llegar un pedido nuevo: el nombre siempre
 * (es el más reciente), y el teléfono solo si vino. Una consulta por email sin
 * teléfono no tiene por qué borrar el número que dejó en una tasación anterior.
 */
export function datosAActualizar(datos: DatosDeContacto): { nombre: string; telefono?: string } {
  const nombre = datos.nombre.trim();
  const telefono = datos.telefono?.trim();
  return telefono ? { nombre, telefono } : { nombre };
}
