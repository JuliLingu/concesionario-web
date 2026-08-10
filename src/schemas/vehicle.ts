import * as z from "zod";
import { Transmision, Combustible, EstadoVehiculo, EstadoPublicacion, Moneda } from "../../generated/prisma";

/**
 * Origen admitido para las fotos de una unidad.
 *
 * Mismo criterio que `imagenOpcional` en el esquema de configuración: o es una
 * ruta del propio sitio, o es una imagen subida al Cloudinary de la cuenta.
 * Sin esto el campo aceptaba cualquier cadena, incluido un `javascript:`, y lo
 * único que impedía renderizarlo era la lista de `remotePatterns` de
 * next.config.ts — una defensa que se pierde en cuanto se cambia de componente
 * de imagen.
 */
const imagenDeVehiculo = z
  .string()
  .trim()
  .min(1, "La imagen no puede estar vacía")
  .max(2048, "La URL de la imagen es demasiado larga")
  .refine(
    (url) => url.startsWith("/") || url.startsWith("https://res.cloudinary.com/"),
    { message: "La imagen debe subirse desde el panel o ser una ruta local" },
  );

/** Tope de fotos por unidad. Cada una es una fila y un `<Image>` en la ficha. */
const MAXIMO_IMAGENES = 20;

export const VehicleSchema = z.object({
  categoriaId: z.string().min(1, "La categoría es obligatoria"),
  marca: z.string().min(1, "La marca es obligatoria"),
  modelo: z.string().min(1, "El modelo es obligatorio"),
  version: z.string().optional(),
  motor: z.string().optional(),
  anio: z.number().min(1900).max(new Date().getFullYear() + 1),
  precio: z.number().min(0, "El precio debe ser positivo"),
  moneda: z.nativeEnum(Moneda),
  kilometraje: z.number().min(0, "El kilometraje no puede ser negativo"),
  combustible: z.nativeEnum(Combustible),
  transmision: z.nativeEnum(Transmision),
  estado: z.nativeEnum(EstadoVehiculo),
  puertas: z.number().optional(),
  potencia: z.number().optional(),
  color: z.string().optional(),
  descripcion: z.string().optional(),
  publicacion: z.nativeEnum(EstadoPublicacion),
  imagenes: z
    .array(imagenDeVehiculo)
    .max(MAXIMO_IMAGENES, `No se pueden cargar más de ${MAXIMO_IMAGENES} imágenes`)
    .optional(),
});