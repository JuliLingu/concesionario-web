"use client";

import { Building2 } from "lucide-react";
import type { SiteConfig } from "@/lib/configuracion-defaults";

interface FinancingSectionProps {
  configuracion: SiteConfig;
}

export function FinancingSection({ configuracion }: FinancingSectionProps) {
  const cifras = [
    { label: "Tasa Anual", valor: configuracion.finanTasaAnual },
    { label: "Entrega Mínima", valor: configuracion.finanEntregaMinima },
  ].filter((cifra) => cifra.valor !== null);

  return (
    <section id="financiacion" className="py-24 bg-[hsl(var(--background))]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="group relative bg-[hsl(var(--primary))] rounded-lg overflow-hidden p-12 md:p-24 shadow-[0_25px_50px_-12px_hsl(var(--primary)/0.25)]">

          {/* Decorative Background Icon */}
          <div className="absolute right-0 bottom-0 opacity-10 text-[hsl(var(--primary-foreground))] translate-x-1/4 translate-y-1/4 transition-transform duration-1000 ease-out group-hover:scale-105">
            <Building2 size={600} strokeWidth={0.5} color="currentColor" />
          </div>

          <div className="relative z-10 max-w-2xl">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[hsl(var(--primary-foreground))]/60 mb-8 block">
              {configuracion.finanEyebrow}
            </span>
            <h2 className="text-5xl md:text-[4.5rem] font-extrabold text-[hsl(var(--primary-foreground))] uppercase tracking-[-0.02em] mb-10 italic leading-none whitespace-pre-line">
              {configuracion.finanTitulo}
            </h2>
            <p className="text-[hsl(var(--primary-foreground))]/70 leading-relaxed mb-16 text-lg font-medium">
              {configuracion.finanTexto}
            </p>

            {cifras.length > 0 && (
              <div className="flex flex-wrap items-center gap-12 mb-16">
                {cifras.map((cifra, index) => (
                  <div key={cifra.label} className="flex items-center gap-12">
                    {index > 0 && <div className="w-px h-12 bg-[hsl(var(--primary-foreground))]/10" />}
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--primary-foreground))]/40 mb-2">
                        {cifra.label}
                      </div>
                      <div className="text-4xl font-bold text-[hsl(var(--primary-foreground))] tracking-[-0.05em]">
                        {cifra.valor!.toFixed(1)}
                        <span className="text-[hsl(var(--primary-foreground))]/50 italic">%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button className="bg-[hsl(var(--primary-foreground))] text-[hsl(var(--primary))] px-12 py-5 text-[10px] font-black uppercase tracking-[0.3em] rounded shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] transition-colors">
              {configuracion.finanCtaTexto}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
