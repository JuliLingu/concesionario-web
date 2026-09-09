/**
 * Código corto con el que una tasación se identifica fuera del panel.
 *
 * El visitante manda las fotos por WhatsApp desde su teléfono, que no tiene por
 * qué ser el número que dejó en el formulario. Sin un código, al vendedor le
 * entra un chat de un desconocido con cuatro fotos de un auto y no sabe a qué
 * fila del panel corresponde: tiene que escribir para preguntar, que es
 * justamente el ida y vuelta que este módulo viene a evitar.
 *
 * Se deriva del id en vez de guardarse en su propia columna: un cuid ya termina
 * en caracteres aleatorios, así que los últimos seis alcanzan de sobra para
 * distinguir tasaciones dentro de una misma concesionaria, y así no hace falta
 * ni columna nueva ni migración.
 */
export function codigoDeReferencia(id: string): string {
  return id.slice(-6).toUpperCase();
}
