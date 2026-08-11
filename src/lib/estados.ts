import { EstadoConsulta } from "../../generated/prisma";

/**
 * Pestañas de filtrado de las bandejas del panel.
 *
 * Consultas y solicitudes de crédito comparten el mismo enum de estado y la
 * misma barra, así que la lista vive una sola vez. Estaba duplicada literal en
 * las dos páginas: agregar un estado obligaba a acordarse de tocar las dos.
 */
export const TABS_ESTADO: { value: EstadoConsulta | "TODAS"; label: string }[] = [
  { value: "TODAS",      label: "Todas"      },
  { value: "PENDIENTE",  label: "Pendientes" },
  { value: "VISTA",      label: "Vistas"     },
  { value: "RESPONDIDA", label: "Respondidas"},
  { value: "CERRADA",    label: "Cerradas"   },
];

/**
 * Lee el `?estado=` de la URL. Cualquier valor que no sea del enum se trata
 * como "sin filtro" en lugar de llegar a Prisma: es entrada pública.
 */
export function estadoDeUrl(valor: string | undefined): EstadoConsulta | undefined {
  return valor && Object.keys(EstadoConsulta).includes(valor)
    ? (valor as EstadoConsulta)
    : undefined;
}
