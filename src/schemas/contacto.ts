import * as z from "zod";

/** Nota interna sobre un contacto. Texto libre, con un tope que ninguna nota real alcanza. */
export const NotaContactoSchema = z.object({
  contactoId: z.string().min(1).max(191),
  texto: z
    .string()
    .trim()
    .min(1, "Escribí algo antes de guardar")
    .max(2000, "La nota es demasiado larga"),
});

export type NotaContactoInput = z.infer<typeof NotaContactoSchema>;
