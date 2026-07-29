"use client";

import { Building2 } from "lucide-react";

export function FinancingSection() {
  return (
    <section id="financiacion" className="py-24 bg-[hsl(var(--background))]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="group relative bg-[#b5000b] rounded-lg overflow-hidden p-12 md:p-24 shadow-[0_25px_50px_-12px_rgba(181,0,11,0.25)]">

          {/* Decorative Background Icon */}
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4 transition-transform duration-1000 ease-out group-hover:scale-105">
            <Building2 size={600} strokeWidth={0.5} color="white" />
          </div>

          <div className="relative z-10 max-w-2xl">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/60 mb-8 block">
              Financial Services
            </span>
            <h2 className="text-5xl md:text-[4.5rem] font-extrabold text-white uppercase tracking-[-0.02em] mb-10 italic leading-none">
              Financiación <br /> de Autor.
            </h2>
            <p className="text-white/70 leading-relaxed mb-16 text-lg font-medium">
              Planes personalizados con tasas preferenciales para nuestra selección más exclusiva. Transparencia técnica en cada cuota.
            </p>

            <div className="flex flex-wrap gap-12 mb-16">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Tasa Anual</div>
                <div className="text-4xl font-bold text-white tracking-[-0.05em]">
                  29.0<span className="text-white/50 italic">%</span>
                </div>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Entrega Mínima</div>
                <div className="text-4xl font-bold text-white tracking-[-0.05em]">
                  30.0<span className="text-white/50 italic">%</span>
                </div>
              </div>
            </div>

            <button className="bg-white text-[#b5000b] px-12 py-5 text-[10px] font-black uppercase tracking-[0.3em] rounded shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] hover:bg-[hsl(var(--foreground))] hover:text-white transition-colors">
              Simular Crédito
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
