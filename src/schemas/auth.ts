import * as z from "zod";

/**
 * Login: la contraseña solo se comprueba que venga.
 *
 * Este esquema también lo usa `authorize()` en auth.ts, así que endurecer acá
 * la longitud dejaría fuera del panel a cualquier cuenta creada bajo la
 * política anterior. La política nueva se aplica al dar de alta o al cambiar
 * la contraseña, que es donde corresponde.
 */
export const LoginSchema = z.object({
  email: z.string().email({
    message: "El correo electrónico es obligatorio",
  }),
  password: z.string().min(1, {
    message: "La contraseña es obligatoria",
  }),
});

/**
 * Contraseña para altas y cambios.
 *
 * 12 caracteres con las tres clases: sin verificación por correo ni segundo
 * factor, la longitud es lo único que separa la cuenta de un ataque de
 * diccionario, así que se pide más de lo habitual.
 */
export const PasswordSchema = z
  .string()
  .min(12, "La contraseña debe tener al menos 12 caracteres")
  .max(72, "La contraseña no puede superar los 72 caracteres")
  .regex(/[a-z]/, "Debe incluir al menos una minúscula")
  .regex(/[A-Z]/, "Debe incluir al menos una mayúscula")
  .regex(/[0-9]/, "Debe incluir al menos un número");

export const RegisterSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Ingresa un correo electrónico válido"),
  password: PasswordSchema,
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
