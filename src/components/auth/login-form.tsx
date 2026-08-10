"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { LoginSchema } from "@/schemas/auth";
import { login } from "@/actions/login";

export const LoginForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("");
    const formData = new FormData();
    formData.append("email", values.email);
    formData.append("password", values.password);
    startTransition(() => {
      login(formData).then((data) => {
        if (data?.error) setError(data.error);
      });
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
          Correo Electrónico
        </label>
        <input
          {...form.register("email")}
          placeholder="name@gallery.com"
          type="email"
          disabled={isPending}
          className={`w-full bg-[hsl(var(--input))] rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/20 disabled:opacity-60 ${form.formState.errors.email ? "ring-2 ring-red-400 bg-red-50" : ""}`}
        />
        {form.formState.errors.email && (
          <span className="text-red-500 text-xs">{form.formState.errors.email.message}</span>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
          Contraseña
        </label>
        <input
          {...form.register("password")}
          placeholder="••••••••"
          type="password"
          disabled={isPending}
          className={`w-full bg-[hsl(var(--input))] rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/20 disabled:opacity-60 ${form.formState.errors.password ? "ring-2 ring-red-400 bg-red-50" : ""}`}
        />
        {form.formState.errors.password && (
          <span className="text-red-500 text-xs">{form.formState.errors.password.message}</span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] p-3 text-[10px] font-black uppercase tracking-[0.1em] rounded">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-[hsl(var(--primary))] hover:brightness-90 text-[hsl(var(--primary-foreground))] py-4 rounded text-xs font-black uppercase tracking-[0.3em] transition-all hover:-translate-y-0.5 hover:shadow-[0_25px_50px_-12px_hsl(var(--primary)/0.5)] disabled:opacity-70 flex items-center justify-center"
      >
        {isPending ? (
          <span className="w-5 h-5 border-2 border-[hsl(var(--primary-foreground))]/30 border-t-[hsl(var(--primary-foreground))] rounded-full animate-spin" />
        ) : (
          "Iniciar Sesión"
        )}
      </button>

      <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
        ¿No tienes una cuenta?{" "}
        <Link href="/register" className="text-[hsl(var(--primary))] hover:underline">
          Regístrate aquí
        </Link>
      </p>
    </form>
  );
};