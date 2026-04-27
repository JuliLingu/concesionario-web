"use client";

import Image from "next/image";
import { useState } from "react";
import { ImagenVehiculo } from "../../../generated/prisma";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getCldUrl } from "@/lib/cloudinary";

interface VehicleGalleryProps {
  images: ImagenVehiculo[];
  altText: string;
}

export const VehicleGallery = ({ images, altText }: VehicleGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-[4/3] bg-surface-low flex items-center justify-center font-space text-4xl text-foreground/10 font-black rounded-sm border border-foreground/5">
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
      <div className="relative w-full aspect-[4/3] bg-surface-lowest border border-foreground/5 rounded-md overflow-hidden group">
        <Image
          src={getCldUrl(images[currentIndex].url, "4:3")}
          alt={`${altText} - Imagen ${currentIndex + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 65vw"
          className="object-cover object-center"
        />
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-md text-foreground hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-md text-foreground hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] font-black px-2 py-1 rounded-sm tracking-widest">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide py-1">
          {images.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setCurrentIndex(index)}
              className={`relative flex-shrink-0 w-20 md:w-24 aspect-[4/3] rounded-md overflow-hidden transition-all ${
                currentIndex === index 
                  ? "ring-2 ring-primary ring-offset-2 opacity-100" 
                  : "border border-foreground/10 opacity-50 hover:opacity-100"
              }`}
            >
              <Image
                src={getCldUrl(img.url, "4:3")}
                alt={`${altText} miniatura ${index + 1}`}
                fill
                sizes="96px"
                className="object-cover object-center"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
