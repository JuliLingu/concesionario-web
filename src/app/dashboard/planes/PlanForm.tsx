"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlanFinanciacionSchema } from "@/schemas/financiacion";
import { createPlan, updatePlan } from "@/actions/financiacion";
import { Box, Button, Checkbox, FormControlLabel, Stack, TextField, Typography } from "@mui/material";

interface PlanFormProps {
  initialData?: any;
  onSuccess: () => void;
}

type FormData = z.infer<typeof PlanFinanciacionSchema>;

export const PlanForm = ({ initialData, onSuccess }: PlanFormProps) => {
  const [isPending, start] = useTransition();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(PlanFinanciacionSchema),
    defaultValues: {
      nombre: initialData?.nombre || "",
      cuotas: initialData?.cuotas || 12,
      tasaAnual: initialData?.tasaAnual ? Number(initialData.tasaAnual) : 0,
      activo: initialData?.activo ?? true,
    },
  });

  const onSubmit = (data: FormData) => {
    start(async () => {
      const res = initialData
        ? await updatePlan(initialData.id, data)
        : await createPlan(data);

      if (res.success) {
        onSuccess();
      } else {
        alert(res.error || "Ocurrió un error");
      }
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 1 }}>
      <Typography variant="h5" sx={{ mb: 4, fontWeight: 900, color: 'text.primary' }}>
        {initialData ? "Editar Plan" : "Nuevo Plan de Financiación"}
      </Typography>

      <Stack spacing={3}>
        <TextField
          fullWidth
          label="Nombre del Plan (ej. '12 Cuotas Fijas')"
          {...register("nombre")}
          error={!!errors.nombre}
          helperText={errors.nombre?.message}
          disabled={isPending}
        />
        
        <Stack direction="row" spacing={3}>
          <TextField
            fullWidth
            type="number"
            label="Cantidad de Cuotas"
            {...register("cuotas")}
            error={!!errors.cuotas}
            helperText={errors.cuotas?.message}
            disabled={isPending}
          />
          <TextField
            fullWidth
            type="number"
            inputProps={{ step: "0.01" }}
            label="Tasa Anual (TNA %)"
            {...register("tasaAnual")}
            error={!!errors.tasaAnual}
            helperText={errors.tasaAnual?.message}
            disabled={isPending}
          />
        </Stack>

        <FormControlLabel
          control={<Checkbox {...register("activo")} defaultChecked={initialData?.activo ?? true} disabled={isPending} />}
          label="Plan Activo"
          sx={{ color: 'text.secondary' }}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isPending}
          sx={{
            py: 1.5,
            bgcolor: 'primary.main',
            color: 'white',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            '&:hover': { bgcolor: 'primary.dark' }
          }}
        >
          {isPending ? "Guardando..." : "Guardar Plan"}
        </Button>
      </Stack>
    </Box>
  );
};
