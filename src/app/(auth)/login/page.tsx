"use client";

import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0a0a0b] px-4 pt-header pb-8 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(194,65,12,0.05),_transparent_50%)]" />

      <div className="relative w-full max-w-md z-10">
        <div className="text-center mb-12">
          <p className="text-[10px] font-black uppercase tracking-[0.6em] text-[#c2410c] opacity-80 mb-4">
            Acceso Exclusivo
          </p>
          <h1 className="text-6xl font-bold tracking-tighter text-white uppercase leading-none mb-2">
            Bienvenido<span className="text-[#c2410c]">.</span>
          </h1>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-lg shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
