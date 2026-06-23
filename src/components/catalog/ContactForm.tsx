"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useTransition } from "react";
import { ConsultaSchema } from "@/schemas/consulta";
import { createConsulta } from "@/actions/consulta";
import { Send, CheckCircle2 } from "lucide-react";
import { Box, Button, CircularProgress, Stack, TextField, Typography } from "@mui/material";

interface ContactFormProps {
  vehiculoId?: string;
  vehiculoNombre?: string;
}

export const ContactForm = ({ vehiculoId, vehiculoNombre }: ContactFormProps) => {
  const [error, setError]     = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, start]    = useTransition();

  const form = useForm<z.infer<typeof ConsultaSchema>>({
    resolver: zodResolver(ConsultaSchema),
    defaultValues: {
      nombre:     "",
      email:      "",
      telefono:   "",
      mensaje:    vehiculoNombre ? `Hola, me interesa el ${vehiculoNombre}. ` : "",
      vehiculoId: vehiculoId || "",
    },
  });

  const onSubmit = (values: z.infer<typeof ConsultaSchema>) => {
    setError(undefined);
    setSuccess(undefined);

    start(async () => {
      const result = await createConsulta(values);
      if (result.error)   setError(result.error);
      if (result.success) {
        setSuccess(result.success);
        form.reset();
      }
    });
  };

  // If success, show confirmation state
  if (success) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ py: 6, px: 3, bgcolor: 'background.paper', textAlign: 'center' }} spacing={2}>
        <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle2 size={28} color="#16a34a" />
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 900, fontSize: '1.125rem', textTransform: 'uppercase', letterSpacing: '-0.02em', mt: 1 }}>
          ¡Consulta enviada!
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, maxWidth: 300, lineHeight: 1.6 }}>
          {success}
        </Typography>
        <Button
          onClick={() => setSuccess(undefined)}
          variant="text"
          sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', mt: 1 }}
        >
          Enviar otra consulta
        </Button>
      </Stack>
    );
  }

  return (
    <Box component="form" onSubmit={form.handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Nombre + Email */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          {...form.register("nombre")}
          label="Nombre *"
          placeholder="Tu nombre"
          disabled={isPending}
          error={!!form.formState.errors.nombre}
          helperText={form.formState.errors.nombre?.message?.toString()}
          fullWidth
          variant="filled"
          slotProps={{
          input: {},
          inputLabel: {}
        }}
          sx={{ '& .MuiFilledInput-root': { bgcolor: 'background.paper', borderRadius: 1 } }}
        />

        <TextField
          {...form.register("email")}
          type="email"
          label="Email *"
          placeholder="tu@email.com"
          disabled={isPending}
          error={!!form.formState.errors.email}
          helperText={form.formState.errors.email?.message?.toString()}
          fullWidth
          variant="filled"
          slotProps={{
          input: {},
          inputLabel: {}
        }}
          sx={{ '& .MuiFilledInput-root': { bgcolor: 'background.paper', borderRadius: 1 } }}
        />
      </Stack>

      {/* Teléfono */}
      <TextField
        {...form.register("telefono")}
        label="Teléfono (opcional)"
        placeholder="+54 223 421-4414"
        disabled={isPending}
        fullWidth
        variant="filled"
        slotProps={{
          input: {},
          inputLabel: {}
        }}
        sx={{ '& .MuiFilledInput-root': { bgcolor: 'background.paper', borderRadius: 1 } }}
      />

      {/* Mensaje */}
      <TextField
        {...form.register("mensaje")}
        label="Mensaje (opcional)"
        placeholder="¿Tenés alguna pregunta específica sobre el vehículo?"
        disabled={isPending}
        multiline
        rows={4}
        fullWidth
        variant="filled"
        slotProps={{
          input: {},
          inputLabel: {}
        }}
        sx={{ '& .MuiFilledInput-root': { bgcolor: 'background.paper', borderRadius: 1 } }}
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
          bgcolor: 'text.primary',
          color: 'background.default',
          py: 2,
          fontSize: '11px',
          fontWeight: 900,
          letterSpacing: '0.1em',
          '&:hover': { bgcolor: 'primary.main' }
        }}
      >
        {isPending ? (
          <Stack direction="row" alignItems="center" spacing={1}>
            <CircularProgress size={16} color="inherit" />
            <Typography sx={{ fontSize: 'inherit', fontWeight: 'inherit', textTransform: 'uppercase' }}>Enviando...</Typography>
          </Stack>
        ) : (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Send size={16} />
            <Typography sx={{ fontSize: 'inherit', fontWeight: 'inherit', textTransform: 'uppercase' }}>Enviar Consulta</Typography>
          </Stack>
        )}
      </Button>
    </Box>
  );
};
