"use client";

import Image from "next/image";
import { useState } from "react";
import { ImagenVehiculo } from "../../../generated/prisma";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { getCldUrl } from "@/lib/cloudinary";
import { ImageLightbox } from "./ImageLightbox";

interface VehicleGalleryProps {
  images: ImagenVehiculo[];
  altText: string;
}

export const VehicleGallery = ({ images, altText }: VehicleGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visorAbierto, setVisorAbierto] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-[4/3] bg-[hsl(var(--surface-low))] flex items-center justify-center font-black text-4xl text-black/5 rounded-lg border border-black/5">
        JBJ
      </div>
    );
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="group relative w-full aspect-[4/3] bg-[hsl(var(--surface-low))] border border-black/5 rounded-lg overflow-hidden">
        {/* La foto entera es el disparador del visor, así que va dentro de un
            botón que cubre el marco. Las flechas quedan por encima (z-10) para
            no quedar anidadas dentro de él. */}
        <button
          type="button"
          onClick={() => setVisorAbierto(true)}
          aria-label="Ampliar imagen"
          className="absolute inset-0 cursor-zoom-in"
        >
          <Image
            src={getCldUrl(images[currentIndex].url, {
              modo: "completa",
              relacion: "4:3",
            })}
            alt={`${altText} - Imagen ${currentIndex + 1}`}
            fill
            loading="eager"
            fetchPriority="high"
            sizes="(max-width: 1024px) 100vw, 65vw"
            className="object-contain"
          />

          <span className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 text-white text-[10px] font-black px-2 py-1 rounded tracking-[0.1em] opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none">
            <Maximize2 size={11} />
            Ampliar
          </span>
        </button>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 bg-white/90 text-black p-2 rounded-full opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-white hover:scale-110"
              aria-label="Imagen anterior"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 bg-white/90 text-black p-2 rounded-full opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-white hover:scale-110"
              aria-label="Imagen siguiente"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 z-10 bg-black/50 text-white text-[10px] font-black px-2 py-0.5 rounded tracking-[0.1em] pointer-events-none">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex flex-row gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
          {images.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setCurrentIndex(index)}
              className={`relative shrink-0 w-20 md:w-24 aspect-[4/3] rounded overflow-hidden transition-all duration-300 p-0 cursor-pointer ${
                currentIndex === index
                  ? "ring-2 ring-[#b5000b] opacity-100"
                  : "ring-1 ring-black/10 opacity-50 hover:opacity-100"
              }`}
            >
              <Image
                src={getCldUrl(img.url, { modo: "recorte", relacion: "4:3" })}
                alt={`${altText} miniatura ${index + 1}`}
                fill
                sizes="96px"
                className="object-cover object-center"
              />
            </button>
          ))}
        </div>
      )}

      {visorAbierto && (
        <ImageLightbox
          urls={images.map((img) => img.url)}
          indice={currentIndex}
          altText={altText}
          onCerrar={() => setVisorAbierto(false)}
          onCambiar={setCurrentIndex}
        />
      )}
    </div>
  );
};
