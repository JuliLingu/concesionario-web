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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 block">Full Name</label>
        <input 
          {...form.register("name")} 
          disabled={isPending} 
          placeholder="Juan Pérez" 
          className="bg-surface-low p-4 w-full rounded-sm outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium text-sm border-none" 
        />
        {form.formState.errors.name && <p className="text-primary text-[10px] font-bold uppercase mt-1">{form.formState.errors.name.message}</p>}
      </div>
      
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 block">Email Address</label>
        <input 
          {...form.register("email")} 
          disabled={isPending} 
          placeholder="juan@ejemplo.com" 
          type="email" 
          className="bg-surface-low p-4 w-full rounded-sm outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium text-sm border-none" 
        />
        {form.formState.errors.email && <p className="text-primary text-[10px] font-bold uppercase mt-1">{form.formState.errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 block">Secure Password</label>
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
      {success && <div className="bg-green-500/5 p-4 text-green-600 text-[10px] font-black uppercase tracking-widest">{success}</div>}

      <button 
        type="submit" 
        disabled={isPending} 
        className="bg-racing text-white p-4 w-full rounded-sm hover:translate-y-[-2px] hover:shadow-2xl disabled:opacity-50 transition-all font-black text-xs uppercase tracking-[0.3em]"
      >
        {isPending ? "Creating account..." : "Join the Gallery"}
      </button>

      <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
        ¿Ya tienes una cuenta?{" "}
        <Link href="/login" className="text-primary hover:underline transition-all">
          Inicia sesión aquí
        </Link>
      </p>
    </form>
  );
};