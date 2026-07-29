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
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
          Email Address
        </label>
        <input
          {...form.register("email")}
          placeholder="name@gallery.com"
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
          Password
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

      {/* Error */}
      {error && (
        <div className="bg-[#c2410c]/10 text-[#c2410c] p-3 text-[10px] font-black uppercase tracking-[0.1em] rounded">
          {error}
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
          "Enter the Gallery"
        )}
      </button>

      <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
        ¿No tienes una cuenta?{" "}
        <Link href="/register" className="text-[#c2410c] hover:underline">
          Regístrate aquí
        </Link>
      </p>
    </form>
  );
};