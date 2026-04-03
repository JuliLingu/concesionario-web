"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LoginSchema } from "@/schemas/auth";
import { login } from "@/actions/login";

export const LoginForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("");

    startTransition(() => {
      login(values).then((data) => {
        if (data?.error) {
          setError(data.error);
        }
      });
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <input 
          {...form.register("email")} 
          disabled={isPending}
          placeholder="juan@ejemplo.com" 
          type="email" 
          className="border p-2 w-full rounded-md outline-none focus:ring-2 focus:ring-blue-500" 
        />
        {form.formState.errors.email && <p className="text-red-500 text-xs">{form.formState.errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Contraseña</label>
        <input 
          {...form.register("password")} 
          disabled={isPending}
          placeholder="******" 
          type="password" 
          className="border p-2 w-full rounded-md outline-none focus:ring-2 focus:ring-blue-500" 
        />
        {form.formState.errors.password && <p className="text-red-500 text-xs">{form.formState.errors.password.message}</p>}
      </div>
      {error && <div className="bg-red-100 p-3 rounded-md text-red-700 text-sm">{error}</div>}
      <button type="submit" disabled={isPending} className="bg-blue-600 text-white p-2 w-full rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition font-semibold">
        {isPending ? "Iniciando sesión..." : "Iniciar Sesión"}
      </button>
    </form>
  );
};