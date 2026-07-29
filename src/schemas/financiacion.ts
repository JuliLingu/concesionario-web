import * as z from "zod";

export const PlanFinanciacionSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  cuotas: z.number().min(1, "Debe tener al menos 1 cuota"),
  tasaAnual: z.number().min(0, "La tasa debe ser mayor o igual a 0"),
  activo: z.boolean(),
});

export const SolicitudFinanciacionSchema = z.object({
  vehiculoId: z.string().optional().nullable(),
  nombre: z.string().min(2, "El nombre es requerido"),
  apellido: z.string().min(2, "El apellido es requerido"),
  dni: z.string().min(7, "El DNI no es válido"),
  email: z.string().email("Debe ser un email válido"),
  telefono: z.string().min(8, "El teléfono no es válido"),
  ingresos: z.coerce.number().min(0, "Monto inválido").optional(),
  anticipo: z.coerce.number().min(0, "El anticipo debe ser mayor o igual a 0"),
  cuotas: z.coerce.number().min(1, "Debe seleccionar una cantidad de cuotas"),
  mensaje: z.string().optional(),
});
