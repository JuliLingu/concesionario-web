import { MapPin, Clock } from "lucide-react";

export function LocationSection() {
  return (
    <section id="ubicacion" className="py-24 bg-surface-low">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 shadow-premium">
        {/* Info Column */}
        <div className="bg-surface-lowest p-12 md:p-24 flex flex-col justify-center">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-6 block">
            Visit Us
          </span>
          <h2 className="text-5xl md:text-6xl font-bold text-foreground uppercase tracking-tight tight-editorial mb-16">
            Nuestra Casa <br /> Central.
          </h2>

          <div className="space-y-12">
            <div className="flex gap-6">
              <div className="w-px h-12 bg-primary/30" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-2">Location</p>
                <p className="text-foreground font-bold text-lg">Av. Principal 123, Buenos Aires</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-px h-12 bg-primary/30" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-2">Open Hours</p>
                <p className="text-foreground font-bold text-sm uppercase tracking-widest">Lun — Vie: 09:00 — 19:00</p>
                <p className="text-foreground/40 font-bold text-xs uppercase tracking-widest mt-1">Sábados: 10:00 — 14:00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Map Column */}
        <div className="w-full h-[400px] lg:h-full bg-surface-low overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-1000">
           <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3285.218552991631!2d-58.4613291!3d-34.573351!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb59020000001%3A0x123456789!2sAv.%20de%20los%20Incas%201234!5e0!3m2!1ses!2sar!4v1710000000000!5m2!1ses!2sar" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy">
          </iframe>
          {/* Overlay Tag */}
          <div className="absolute top-12 right-12 bg-foreground text-white p-6 shadow-2xl">
             <p className="text-2xl font-bold font-space tracking-tight italic">HQ-01</p>
             <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/40 mt-1">Buenos Aires Est.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

