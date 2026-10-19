import * as z from "zod";
import { FranjaHoraria, MedioContacto } from "../../generated/prisma";
import { telefonoArOpcional } from "./telefono";

/**
 * Consulta por una unidad. Además del mensaje, el visitante elige cómo y
 * cuándo prefiere que lo contacten: al vendedor le sirve más "WhatsApp, a la
 * tarde" que un mensaje libre que no dice ni una cosa ni la otra.
 *
 * El teléfono es opcional solo si eligió email; para WhatsApp o una llamada
 * sin teléfono no hay a dónde contestar.
 */
export const ConsultaSchema = z
  .object({
    nombre: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(120, "El nombre es demasiado largo"),
    email: z.string().trim().email("Email inválido").max(160, "El email es demasiado largo"),
    telefono: telefonoArOpcional,
    // Opcionales para el servidor: el formulario siempre los manda, pero una
    // pestaña abierta desde antes de este cambio no, y esa consulta no se
    // debería perder por eso.
    medioContacto: z.nativeEnum(MedioContacto, { message: "Elegí cómo te contactamos" }).optional().nullable(),
    franjaHoraria: z.nativeEnum(FranjaHoraria).optional().nullable(),
    mensaje: z.string().max(2000, "El mensaje es demasiado largo").optional().nullable(),
    vehiculoId: z.string().optional().nullable(),
  })
  .superRefine((datos, ctx) => {
    const necesitaTelefono =
      datos.medioContacto === MedioContacto.WHATSAPP || datos.medioContacto === MedioContacto.LLAMADA;
    if (necesitaTelefono && !datos.telefono) {
      ctx.addIssue({
        code: "custom",
        path: ["telefono"],
        message:
          datos.medioContacto === MedioContacto.WHATSAPP
            ? "Dejanos tu celular para escribirte por WhatsApp"
            : "Dejanos tu teléfono para llamarte",
      });
    }
  });

export type ConsultaInput = z.input<typeof ConsultaSchema>;
export type ConsultaData = z.output<typeof ConsultaSchema>;
