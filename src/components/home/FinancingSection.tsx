import { Building2 } from "lucide-react";

export function FinancingSection() {
  return (
    <section id="financiacion" className="py-24 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative bg-racing rounded-lg overflow-hidden p-12 md:p-24 shadow-premium group">
          {/* Decorative Background Icon */}
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4 group-hover:scale-105 transition-transform duration-1000">
            <Building2 size={600} strokeWidth={0.5} />
          </div>

          <div className="relative z-10 max-w-2xl">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/60 mb-8 block">
               Financial Services
            </span>
            <h2 className="text-5xl md:text-7xl font-bold text-white uppercase tracking-tight tight-editorial mb-12 italic">
               Financiación <br /> de Autor.
            </h2>
            <p className="text-white/70 leading-relaxed mb-16 text-lg font-medium">
               Planes personalizados con tasas preferenciales para nuestra selección más exclusiva. Transparencia técnica en cada cuota.
            </p>

            <div className="flex flex-wrap gap-12 mb-16">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Tasa Anual</p>
                <p className="text-4xl font-bold font-space text-white tracking-tighter">29.0<span className="text-white/50 italic">%</span></p>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Entrega Mínima</p>
                <p className="text-4xl font-bold font-space text-white tracking-tighter">30.0<span className="text-white/50 italic">%</span></p>
              </div>
            </div>

            <button className="bg-white text-primary px-12 py-5 text-[10px] font-black uppercase tracking-[0.3em] rounded-sm hover:bg-foreground hover:text-white transition-all shadow-2xl">
               Simular Crédito
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

