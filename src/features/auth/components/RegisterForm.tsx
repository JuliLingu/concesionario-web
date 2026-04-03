"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerSchema } from "@/schemas/auth.schemas";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const parsed = registerSchema.safeParse(data);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.message ?? "Error al registrarse");
      setLoading(false);
      return;
    }

    router.push("/login?registered=true");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm text-neutral-300 mb-2">Nombre</label>
        <input
          name="name"
          type="text"
          required
          placeholder="Tu nombre"
          className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg px-4 py-3 text-sm placeholder:text-neutral-500 focus:outline-none focus:border-red-600 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm text-neutral-300 mb-2">Email</label>
        <input
          name="email"
          type="email"
          required
          placeholder="tu@email.com"
          className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg px-4 py-3 text-sm placeholder:text-neutral-500 focus:outline-none focus:border-red-600 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm text-neutral-300 mb-2">
          Contraseña
        </label>
        <input
          name="password"
          type="password"
          required
          placeholder="••••••••"
          className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg px-4 py-3 text-sm placeholder:text-neutral-500 focus:outline-none focus:border-red-600 transition-colors"
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm bg-red-950 border border-red-900 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-3 text-sm transition-colors"
      >
        {loading ? "Registrando..." : "Crear cuenta"}
      </button>
    </form>
  );
}
