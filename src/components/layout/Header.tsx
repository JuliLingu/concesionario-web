"use client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Car, DoorOpen } from "lucide-react";
import Link from "next/link";
import { handleSignOut } from "@/actions/auth-actions";
import Image from "next/image";

interface HeaderProps {
  session: any;
}

export function Header({ session }: HeaderProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl
                shadow-[0_20px_40px_rgba(26,28,30,0.06)] w-full"
      style={{ background: "rgba(255,255,255,0.80)" }}
    >
      <div className="container flex items-center justify-between h-16 mx-auto px-4 select-none">
        <Link href="/" className="flex items-center gap-2">
          <Car className="w-6 h-6" style={{ color: "#b5000b" }} />
          <span className="font-bold tracking-tight text-[#1a1c1e] uppercase text-sm">
            {'JBJ '}
          </span>
          <span className="font-bold tracking-tight uppercase text-sm" style={{ color: "#b5000b" }}>
            {'Automotores'}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="cursor-pointer text-sm text-[#1a1c1e]/60 hover:text-[#1a1c1e] transition-colors">
            <Button variant="link" size="sm">
              Inicio
            </Button>
          </Link>

          <Link href="/#nosotros" className="cursor-pointer text-sm text-[#1a1c1e]/60 hover:text-[#1a1c1e] transition-colors">
            <Button variant="link" size="sm">
              Nosotros
            </Button>
          </Link>

          <Link href="/#ubicacion" className="cursor-pointer text-sm text-[#1a1c1e]/60 hover:text-[#1a1c1e] transition-colors">
            <Button variant="link" size="sm">
              Ubicación
            </Button>
          </Link>

          {session?.user?.role === "ADMIN" && (
            <Link href="/dashboard" className="cursor-pointer text-sm text-[#1a1c1e]/60 hover:text-[#1a1c1e] transition-colors">
              <Button variant="link" size="sm">
                Administrador
              </Button>
            </Link>
          )}

          <Link href="/catalogo" className="cursor-pointer text-sm">
            <Button
              size="sm"
              style={{
                background: "linear-gradient(135deg, #b5000b 0%, #e30613 100%)",
                color: "#ffffff",
                border: "none",
              }}
            >
              Ver Vehículos
            </Button>
          </Link>
        </nav>

        {session ? (
          <div className="flex items-center gap-4">
            <Link className="flex flex-row items-center gap-2" href="/dashboard">
              <span className="text-sm font-bold text-[#1a1c1e] hidden sm:block">
                {session.user?.name}
              </span>
            </Link>
            <form action={handleSignOut}>
              <Button variant="rojo" size="sm" type="submit">
                Salir
              </Button>
            </form>
          </div>
        ) : (
          <Link href="/login">
            <Button
              size="sm"
              style={{
                background: "linear-gradient(135deg, #b5000b 0%, #e30613 100%)",
                color: "#ffffff",
                border: "none",
              }}
            >
              <DoorOpen className="w-4 h-4 mr-2" /> Iniciar Sesión
            </Button>
          </Link>
        )}
      </div>
    </motion.header>
  );
}
