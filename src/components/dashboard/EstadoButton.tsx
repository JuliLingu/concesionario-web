"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { EstadoConsulta } from "../../../generated/prisma";

/**
 * Botón de estado de las bandejas del panel.
 *
 * Consultas y solicitudes de crédito ya compartían el enum de estado y la barra
 * de pestañas (ver `lib/estados.ts`), pero cada una tenía su propia copia de
 * este botón: dos archivos idénticos salvo la acción que llamaban y el nombre
 * del prop del id. Cada bandeja nueva sumaba otra copia, y cambiar un color de
 * estado obligaba a acordarse de tocarlas todas.
 *
 * La acción llega como prop. Es lo que documenta Next para las server actions
 * que cruzan a un componente de cliente, y de ahí el sufijo `Action` en el
 * nombre del prop.
 */

const ESTADO_CONFIG: Record<EstadoConsulta, { label: string; colorClass: string }> = {
  PENDIENTE:  { label: "Pendiente",  colorClass: "bg-[#b5000b]/10 text-[#b5000b]" },
  VISTA:      { label: "Vista",      colorClass: "bg-blue-100 text-blue-700" },
  RESPONDIDA: { label: "Respondida", colorClass: "bg-green-100 text-green-700" },
  CERRADA:    { label: "Cerrada",    colorClass: "bg-gray-100 text-gray-500" },
};

const NEXT_ESTADOS: Record<EstadoConsulta, { value: EstadoConsulta; label: string }[]> = {
  PENDIENTE:  [{ value: "VISTA", label: "Marcar Vista" }, { value: "RESPONDIDA", label: "Marcar Respondida" }],
  VISTA:      [{ value: "RESPONDIDA", label: "Marcar Respondida" }, { value: "CERRADA", label: "Cerrar" }],
  RESPONDIDA: [{ value: "CERRADA", label: "Cerrar" }],
  CERRADA:    [],
};

interface EstadoButtonProps {
  /** Id de la fila: consulta, solicitud, o lo que traiga la bandeja. */
  id: string;
  estadoActual: EstadoConsulta;
  /**
   * Server action que persiste el cambio. Se ignora lo que devuelve: la
   * pantalla se rearma con `router.refresh()`, que trae el estado real.
   */
  cambiarEstadoAction: (id: string, estado: EstadoConsulta) => Promise<unknown>;
}

export const EstadoButton = ({ id, estadoActual, cambiarEstadoAction }: EstadoButtonProps) => {
  const [isPending, start] = useTransition();
  const router = useRouter();
  const next = NEXT_ESTADOS[estadoActual];

  const handle = (estado: EstadoConsulta) => {
    start(async () => {
      await cambiarEstadoAction(id, estado);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-sm ${ESTADO_CONFIG[estadoActual].colorClass}`}>
        {ESTADO_CONFIG[estadoActual].label}
      </span>
      {next.map((n) => (
        <button
          key={n.value}
          onClick={() => handle(n.value)}
          disabled={isPending}
          className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))] underline underline-offset-2 hover:text-[hsl(var(--primary))] p-0 disabled:opacity-50"
        >
          {isPending ? "..." : n.label}
        </button>
      ))}
    </div>
  );
};
