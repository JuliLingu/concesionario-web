"use client";

import Image from "next/image";
import { useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { getCldUrl } from "@/lib/cloudinary";

interface ImageLightboxProps {
  urls: string[];
  indice: number;
  altText: string;
  onCerrar: () => void;
  onCambiar: (indice: number) => void;
}

/**
 * Visor a pantalla completa: muestra la imagen tal cual está guardada en
 * Cloudinary, sin recortes ni relleno, escalada para entrar en la ventana.
 */
export const ImageLightbox = ({
  urls,
  indice,
  altText,
  onCerrar,
  onCambiar,
}: ImageLightboxProps) => {
  const total = urls.length;

  useEffect(() => {
    const alPresionar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") onCerrar();
      if (evento.key === "ArrowRight") onCambiar((indice + 1) % total);
      if (evento.key === "ArrowLeft") onCambiar((indice - 1 + total) % total);
    };

    window.addEventListener("keydown", alPresionar);
    // Sin esto la página de atrás sigue scrolleando detrás del visor.
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", alPresionar);
      document.body.style.overflow = overflowPrevio;
    };
  }, [indice, total, onCerrar, onCambiar]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${altText} — imagen ${indice + 1} de ${total}`}
      onClick={onCerrar}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-4 md:p-10"
    >
      <button
        type="button"
        onClick={onCerrar}
        aria-label="Cerrar visor"
        className="absolute right-3 top-3 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-[hsl(var(--primary))]"
      >
        <X size={22} />
      </button>

      <div className="relative h-full w-full">
        <Image
          key={urls[indice]}
          src={getCldUrl(urls[indice], { modo: "original" })}
          alt={`${altText} - Imagen ${indice + 1}`}
          fill
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
          quality={90}
          className="object-contain"
        />
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            aria-label="Imagen anterior"
            onClick={(evento) => {
              evento.stopPropagation();
              onCambiar((indice - 1 + total) % total);
            }}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-all hover:scale-110 hover:bg-white hover:text-black md:left-4"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            type="button"
            aria-label="Imagen siguiente"
            onClick={(evento) => {
              evento.stopPropagation();
              onCambiar((indice + 1) % total);
            }}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-all hover:scale-110 hover:bg-white hover:text-black md:right-4"
          >
            <ChevronRight size={28} />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded bg-white/10 px-3 py-1 text-[11px] font-black tracking-[0.1em] text-white tabular-nums">
            {indice + 1} / {total}
          </div>
        </>
      )}
    </div>
  );
};
