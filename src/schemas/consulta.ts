import * as z from "zod";

export const ConsultaSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  telefono: z.string().optional(),
  mensaje: z.string().optional(),
  vehiculoId: z.string().optional(),
});
