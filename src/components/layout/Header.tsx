"use client";
import { motion } from "framer-motion";
import { Car, DoorOpen } from "lucide-react";
import Link from "next/link";
import { handleSignOut } from "@/actions/auth-actions";

interface HeaderProps {
  session: any;
  configuracion?: any;
}

export function Header({ session, configuracion }: HeaderProps) {
  const parts = configuracion?.nombreConcesionaria
    ? configuracion.nombreConcesionaria.split(" ")
    : ["JBJ", "Automotores"];
  const firstWord = parts[0];
  const restWords = parts.slice(1).join(" ");

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass-nav"
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 md:px-8 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline">
          <Car className="text-[#c2410c] w-6 h-6" />
          <div className="flex items-center">
            <span className="font-extrabold text-[#1a1c1e] uppercase tracking-tighter text-sm">
              {firstWord}
            </span>
            {restWords && (
              <span className="font-extrabold text-[#c2410c] uppercase tracking-tighter text-sm ml-1">
                {restWords}
              </span>
            )}
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-[#1a1c1e]/60 hover:text-[#1a1c1e] font-medium transition-colors text-sm">
            Inicio
          </Link>
          <Link href="/#nosotros" className="text-[#1a1c1e]/60 hover:text-[#1a1c1e] font-medium transition-colors text-sm">
            Nosotros
          </Link>
          <Link href="/#ubicacion" className="text-[#1a1c1e]/60 hover:text-[#1a1c1e] font-medium transition-colors text-sm">
            Ubicación
          </Link>
          {session?.user?.role === "ADMIN" && (
            <Link href="/dashboard" className="text-[#1a1c1e]/60 hover:text-[#1a1c1e] font-medium transition-colors text-sm">
              Administrador
            </Link>
          )}
          <Link
            href="/catalogo"
            className="bg-gradient-to-br from-[#c2410c] to-[#ea580c] hover:from-[#9a3412] hover:to-[#c2410c] text-white px-5 py-2.5 rounded text-xs font-black uppercase tracking-widest transition-all shadow-md"
          >
            Ver Vehículos
          </Link>
        </nav>

        {/* Session */}
        {session ? (
          <div className="flex items-center gap-4">
            <span className="font-bold text-[#1a1c1e] text-sm hidden sm:block">
              {session.user?.name}
            </span>
            <form action={handleSignOut}>
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-semibold transition-colors"
              >
                Salir
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 bg-gradient-to-br from-[#c2410c] to-[#ea580c] hover:from-[#9a3412] hover:to-[#c2410c] text-white px-4 py-2.5 rounded text-sm font-bold transition-all shadow-md"
          >
            <DoorOpen className="w-4 h-4" />
            <span>Iniciar Sesión</span>
          </Link>
        )}
      </div>
    </motion.header>
  );
}
