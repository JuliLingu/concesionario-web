import * as z from "zod";

export const VehicleSchema = z.object({
  brand: z.string().min(1, "La marca es obligatoria"),
  model: z.string().min(1, "El modelo es obligatorio"),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  price: z.number().min(0, "El precio debe ser positivo"),
  mileage: z.number().min(0, "El kilometraje no puede ser negativo"),
  fuelType: z.enum(["GASOLINA", "DIESEL", "ELECTRICO", "HIBRIDO"]),
  transmission: z.enum(["MANUAL", "AUTOMATICO"]),
  color: z.string().min(1, "El color es obligatorio"),
  description: z.string().optional(),
  images: z.array(z.string()).min(1, "Al menos una imagen es requerida"),
  featured: z.boolean().default(false),
});