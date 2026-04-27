"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateConsultaEstado } from "@/actions/consulta";
import { EstadoConsulta } from "../../../generated/prisma";

const ESTADO_CONFIG: Record<EstadoConsulta, { label: string; className: string }> = {
  PENDIENTE:  { label: "Pendiente",  className: "bg-primary/10 text-primary" },
  VISTA:      { label: "Vista",      className: "bg-blue-500/10 text-blue-700" },
  RESPONDIDA: { label: "Respondida", className: "bg-green-500/10 text-green-700" },
  CERRADA:    { label: "Cerrada",    className: "bg-foreground/10 text-foreground/40" },
};

const NEXT_ESTADOS: Record<EstadoConsulta, { value: EstadoConsulta; label: string }[]> = {
  PENDIENTE:  [{ value: "VISTA",      label: "Marcar Vista"      }, { value: "RESPONDIDA", label: "Marcar Respondida" }],
  VISTA:      [{ value: "RESPONDIDA", label: "Marcar Respondida" }, { value: "CERRADA",    label: "Cerrar"           }],
  RESPONDIDA: [{ value: "CERRADA",    label: "Cerrar"            }],
  CERRADA:    [],
};

interface ConsultaStatusButtonProps {
  consultaId: string;
  estadoActual: EstadoConsulta;
}

export const ConsultaStatusButton = ({ consultaId, estadoActual }: ConsultaStatusButtonProps) => {
  const [isPending, start] = useTransition();
  const router = useRouter();

  const next = NEXT_ESTADOS[estadoActual];

  const handle = (estado: EstadoConsulta) => {
    start(async () => {
      await updateConsultaEstado(consultaId, estado);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Current state badge */}
      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 ${ESTADO_CONFIG[estadoActual].className}`}>
        {ESTADO_CONFIG[estadoActual].label}
      </span>

      {/* Action buttons */}
      {next.map((n) => (
        <button
          key={n.value}
          onClick={() => handle(n.value)}
          disabled={isPending}
          className="text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-primary transition-colors disabled:opacity-50 underline underline-offset-2"
        >
          {isPending ? "..." : n.label}
        </button>
      ))}
    </div>
  );
};
