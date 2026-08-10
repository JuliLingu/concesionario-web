"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateConsultaEstado } from "@/actions/consulta";
import { EstadoConsulta } from "../../../generated/prisma";

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
