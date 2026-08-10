"use client";

import type { SiteConfig } from "@/lib/configuracion-defaults";

interface LocationSectionProps {
  configuracion: SiteConfig;
}

export function LocationSection({ configuracion }: LocationSectionProps) {
  const address = configuracion.direccion;

  return (
    <section id="ubicacion" className="py-24 bg-[hsl(var(--surface-low))]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)] rounded-lg overflow-hidden bg-[hsl(var(--card))]">

          {/* Info Column */}
          <div className="w-full lg:w-1/2 p-12 md:p-20 flex flex-col justify-center">
            <h2 className="text-[3rem] md:text-[3.75rem] font-extrabold text-[hsl(var(--foreground))] uppercase tracking-[-0.02em] mb-16 leading-none">
              Nuestra Casa <br /> Central.
            </h2>

            <div className="flex flex-col gap-10">
              <div className="flex gap-5">
                <div className="w-px h-12 bg-[hsl(var(--primary))]/30 shrink-0" />
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))] mb-1">Ubicación</div>
                  <div className="text-[hsl(var(--foreground))] font-bold text-lg">{address}</div>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="w-px h-12 bg-[hsl(var(--primary))]/30 shrink-0" />
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))] mb-1">Contacto</div>
                  <div className="text-[hsl(var(--foreground))] font-bold text-sm uppercase tracking-[0.1em]">
                    {configuracion.telefono}
                  </div>
                  <div className="text-[hsl(var(--muted-foreground))] font-bold text-xs uppercase tracking-[0.1em] mt-1">
                    {configuracion.email}
                  </div>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="w-px h-12 bg-[hsl(var(--primary))]/30 shrink-0" />
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))] mb-1">Horarios</div>
                  <div className="text-[hsl(var(--foreground))] font-bold text-sm uppercase tracking-[0.1em] whitespace-pre-line">
                    {configuracion.horariosAtencion}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map Column */}
          <div className="group w-full lg:w-1/2 h-[400px] lg:h-auto bg-[hsl(var(--surface-low))] relative">
            <iframe
              src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              className="grayscale transition-all duration-1000 ease-in-out group-hover:grayscale-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
