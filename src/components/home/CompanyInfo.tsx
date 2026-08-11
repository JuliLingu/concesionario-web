import Image from "next/image";
import type { SiteConfig } from "@/lib/configuracion-defaults";

interface CompanyInfoProps {
  configuracion: SiteConfig;
}

export function CompanyInfo({ configuracion }: CompanyInfoProps) {
  // Marca de agua decorativa: la primera palabra del nombre de la concesionaria.
  const marcaDeAgua = configuracion.nombreConcesionaria.split(" ")[0];

  const metricas = [
    {
      valor: configuracion.nosotrosMetrica1Valor,
      sufijo: configuracion.nosotrosMetrica1Sufijo,
      label: configuracion.nosotrosMetrica1Label,
    },
    {
      valor: configuracion.nosotrosMetrica2Valor,
      sufijo: configuracion.nosotrosMetrica2Sufijo,
      label: configuracion.nosotrosMetrica2Label,
    },
  ];

  return (
    <section id="nosotros" className="py-32 bg-[hsl(var(--background))] overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">

          {/* Content Area */}
          <div>
            <h2 className="text-[3.75rem] md:text-[4.5rem] font-extrabold uppercase tracking-[-0.02em] text-[hsl(var(--foreground))] leading-none mb-10 whitespace-pre-line">
              {configuracion.nosotrosTitulo}
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] leading-relaxed mb-16 text-lg font-medium max-w-md">
              {configuracion.nosotrosTexto}
            </p>

            <div className="grid grid-cols-2 gap-12 pt-8 border-t border-black/5">
              {metricas.map((metrica) => (
                <div key={metrica.label}>
                  <div className="text-5xl font-bold text-[hsl(var(--foreground))] mb-3 leading-none">
                    {metrica.valor}
                    <span className="text-[hsl(var(--primary))] italic">{metrica.sufijo}</span>
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
                    {metrica.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image Area */}
          <div className="relative">
            <div className="aspect-square bg-[hsl(var(--surface-low))] rounded-lg relative z-10 overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)]">
              {configuracion.logoUrl ? (
                <Image
                  src={configuracion.logoUrl}
                  alt={configuracion.nombreConcesionaria}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain p-16"
                />
              ) : (
                // Sin logo cargado: se mantiene la marca de agua con el nombre.
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[15rem] font-black text-black/[0.03] -rotate-12 italic">
                    {marcaDeAgua}
                  </span>
                </div>
              )}
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-[hsl(var(--primary))]/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-8 -left-12 w-48 h-48 border-[20px] border-[hsl(var(--surface-low))] z-0" />
          </div>

        </div>
      </div>
    </section>
  );
}
