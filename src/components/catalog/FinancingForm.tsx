"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useTransition } from "react";
import { SolicitudFinanciacionSchema } from "@/schemas/financiacion";
import { createSolicitud } from "@/actions/financiacion";
import { Send, CheckCircle2 } from "lucide-react";
import { Box, Button, CircularProgress, Stack, TextField, Typography } from "@mui/material";

interface FinancingFormProps {
  vehiculoId: string;
  anticipo: number;
  cuotas: number;
}

export const FinancingForm = ({ vehiculoId, anticipo, cuotas }: FinancingFormProps) => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, start] = useTransition();

  const form = useForm<z.infer<typeof SolicitudFinanciacionSchema>>({
    resolver: zodResolver(SolicitudFinanciacionSchema),
    defaultValues: {
      vehiculoId,
      anticipo,
      cuotas,
      nombre: "",
      apellido: "",
      dni: "",
      email: "",
      telefono: "",
      ingresos: undefined,
      mensaje: "",
    },
  });

  const onSubmit = (values: z.infer<typeof SolicitudFinanciacionSchema>) => {
    setError(undefined);
    setSuccess(undefined);

    start(async () => {
      // Re-assign the dynamic values just in case they changed in the parent before submit
      const result = await createSolicitud({
        ...values,
        anticipo,
        cuotas,
      });
      if (result.error) setError(result.error);
      if (result.success) {
        setSuccess(result.success);
      }
    });
  };

  if (success) {
    return (
      <Stack sx={{ py: 6, px: 3, bgcolor: 'background.paper', textAlign: 'center', alignItems: "center", justifyContent: "center" }} spacing={2}>
        <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle2 size={28} color="#16a34a" />
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 900, fontSize: '1.125rem', textTransform: 'uppercase', letterSpacing: '-0.02em', mt: 1 }}>
          ¡Solicitud enviada!
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, maxWidth: 300, lineHeight: 1.6 }}>
          {success}
        </Typography>
      </Stack>
    );
  }

  return (
    <Box component="form" onSubmit={form.handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          {...form.register("nombre")}
          label="Nombre *"
          disabled={isPending}
          error={!!form.formState.errors.nombre}
          helperText={form.formState.errors.nombre?.message?.toString()}
          fullWidth
          variant="filled"
          sx={{ '& .MuiFilledInput-root': { bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1 } }}
        />
        <TextField
          {...form.register("apellido")}
          label="Apellido *"
          disabled={isPending}
          error={!!form.formState.errors.apellido}
          helperText={form.formState.errors.apellido?.message?.toString()}
          fullWidth
          variant="filled"
          sx={{ '& .MuiFilledInput-root': { bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1 } }}
        />
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          {...form.register("dni")}
          label="DNI *"
          disabled={isPending}
          error={!!form.formState.errors.dni}
          helperText={form.formState.errors.dni?.message?.toString()}
          fullWidth
          variant="filled"
          sx={{ '& .MuiFilledInput-root': { bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1 } }}
        />
        <TextField
          {...form.register("telefono")}
          label="Teléfono *"
          disabled={isPending}
          error={!!form.formState.errors.telefono}
          helperText={form.formState.errors.telefono?.message?.toString()}
          fullWidth
          variant="filled"
          sx={{ '& .MuiFilledInput-root': { bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1 } }}
        />
      </Stack>

      <TextField
        {...form.register("email")}
        type="email"
        label="Email *"
        disabled={isPending}
        error={!!form.formState.errors.email}
        helperText={form.formState.errors.email?.message?.toString()}
        fullWidth
        variant="filled"
        sx={{ '& .MuiFilledInput-root': { bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1 } }}
      />

      <TextField
        {...form.register("ingresos")}
        type="number"
        label="Ingresos demostrables (opcional)"
        disabled={isPending}
        error={!!form.formState.errors.ingresos}
        helperText={form.formState.errors.ingresos?.message?.toString()}
        fullWidth
        variant="filled"
        sx={{ '& .MuiFilledInput-root': { bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1 } }}
      />

      <TextField
        {...form.register("mensaje")}
        label="Comentarios adicionales"
        disabled={isPending}
        multiline
        rows={3}
        fullWidth
        variant="filled"
        sx={{ '& .MuiFilledInput-root': { bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1 } }}
      />

      {error && (
        <Typography sx={{ bgcolor: 'rgba(194,65,12,0.1)', color: 'primary.main', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', p: 1.5 }}>
          {error}
        </Typography>
      )}

      <Button
        type="submit"
        disabled={isPending}
        variant="contained"
        fullWidth
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 2,
          fontSize: '11px',
          fontWeight: 900,
          letterSpacing: '0.1em',
          '&:hover': { bgcolor: 'primary.dark' }
        }}
      >
        {isPending ? (
          <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
            <CircularProgress size={16} color="inherit" />
            <Typography sx={{ fontSize: 'inherit', fontWeight: 'inherit', textTransform: 'uppercase' }}>Enviando Solicitud...</Typography>
          </Stack>
        ) : (
          <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
            <Send size={16} />
            <Typography sx={{ fontSize: 'inherit', fontWeight: 'inherit', textTransform: 'uppercase' }}>Solicitar Pre-Aprobación</Typography>
          </Stack>
        )}
      </Button>
    </Box>
  );
};
