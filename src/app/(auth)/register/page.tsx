"use client";

import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[hsl(var(--foreground))] px-4 pt-header pb-8 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_hsl(var(--primary)/0.05),_transparent_50%)]" />

      <div className="relative w-full max-w-md z-10">
        <div className="text-center mb-12">
          <p className="text-[10px] font-black uppercase tracking-[0.6em] text-[hsl(var(--primary))] opacity-80 mb-4">
            Registro Exclusivo
          </p>
          <h1 className="text-6xl font-bold tracking-tighter text-[hsl(var(--background))] uppercase leading-none mb-2">
            Únete<span className="text-[hsl(var(--primary))]">.</span>
          </h1>
        </div>

        <div className="bg-[hsl(var(--card))] p-8 md:p-10 rounded-lg shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
