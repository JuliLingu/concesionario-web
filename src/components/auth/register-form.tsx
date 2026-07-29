"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { register } from "@/actions/register";
import { RegisterSchema } from "@/schemas/auth";

export const RegisterForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { email: "", password: "", name: "" },
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
          Full Name
        </label>
        <input
          {...form.register("name")}
          placeholder="Juan Pérez"
          disabled={isPending}
          className={`w-full bg-gray-100 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c2410c]/20 disabled:opacity-60 ${form.formState.errors.name ? "ring-2 ring-red-400 bg-red-50" : ""}`}
        />
        {form.formState.errors.name && (
          <span className="text-red-500 text-xs">{form.formState.errors.name.message}</span>
        )}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
          Email Address
        </label>
        <input
          {...form.register("email")}
          placeholder="juan@ejemplo.com"
          type="email"
          disabled={isPending}
          className={`w-full bg-gray-100 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c2410c]/20 disabled:opacity-60 ${form.formState.errors.email ? "ring-2 ring-red-400 bg-red-50" : ""}`}
        />
        {form.formState.errors.email && (
          <span className="text-red-500 text-xs">{form.formState.errors.email.message}</span>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
          Secure Password
        </label>
        <input
          {...form.register("password")}
          placeholder="••••••••"
          type="password"
          disabled={isPending}
          className={`w-full bg-gray-100 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c2410c]/20 disabled:opacity-60 ${form.formState.errors.password ? "ring-2 ring-red-400 bg-red-50" : ""}`}
        />
        {form.formState.errors.password && (
          <span className="text-red-500 text-xs">{form.formState.errors.password.message}</span>
        )}
      </div>

      {/* Error / Success */}
      {error && (
        <div className="bg-[#c2410c]/10 text-[#c2410c] p-3 text-[10px] font-black uppercase tracking-[0.1em] rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 text-green-700 p-3 text-[10px] font-black uppercase tracking-[0.1em] rounded">
          {success}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#c2410c] hover:bg-[#9a3412] text-white py-4 rounded text-xs font-black uppercase tracking-[0.3em] transition-all hover:-translate-y-0.5 hover:shadow-[0_25px_50px_-12px_rgba(194,65,12,0.5)] disabled:opacity-70 flex items-center justify-center"
      >
        {isPending ? (
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          "Join the Gallery"
        )}
      </button>

      <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
        ¿Ya tienes una cuenta?{" "}
        <Link href="/login" className="text-[#c2410c] hover:underline">
          Inicia sesión aquí
        </Link>
      </p>
    </form>
  );
};