"use client";
import { Car } from "lucide-react";
import Link from "next/link";

interface FooterProps {
  configuracion?: any;
}

export function Footer({ configuracion }: FooterProps) {
  const parts = configuracion?.nombreConcesionaria
    ? configuracion.nombreConcesionaria.split(" ")
    : ["JBJ", "Automotores"];
  const firstWord = parts[0];
  const restWords = parts.slice(1).join(" ");

  return (
    <footer className="py-8 bg-[#1a1c1e]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-[#c2410c]/10">
              <Car className="text-[#c2410c] w-5 h-5" />
            </div>
            <span className="font-extrabold text-white uppercase tracking-tighter">
              {firstWord}{" "}
              {restWords && <span className="text-[#c2410c]">{restWords}</span>}
            </span>
          </div>

          {/* Copyright */}
          <p className="text-white/35 font-light text-sm text-center">
            Vehículos de calidad. Concesionario en Argentina. {new Date().getFullYear()}
            {configuracion?.direccion && ` - ${configuracion.direccion}`}
          </p>

          {/* Links */}
          <div className="flex items-center gap-8">
            <Link
              href="#"
              className="text-xs uppercase tracking-widest text-white/35 hover:text-[#c2410c] transition-colors"
            >
              Términos
            </Link>
            <Link
              href="#"
              className="text-xs uppercase tracking-widest text-white/35 hover:text-[#c2410c] transition-colors"
            >
              Privacidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}