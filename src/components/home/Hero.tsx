import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-background">
      {/* Background Text Decor */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 select-none pointer-events-none opacity-[0.02] whitespace-nowrap">
         <span className="text-[30rem] font-black tracking-tighter italic">KINETIC</span>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 z-10">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-6 block fade-in">
            Selection 2024
          </span>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold uppercase tracking-tight tight-editorial text-foreground mb-8">
            Ingeniería <br /> 
            <span className="text-primary italic">en Movimiento.</span>
          </h1>
          <p className="text-lg md:text-xl text-foreground/60 max-w-xl mb-12 font-medium leading-relaxed">
            La curaduría automotriz más exclusiva de la región. Rendimiento sin precedentes, estética sin compromisos. 
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/catalogo" 
              className="bg-racing text-white px-10 py-5 text-[10px] font-black uppercase tracking-[0.3em] rounded-sm shadow-2xl hover:translate-y-[-4px] transition-all text-center"
            >
              Explorar Galería
            </Link>
            <Link 
              href="#contacto" 
              className="bg-surface-low text-foreground px-10 py-5 text-[10px] font-black uppercase tracking-[0.3em] rounded-sm hover:bg-foreground hover:text-white transition-all text-center"
            >
              Agendar Visita
            </Link>
          </div>
        </div>

        {/* Overlapping Image area */}
        <div className="lg:col-span-5 relative mt-12 lg:mt-0">
          <div className="relative aspect-[4/5] w-full bg-surface-low rounded-lg overflow-visible">
            {/* Silhouette / Shadow under the vehicle */}
            <div className="absolute -bottom-10 -right-10 w-full h-1/2 bg-primary/5 blur-3xl rounded-full" />
            
            {/* Empty space for the high-end vehicle PNG you'll provide */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
               <div className="text-[10px] font-black uppercase tracking-widest text-foreground/10 rotate-90 origin-center">
                  Masterpiece / 01
               </div>
            </div>
            
            {/* The "Bleed" element */}
            <div className="absolute top-1/2 -left-20 -translate-y-1/2 w-40 h-px bg-primary/20" />
          </div>
          
          <div className="absolute -bottom-6 -left-6 bg-surface-lowest p-8 shadow-premium z-20 hidden md:block">
             <p className="text-3xl font-bold text-foreground">0-100</p>
             <p className="text-[10px] font-black uppercase tracking-widest text-primary">2.8 Segundos</p>
          </div>
        </div>
      </div>
    </section>
  );
}