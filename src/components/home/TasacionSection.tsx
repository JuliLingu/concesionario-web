import Link from "next/link";
import { Handshake } from "lucide-react";
import type { SiteConfig } from "@/lib/configuracion-defaults";

interface TasacionSectionProps {
  configuracion: SiteConfig;
}

/**
 * Bloque de la portada que invita a entregar el usado.
 *
 * A propósito no repite el tratamiento de `FinancingSection`, que es un bloque
 * rojo a sangre: si las dos secciones están encendidas quedan una detrás de la
 * otra, y dos bloques idénticos en color se leen como una sola cosa repetida.
 * Acá el fondo es una superficie clara y el color queda para el botón.
 */
export function TasacionSection({ configuracion }: TasacionSectionProps) {
  return (
    <section id="tasacion" className="py-24 bg-[hsl(var(--background))]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="group relative bg-[hsl(var(--surface-low))] rounded-lg overflow-hidden p-12 md:p-20">

          {/* Icono decorativo de fondo, mismo recurso que la sección de
              financiación pero en tinta suave sobre superficie clara. */}
          <div className="absolute right-0 bottom-0 opacity-[0.06] text-[hsl(var(--foreground))] translate-x-1/4 translate-y-1/4 transition-transform duration-1000 ease-out group-hover:scale-105">
            <Handshake size={480} strokeWidth={0.5} color="currentColor" />
          </div>

          <div className="relative z-10 max-w-2xl">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[hsl(var(--primary))] mb-8 block">
              {configuracion.tasacionEyebrow}
            </span>
            <h2 className="text-4xl md:text-[3.5rem] font-extrabold text-[hsl(var(--foreground))] uppercase tracking-[-0.02em] mb-8 leading-[0.95] whitespace-pre-line">
              {configuracion.tasacionTitulo}
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] leading-relaxed mb-12 text-lg font-medium max-w-[52ch]">
              {configuracion.tasacionTexto}
            </p>

            <Link
              href="/tasacion"
              className="inline-block bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-12 py-5 text-[10px] font-black uppercase tracking-[0.3em] rounded shadow-[0_25px_50px_-12px_hsl(var(--primary)/0.35)] hover:brightness-90 transition-all"
            >
              {configuracion.tasacionCtaTexto}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
