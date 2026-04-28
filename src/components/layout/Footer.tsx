"use client";
import { Car } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-8 mx-auto" style={{ background: "#1a1c1e", borderTop: "none" }}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* LOGO Y NOMBRE */}
          <div className="flex items-center gap-3">
            <div
              className="p-1.5 rounded-lg"
              style={{ background: "rgba(181,0,11,0.10)" }}
            >
              <Car className="w-5 h-5" style={{ color: "#b5000b" }} />
            </div>
            <span className="font-bold text-white tracking-tight uppercase">
              JBJ <span style={{ color: "#b5000b" }}>Automotores</span>
            </span>
          </div>

          {/* TEXTO CENTRAL */}
          <p className="text-sm text-center font-light" style={{ color: "rgba(255,255,255,0.35)" }}>
            Vehículos de calidad.{" "}Concesionario en Argentina.{" "}{new Date().getFullYear()}
          </p>

          {/* ENLACES SECUNDARIOS */}
          <div className="flex gap-8">
            <a
              href="#"
              className="text-xs uppercase tracking-widest transition-colors"
              style={{ color: "rgba(255,255,255,0.35)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#b5000b")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
            >
              Términos
            </a>
            <a
              href="#"
              className="text-xs uppercase tracking-widest transition-colors"
              style={{ color: "rgba(255,255,255,0.35)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#b5000b")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
            >
              Privacidad
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}