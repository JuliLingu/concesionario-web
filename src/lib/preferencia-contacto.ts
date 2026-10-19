/**
 * Cómo y cuándo prefiere que lo contacten quien deja una consulta. Los mismos
 * textos los usan el formulario, el aviso por correo y el panel.
 */
import { FranjaHoraria, MedioContacto } from "../../generated/prisma";

export const MEDIOS_CONTACTO: { valor: MedioContacto; etiqueta: string }[] = [
  { valor: MedioContacto.WHATSAPP, etiqueta: "WhatsApp" },
  { valor: MedioContacto.LLAMADA, etiqueta: "Llamada" },
  { valor: MedioContacto.EMAIL, etiqueta: "Email" },
];

export const FRANJAS_HORARIAS: { valor: FranjaHoraria; etiqueta: string; detalle?: string }[] = [
  { valor: FranjaHoraria.MANANA, etiqueta: "Mañana", detalle: "9 a 13" },
  { valor: FranjaHoraria.TARDE, etiqueta: "Tarde", detalle: "13 a 18" },
  { valor: FranjaHoraria.NOCHE, etiqueta: "Noche", detalle: "18 a 21" },
  { valor: FranjaHoraria.CUALQUIERA, etiqueta: "Cualquier horario" },
];

/**
 * Resumen de una línea para el vendedor: "WhatsApp · Tarde (13 a 18)". Null en
 * las consultas viejas, que no tienen preferencia. La franja no se menciona
 * con email, ni cuando da lo mismo.
 */
export function describirPreferencia(
  medio: MedioContacto | null | undefined,
  franja: FranjaHoraria | null | undefined,
): string | null {
  const m = MEDIOS_CONTACTO.find((x) => x.valor === medio);
  if (!m) return null;
  const f = FRANJAS_HORARIAS.find((x) => x.valor === franja);
  if (medio === MedioContacto.EMAIL || !f || f.valor === FranjaHoraria.CUALQUIERA) {
    return m.etiqueta;
  }
  return `${m.etiqueta} · ${f.etiqueta}${f.detalle ? ` (${f.detalle})` : ""}`;
}
