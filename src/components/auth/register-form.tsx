"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import Link from "next/link";
import { register } from "@/actions/register";
import { RegisterSchema } from "@/schemas/auth";
import { Box, Button, TextField, Typography, CircularProgress, Link as MuiLink } from "@mui/material";

export const RegisterForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("email", values.email);
    formData.append("password", values.password);
    formData.append("name", values.name);

    startTransition(() => {
      register(formData).then((data) => {
        setError(data.error);
        setSuccess(data.success);
      });
    });
  };

  return (
    <Box component="form" onSubmit={form.handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <TextField
        {...form.register("name")}
        label="Full Name"
        placeholder="Juan Pérez"
        disabled={isPending}
        error={!!form.formState.errors.name}
        helperText={form.formState.errors.name?.message}
        fullWidth
        variant="filled"
        slotProps={{
          input: { disableUnderline: true },
          inputLabel: { shrink: true, sx: { textTransform: 'uppercase', fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', color: 'text.secondary' } }
        }}
        sx={{ '& .MuiFilledInput-root': { bgcolor: 'background.paper', borderRadius: 1 } }}
      />

      <TextField
        {...form.register("email")}
        label="Email Address"
        placeholder="juan@ejemplo.com"
        type="email"
        disabled={isPending}
        error={!!form.formState.errors.email}
        helperText={form.formState.errors.email?.message}
        fullWidth
        variant="filled"
        slotProps={{
          input: { disableUnderline: true },
          inputLabel: { shrink: true, sx: { textTransform: 'uppercase', fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', color: 'text.secondary' } }
        }}
        sx={{ '& .MuiFilledInput-root': { bgcolor: 'background.paper', borderRadius: 1 } }}
      />

      <TextField
        {...form.register("password")}
        label="Secure Password"
        placeholder="••••••••"
        type="password"
        disabled={isPending}
        error={!!form.formState.errors.password}
        helperText={form.formState.errors.password?.message}
        fullWidth
        variant="filled"
        slotProps={{
          input: { disableUnderline: true },
          inputLabel: { shrink: true, sx: { textTransform: 'uppercase', fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', color: 'text.secondary' } }
        }}
        sx={{ '& .MuiFilledInput-root': { bgcolor: 'background.paper', borderRadius: 1 } }}
      />

      {error && (
        <Typography sx={{ bgcolor: 'rgba(194,65,12,0.1)', color: 'primary.main', p: 2, fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {error}
        </Typography>
      )}

      {success && (
        <Typography sx={{ bgcolor: 'rgba(34,197,94,0.1)', color: '#16a34a', p: 2, fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {success}
        </Typography>
      )}

      <Button
        type="submit"
        disabled={isPending}
        variant="contained"
        fullWidth
        sx={{
          bgcolor: '#c2410c',
          color: 'white',
          py: 2,
          fontSize: '12px',
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '0.3em',
          '&:hover': { bgcolor: '#9a3412', transform: 'translateY(-2px)', boxShadow: '0 25px 50px -12px rgba(194,65,12,0.5)' },
          transition: 'all 0.3s'
        }}
      >
        {isPending ? <CircularProgress size={20} color="inherit" /> : "Join the Gallery"}
      </Button>

      <Typography sx={{ textAlign: 'center', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'text.secondary' }}>
        ¿Ya tienes una cuenta?{" "}
        <MuiLink component={Link} href="/login" sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
          Inicia sesión aquí
        </MuiLink>
      </Typography>
    </Box>
  );
};