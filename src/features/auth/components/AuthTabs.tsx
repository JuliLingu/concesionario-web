"use client";

import { useState } from "react";
import { RegisterForm } from "./RegisterForm";
import { LoginForm } from "./LoginForm";

export function AuthTabs() {
  const [tab, setTab] = useState<"login" | "register">("login");

  return (
    <div>
      {/* Tabs */}
      <div className="flex bg-neutral-800 rounded-xl p-1 mb-8">
        <button
          onClick={() => setTab("login")}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
            tab === "login"
              ? "bg-red-600 text-white shadow"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Ingresar
        </button>
        <button
          onClick={() => setTab("register")}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
            tab === "register"
              ? "bg-red-600 text-white shadow"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Registrarse
        </button>
      </div>

      {/* Contenido */}
      {tab === "login" ? <LoginForm /> : <RegisterForm />}
    </div>
  );
}