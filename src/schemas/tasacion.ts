import * as z from "zod";
import { Combustible, Moneda, Transmision } from "../../generated/prisma";

/**
 * Usado que un visitante ofrece al concesionario.
 *
 * Lo llena alguien de afuera, en un formulario abierto, así que todo campo
 * opcional puede llegar como cadena vacía desde el navegador y se normaliza a
 * null antes de tocar la base. Los topes de largo no son cosmética: sin ellos,
 * un script puede llenar la tabla con textos de megabytes.
 */

/**
 * Texto opcional: la cadena vacía se normaliza a null.
 *
 * El `.nullable()` no es decorativo. La acción vuelve a validar lo que le llega,
 * y lo que le llega es la salida de este mismo esquema —el resolver del
 * formulario ya transformó los campos vacíos en null—. Sin aceptar null, el
 * esquema no podría parsear su propio resultado y toda tasación con un campo
 * opcional vacío se rechazaría como "datos inválidos".
 */
const textoOpcional = (maximo: number, etiqueta: string) =>
  z
    .string()
    .trim()
    .max(maximo, `${etiqueta} es demasiado largo`)
    .optional()
    .nullable()
    .transform((valor) => (valor ? valor : null));

/**
 * Enum opcional. El `<select>` manda "" cuando el visitante no eligió nada, y
 * "" no es un valor del enum: sin este paso, no elegir sería un error de
 * validación en vez de "no lo sé", que es lo que quiere decir. Y `null` por lo
 * mismo que arriba: es lo que devuelve esta misma transformación.
 */
const combustibleOpcional = z
  .union([z.nativeEnum(Combustible), z.literal("")])
  .optional()
  .nullable()
  .transform((valor) => (valor ? valor : null));

const transmisionOpcional = z
  .union([z.nativeEnum(Transmision), z.literal("")])
  .optional()
  .nullable()
  .transform((valor) => (valor ? valor : null));

/**
 * Importe opcional. No se usa `z.coerce.number()` porque convierte la cadena
 * vacía en 0, y "no sé cuánto vale" quedaría guardado como "lo regalo".
 */
const importeOpcional = z
  .union([z.string(), z.number(), z.null()])
  .optional()
  .transform((valor) => {
    if (valor === null || valor === undefined || valor === "") return null;
    const numero = Number(valor);
    return Number.isNaN(numero) ? null : numero;
  })
  .refine((valor) => valor === null || valor >= 0, {
    message: "El importe no puede ser negativo",
  });

/** Tope de kilómetros. Por encima de esto es un error de tipeo, no un auto. */
const KILOMETRAJE_MAXIMO = 2_000_000;

export const TasacionSchema = z.object({
  // Quién ofrece
  nombre: z.string().trim().min(2, "El nombre es requerido").max(120, "El nombre es demasiado largo"),
  email: z.string().trim().email("Debe ser un email válido").max(160, "El email es demasiado largo"),
  telefono: z.string().trim().min(8, "El teléfono no es válido").max(40, "El teléfono no es válido"),

  // Qué ofrece
  marca: z.string().trim().min(1, "La marca es obligatoria").max(60, "La marca es demasiado larga"),
  modelo: z.string().trim().min(1, "El modelo es obligatorio").max(60, "El modelo es demasiado largo"),
  anio: z.coerce
    .number()
    .int("El año debe ser un número entero")
    .min(1900, "El año no es válido")
    .max(new Date().getFullYear() + 1, "El año no es válido"),
  kilometraje: z.coerce
    .number()
    .int("El kilometraje debe ser un número entero")
    .min(0, "El kilometraje no puede ser negativo")
    .max(KILOMETRAJE_MAXIMO, "El kilometraje no es válido"),
  version: textoOpcional(80, "La versión"),
  combustible: combustibleOpcional,
  transmision: transmisionOpcional,

  precioPretendido: importeOpcional,
  moneda: z.nativeEnum(Moneda).default(Moneda.USD),
  observaciones: textoOpcional(2000, "El comentario"),

  // Unidad del catálogo por la que quiere permutar. Llega de la URL o de un
  // desplegable, así que la acción lo verifica contra la base antes de guardar.
  vehiculoInteresId: textoOpcional(40, "La unidad"),
});

export type TasacionInput = z.input<typeof TasacionSchema>;
export type TasacionData = z.output<typeof TasacionSchema>;
