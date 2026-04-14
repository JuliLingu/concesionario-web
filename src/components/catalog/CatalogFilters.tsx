"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface CatalogFiltersProps {
  marcasDisponibles: string[];
}

export const CatalogFilters = ({ marcasDisponibles }: CatalogFiltersProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Helper to create query string
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const toggleMarca = (marca: string) => {
    // Current marcas in URL
    const currentMarcas = searchParams.getAll("marca");
    const params = new URLSearchParams(searchParams.toString());
    
    // We could clear it or toggle. If we toggle multiple:
    if (currentMarcas.includes(marca)) {
      // Remove it
      params.delete("marca"); // Removes all, we must add back the others to support multiple
      currentMarcas.filter(m => m !== marca).forEach(m => params.append("marca", m));
    } else {
      params.append("marca", marca);
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const setTransmision = (transmision: string | null) => {
    router.push(`${pathname}?${createQueryString("transmision", transmision || "")}`);
  };

  const currentMarcas = searchParams.getAll("marca");
  const currentTransmision = searchParams.get("transmision");

  return (
    <div className="w-full bg-surface-lowest p-6 shadow-sm border border-foreground/[0.05]">
      <div className="flex items-center justify-between mb-8">
        <h4 className="font-bold text-foreground text-lg uppercase tracking-tight">Filtros</h4>
        <button 
          onClick={() => router.push(pathname)}
          className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
        >
          Limpiar
        </button>
      </div>

      {/* Marca */}
      <div className="mb-8">
        <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-4">Marca</h5>
        <div className="space-y-3">
          {marcasDisponibles.map((marca) => (
            <label key={marca} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-4 h-4 border flex items-center justify-center transition-all ${currentMarcas.includes(marca) ? "bg-primary border-primary" : "border-foreground/20 group-hover:border-primary/50"}`}>
                {currentMarcas.includes(marca) && (
                  <div className="w-2 h-2 bg-white" />
                )}
              </div>
              <span className="text-[13px] font-medium text-foreground">{marca}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rango de Precio Visual/Fake para el diseño */}
      <div className="mb-8">
        <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-4">Rango de Precio</h5>
        <div className="relative w-full h-1 bg-surface-low rounded-full mb-4">
           {/* Visual red line */}
           <div className="absolute left-[20%] right-[30%] h-full bg-primary rounded-full"></div>
           <div className="absolute left-[20%] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary ring-4 ring-white shadow-md"></div>
           <div className="absolute right-[30%] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary ring-4 ring-white shadow-md"></div>
        </div>
        <div className="flex items-center justify-between text-[10px] font-bold text-foreground/50">
           <span>U$D 10k</span>
           <span>U$D 250k+</span>
        </div>
      </div>

      {/* Transmisión */}
      <div className="mb-8">
        <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-4">Transmisión</h5>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setTransmision(currentTransmision === "AUTOMATICA" ? null : "AUTOMATICA")}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${currentTransmision === "AUTOMATICA" ? "bg-primary text-white" : "bg-surface-low text-foreground/60 hover:bg-foreground hover:text-white"}`}
          >
            Automática
          </button>
          <button 
            onClick={() => setTransmision(currentTransmision === "MANUAL" ? null : "MANUAL")}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${currentTransmision === "MANUAL" ? "bg-primary text-white" : "bg-surface-low text-foreground/60 hover:bg-foreground hover:text-white"}`}
          >
            Manual
          </button>
        </div>
      </div>

      {/* Año */}
      <div className="mb-4">
        <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-4">Año</h5>
        <div className="grid grid-cols-2 gap-4">
           <select className="bg-surface-low border-none p-3 text-[12px] font-medium outline-none text-foreground cursor-pointer focus:ring-1 focus:ring-primary/20">
             <option>Desde</option>
             <option>2015</option>
             <option>2020</option>
           </select>
           <select className="bg-surface-low border-none p-3 text-[12px] font-medium outline-none text-foreground cursor-pointer focus:ring-1 focus:ring-primary/20">
             <option>Hasta</option>
             <option>2023</option>
             <option>2024</option>
           </select>
        </div>
      </div>

    </div>
  );
};
