import * as z from "zod";
import { normalizarTelefonoAr } from "@/lib/telefono";

/**
 * Teléfono argentino validado y guardado en una sola forma (`+549...`), para
 * que el enlace de WhatsApp del panel funcione con cualquier número que entre.
 * Ver `lib/telefono.ts`.
 *
 * Igual que el resto de los esquemas públicos, tiene que aceptar su propia
 * salida: la acción vuelve a validar lo que el resolver ya transformó. La
 * normalización es idempotente, así que `+5491123456789` vuelve igual.
 */
function normalizar(valor: string, ctx: z.RefinementCtx): string {
  const resultado = normalizarTelefonoAr(valor);
  if (!resultado.ok) {
    ctx.addIssue({ code: "custom", message: resultado.error });
    return z.NEVER;
  }
  return resultado.valor;
}

export const telefonoAr = z
  .string()
  .trim()
  .min(1, "El teléfono es requerido")
  .max(40, "El teléfono no es válido")
  .transform(normalizar);

/** Opcional: vacío es null; si se escribió algo, tiene que ser un número válido. */
export const telefonoArOpcional = z
  .string()
  .trim()
  .max(40, "El teléfono no es válido")
  .optional()
  .nullable()
  .transform((valor, ctx) => (valor ? normalizar(valor, ctx) : null));
