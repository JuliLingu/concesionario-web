import Link from "next/link";
import { Globe, Link as LinkIcon, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-surface-low pt-32 pb-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-8 mb-24">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="inline-block mb-8">
              <span className="text-2xl font-bold tracking-tighter text-foreground font-space">
                JBJ<span className="text-primary italic">.</span>
              </span>
            </Link>
            <p className="text-foreground/60 text-sm leading-relaxed max-w-xs">
              Redefiniendo el estándar automotriz a través de la excelencia técnica y un servicio editorializado.
            </p>
          </div>

          <div>
             <h4 className="font-space text-[10px] font-black uppercase tracking-[0.4em] text-foreground mb-8">Contacto</h4>
             <ul className="space-y-4 text-xs font-bold text-foreground/50 uppercase tracking-widest">
               <li className="hover:text-primary transition-colors">Av. Principal 123</li>
               <li className="hover:text-primary transition-colors">+54 11 5321-0073</li>
               <li className="hover:text-primary transition-colors">ventas@jbj.com</li>
             </ul>
          </div>

          <div>
             <h4 className="font-space text-[10px] font-black uppercase tracking-[0.4em] text-foreground mb-8">Legal</h4>
             <ul className="space-y-4 text-xs font-bold text-foreground/50 uppercase tracking-widest">
               <li className="hover:text-primary transition-colors">Privacidad</li>
               <li className="hover:text-primary transition-colors">Términos</li>
               <li className="hover:text-primary transition-colors">Financiación</li>
             </ul>
          </div>

          <div>
             <h4 className="font-space text-[10px] font-black uppercase tracking-[0.4em] text-foreground mb-8">Síguenos</h4>
             <div className="flex gap-4">
               <div className="w-10 h-10 rounded-sm bg-white flex items-center justify-center text-foreground/40 hover:text-white hover:bg-primary transition-all cursor-pointer shadow-sm">
                 <Globe size={18} />
               </div>
               <div className="w-10 h-10 rounded-sm bg-white flex items-center justify-center text-foreground/40 hover:text-white hover:bg-primary transition-all cursor-pointer shadow-sm">
                 <LinkIcon size={18} />
               </div>
               <div className="w-10 h-10 rounded-sm bg-white flex items-center justify-center text-foreground/40 hover:text-white hover:bg-primary transition-all cursor-pointer shadow-sm">
                 <Phone size={18} />
               </div>
             </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-foreground/[0.05] gap-4">
           <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">
             © 2024 JBJ Automotores. ENGINEERING MOVEMENT.
           </p>
           <div className="flex gap-8">
              <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">Arg - Buenos Aires</span>
           </div>
        </div>
      </div>
    </footer>
  );
}