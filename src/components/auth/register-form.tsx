"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { register } from "@/actions/register";
import { RegisterSchema } from "@/schemas/auth";

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

    startTransition(() => {
      register(values).then((data) => {
        setError(data.error);
        setSuccess(data.success);
      });
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Nombre</label>
        <input {...form.register("name")} disabled={isPending} placeholder="Juan Pérez" className="border p-2 w-full rounded-md outline-none focus:ring-2 focus:ring-blue-500" />
        {form.formState.errors.name && <p className="text-red-500 text-xs">{form.formState.errors.name.message}</p>}
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <input {...form.register("email")} disabled={isPending} placeholder="juan@ejemplo.com" type="email" className="border p-2 w-full rounded-md outline-none focus:ring-2 focus:ring-blue-500" />
        {form.formState.errors.email && <p className="text-red-500 text-xs">{form.formState.errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Contraseña</label>
        <input {...form.register("password")} disabled={isPending} placeholder="******" type="password" className="border p-2 w-full rounded-md outline-none focus:ring-2 focus:ring-blue-500" />
        {form.formState.errors.password && <p className="text-red-500 text-xs">{form.formState.errors.password.message}</p>}
      </div>

      {error && (
        <div className="bg-red-100 p-3 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 p-3 rounded-md text-green-700 text-sm">
          {success}
        </div>
      )}

      <button type="submit" disabled={isPending} className="bg-blue-600 text-white p-2 w-full rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition font-semibold">
        {isPending ? "Procesando..." : "Crear cuenta"}
      </button>
    </form>
  );
};