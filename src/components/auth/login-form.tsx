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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 block">Email Address</label>
        <input 
          {...form.register("email")} 
          disabled={isPending}
          placeholder="name@gallery.com" 
          type="email" 
          className="bg-surface-low p-4 w-full rounded-sm outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium text-sm border-none" 
        />
        {form.formState.errors.email && <p className="text-primary text-[10px] font-bold uppercase mt-1">{form.formState.errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 block">Password</label>
        <input 
          {...form.register("password")} 
          disabled={isPending}
          placeholder="••••••••" 
          type="password" 
          className="bg-surface-low p-4 w-full rounded-sm outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium text-sm border-none" 
        />
        {form.formState.errors.password && <p className="text-primary text-[10px] font-bold uppercase mt-1">{form.formState.errors.password.message}</p>}
      </div>
      {error && <div className="bg-primary/5 p-4 text-primary text-[10px] font-black uppercase tracking-widest">{error}</div>}
      <button 
        type="submit" 
        disabled={isPending} 
        className="bg-racing text-white p-4 w-full rounded-sm hover:translate-y-[-2px] hover:shadow-2xl disabled:opacity-50 transition-all font-black text-xs uppercase tracking-[0.3em]"
      >
        {isPending ? "Validating..." : "Enter the Gallery"}
      </button>

      <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
        ¿No tienes una cuenta?{" "}
        <Link href="/register" className="text-primary hover:underline transition-all">
          Regístrate aquí
        </Link>
      </p>
    </form>
  );
};