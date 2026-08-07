/**
 * Feature flags del sitio.
 *
 * Sirven para dejar funcionalidad completa pero apagada ("stand by"): el código,
 * las tablas y los datos siguen intactos, simplemente no se muestran ni se
 * pueden alcanzar desde la navegación.
 */

/**
 * Financiación: sección de la portada, simulador y formulario de crédito en la
 * ficha del vehículo, pestaña "Financiación" en configuración y las pantallas
 * de dashboard `/dashboard/planes` y `/dashboard/solicitudes`.
 *
 * Está apagada a la espera de lanzarla como feature del producto. Para
 * reactivarla alcanza con poner `true` acá (o definir
 * `NEXT_PUBLIC_FEATURE_FINANCIACION=true` en el entorno): no hace falta
 * restaurar nada, ni en la base ni en el código.
 */
export const FEATURE_FINANCIACION =
  process.env.NEXT_PUBLIC_FEATURE_FINANCIACION === "true";
