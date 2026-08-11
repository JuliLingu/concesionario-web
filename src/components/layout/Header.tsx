"use client";
import { Car, DoorOpen, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { handleSignOut } from "@/actions/auth-actions";
import type { SiteConfig } from "@/lib/configuracion-defaults";

/**
 * Lo mínimo que el encabezado necesita saber de quien está mirando.
 *
 * Antes se recibía el objeto de sesión completo. Como este componente es de
 * cliente, ese objeto se serializaba en el HTML de todas las páginas —también
 * las públicas—, con lo que el correo del administrador quedaba a la vista de
 * cualquier visitante mientras hubiera sesión abierta en ese navegador.
 */
export type UsuarioDelHeader = {
  nombre: string | null;
  esAdmin: boolean;
};

interface HeaderProps {
  usuario: UsuarioDelHeader | null;
  configuracion: SiteConfig;
}

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/#nosotros", label: "Nosotros" },
  { href: "/#ubicacion", label: "Ubicación" },
];

export function Header({ usuario, configuracion }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const parts = configuracion.nombreConcesionaria.split(" ");
  const firstWord = parts[0];
  const restWords = parts.slice(1).join(" ");

  // Cierra el panel al navegar a otra ruta.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Bloquea el scroll del fondo y permite cerrar con Escape mientras está abierto.
  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-nav animate-header-in">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-3 px-4 md:px-8 h-[var(--header-h)]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline min-w-0">
          {configuracion.logoUrl ? (
            <Image
              src={configuracion.logoUrl}
              alt={configuracion.nombreConcesionaria}
              width={120}
              height={32}
              priority
              className="h-8 w-auto object-contain"
            />
          ) : (
            <Car className="text-[hsl(var(--primary))] w-6 h-6 shrink-0" />
          )}
          <div className="flex items-center min-w-0">
            <span className="font-extrabold text-[hsl(var(--foreground))] uppercase tracking-tighter text-sm truncate">
              {firstWord}
            </span>
            {restWords && (
              <span className="font-extrabold text-[hsl(var(--primary))] uppercase tracking-tighter text-sm ml-1 truncate">
                {restWords}
              </span>
            )}
          </div>
        </Link>

        {/* Nav Links (desktop) */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[hsl(var(--foreground))]/60 hover:text-[hsl(var(--foreground))] font-medium transition-colors text-sm"
            >
              {link.label}
            </Link>
          ))}
          {usuario?.esAdmin && (
            <Link href="/dashboard" className="text-[hsl(var(--foreground))]/60 hover:text-[hsl(var(--foreground))] font-medium transition-colors text-sm">
              Administrador
            </Link>
          )}
          <Link
            href="/catalogo"
            className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] hover:brightness-90 text-[hsl(var(--primary-foreground))] px-5 py-2.5 rounded text-xs font-black uppercase tracking-widest transition-all shadow-md"
          >
            Ver Vehículos
          </Link>
        </nav>

        {/* Session (desktop) */}
        <div className="hidden md:block">
          {usuario ? (
            <div className="flex items-center gap-4">
              <span className="font-bold text-[hsl(var(--foreground))] text-sm">
                {usuario.nombre}
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
              className="flex items-center gap-2 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] hover:brightness-90 text-[hsl(var(--primary-foreground))] px-4 py-2.5 rounded text-sm font-bold transition-all shadow-md"
            >
              <DoorOpen className="w-4 h-4" />
              <span>Iniciar Sesión</span>
            </Link>
          )}
        </div>

        {/* Botón hamburguesa (mobile) */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="md:hidden flex items-center justify-center w-10 h-10 -mr-2 rounded text-[hsl(var(--foreground))] hover:bg-black/5 transition-colors"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Panel mobile. Animado con CSS (no con framer-motion) para que el panel
          quede visible aunque la animación no llegue a correr. */}
      {open && (
        <>
          {/* Backdrop: ocupa lo que queda de pantalla debajo del header */}
          <div
            onClick={() => setOpen(false)}
            className="md:hidden fixed left-0 right-0 bottom-0 top-[var(--header-h)] bg-black/40 -z-10 animate-fade-in"
          />
          <div
            id="mobile-menu"
            className="md:hidden bg-[hsl(var(--card))] border-t border-black/5 shadow-lg animate-slide-down"
          >
            <nav className="flex flex-col px-4 py-3 max-h-[calc(100vh-var(--header-h))] overflow-y-auto">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="py-3 text-[hsl(var(--foreground))] font-semibold border-b border-black/5"
                >
                  {link.label}
                </Link>
              ))}
              {usuario?.esAdmin && (
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="py-3 text-[hsl(var(--foreground))] font-semibold border-b border-black/5"
                >
                  Administrador
                </Link>
              )}

              <Link
                href="/catalogo"
                onClick={() => setOpen(false)}
                className="mt-4 text-center bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-[hsl(var(--primary-foreground))] px-5 py-3 rounded text-xs font-black uppercase tracking-widest shadow-md"
              >
                Ver Vehículos
              </Link>

              {usuario ? (
                <div className="mt-4 pt-4 border-t border-black/5 flex items-center justify-between gap-3">
                  <span className="font-bold text-[hsl(var(--foreground))] text-sm truncate">
                    {usuario.nombre}
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
                  onClick={() => setOpen(false)}
                  className="mt-4 flex items-center justify-center gap-2 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] px-4 py-3 rounded text-sm font-bold"
                >
                  <DoorOpen className="w-4 h-4" />
                  <span>Iniciar Sesión</span>
                </Link>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
