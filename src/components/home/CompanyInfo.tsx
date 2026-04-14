import Image from "next/image";

export function CompanyInfo() {
  return (
    <section id="nosotros" className="py-32 bg-background overflow-hidden relative">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
        {/* Content Area */}
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-8 block">
            Our DNA / Legacy
          </span>
          <h2 className="text-6xl md:text-7xl font-bold text-foreground uppercase tracking-tight tight-editorial mb-12">
            La Maestría <br /> 
            detrás del <br /> 
            volante.
          </h2>
          <p className="text-foreground/60 leading-relaxed mb-16 text-lg font-medium max-w-md">
            En JBJ Automotores, operamos bajo el principio de que un vehículo es una extensión de la identidad. Nuestra trayectoria de dos décadas redefine la curaduría automotriz, seleccionando piezas que trascienden lo convencional.
          </p>

          <div className="grid grid-cols-2 gap-16 pt-12 border-t border-foreground/[0.05]">
            <div>
              <p className="text-5xl font-bold font-space text-foreground mb-4">5K<span className="text-primary italic">+</span></p>
              <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Relaciones Consolidadas</p>
            </div>
            <div>
              <p className="text-5xl font-bold font-space text-foreground mb-4">24<span className="text-primary italic">/</span>7</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Soporte de Ingeniería</p>
            </div>
          </div>
        </div>

        {/* Image Area with Editorial Overlap */}
        <div className="relative">
           <div className="aspect-square bg-surface-low rounded-lg shadow-premium relative z-10 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-[15rem] font-black text-foreground/[0.02] -rotate-12 italic">JBJ</span>
              </div>
           </div>
           {/* Decorative overlapping element */}
           <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
           <div className="absolute bottom-12 -left-12 w-48 h-48 border-[20px] border-surface-low z-0" />
        </div>
      </div>
    </section>
  );
}
