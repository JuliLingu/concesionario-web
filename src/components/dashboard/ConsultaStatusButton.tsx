"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateConsultaEstado } from "@/actions/consulta";
import { EstadoConsulta } from "../../../generated/prisma";
import { Box, Button, Chip, Stack } from "@mui/material";

const ESTADO_CONFIG: Record<EstadoConsulta, { label: string; color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" }> = {
  PENDIENTE:  { label: "Pendiente",  color: "primary" },
  VISTA:      { label: "Vista",      color: "info" },
  RESPONDIDA: { label: "Respondida", color: "success" },
  CERRADA:    { label: "Cerrada",    color: "default" },
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
    <Stack direction="row" alignItems="center" spacing={2} sx={{ flexWrap: 'wrap' }}>
      {/* Current state badge */}
      <Chip 
        label={ESTADO_CONFIG[estadoActual].label} 
        color={ESTADO_CONFIG[estadoActual].color} 
        size="small" 
        sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: 1 }}
      />

      {/* Action buttons */}
      {next.map((n) => (
        <Button
          key={n.value}
          onClick={() => handle(n.value)}
          disabled={isPending}
          variant="text"
          size="small"
          sx={{
            fontSize: '10px',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'text.secondary',
            textDecoration: 'underline',
            textUnderlineOffset: '2px',
            minWidth: 0,
            p: 0,
            '&:hover': {
              color: 'primary.main',
              bgcolor: 'transparent',
              textDecoration: 'underline'
            }
          }}
        >
          {isPending ? "..." : n.label}
        </Button>
      ))}
    </Stack>
  );
};
