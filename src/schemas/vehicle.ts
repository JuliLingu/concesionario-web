import * as z from "zod";
import { Transmision, Combustible, EstadoVehiculo, EstadoPublicacion } from "../../generated/prisma";

export const VehicleSchema = z.object({
  categoriaId: z.string().min(1, "La categoría es obligatoria"),
  marca: z.string().min(1, "La marca es obligatoria"),
  modelo: z.string().min(1, "El modelo es obligatorio"),
  version: z.string().optional(),
  motor: z.string().optional(),
  anio: z.number().min(1900).max(new Date().getFullYear() + 1),
  precio: z.number().min(0, "El precio debe ser positivo"),
  kilometraje: z.number().min(0, "El kilometraje no puede ser negativo"),
  combustible: z.nativeEnum(Combustible),
  transmision: z.nativeEnum(Transmision),
  estado: z.nativeEnum(EstadoVehiculo),
  puertas: z.number().optional(),
  potencia: z.number().optional(),
  color: z.string().optional(),
  descripcion: z.string().optional(),
  publicacion: z.nativeEnum(EstadoPublicacion).default(EstadoPublicacion.BORRADOR),
  imagenes: z.array(z.string()).optional(),
});