import { Car } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { SiteConfig } from "@/lib/configuracion-defaults";
import { Facebook, Instagram } from "@/components/icons/Social";

interface FooterProps {
  configuracion: SiteConfig;
}

export function Footer({ configuracion }: FooterProps) {
  const parts = configuracion.nombreConcesionaria.split(" ");
  const firstWord = parts[0];
  const restWords = parts.slice(1).join(" ");

  const enlacesLegales = [
    { label: "Términos", href: configuracion.terminosUrl },
    { label: "Privacidad", href: configuracion.privacidadUrl },
  ].filter((enlace) => enlace.href);

  const redes = [
    { label: "Facebook", href: configuracion.facebookUrl, Icono: Facebook },
    { label: "Instagram", href: configuracion.instagramUrl, Icono: Instagram },
  ].filter((red) => red.href);

  return (
    <footer className="py-8 bg-[hsl(var(--foreground))]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            {configuracion.logoUrl ? (
              <Image
                src={configuracion.logoUrl}
                alt={configuracion.nombreConcesionaria}
                width={120}
                height={32}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <div className="p-1.5 rounded-lg bg-[hsl(var(--primary))]/10">
                <Car className="text-[hsl(var(--primary))] w-5 h-5" />
              </div>
            )}
            <span className="font-extrabold text-[hsl(var(--background))] uppercase tracking-tighter">
              {firstWord}{" "}
              {restWords && <span className="text-[hsl(var(--primary))]">{restWords}</span>}
            </span>
          </div>

          {/* Copyright */}
          <p className="text-[hsl(var(--background))]/35 font-light text-sm text-center">
            {configuracion.footerTexto} {new Date().getFullYear()}
            {configuracion.direccion && ` - ${configuracion.direccion}`}
          </p>

          {/* Redes y enlaces */}
          <div className="flex items-center gap-8">
            {redes.map(({ label, href, Icono }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-[hsl(var(--background))]/35 hover:text-[hsl(var(--primary))] transition-colors"
              >
                <Icono />
              </a>
            ))}
            {enlacesLegales.map((enlace) => (
              <Link
                key={enlace.label}
                href={enlace.href}
                className="text-xs uppercase tracking-widest text-[hsl(var(--background))]/35 hover:text-[hsl(var(--primary))] transition-colors"
              >
                {enlace.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
