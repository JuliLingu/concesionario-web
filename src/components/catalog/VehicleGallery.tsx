"use client";

import Image from "next/image";
import { useState } from "react";
import { ImagenVehiculo } from "../../../generated/prisma";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getCldUrl } from "@/lib/cloudinary";
import { Box, IconButton, Typography, Stack } from "@mui/material";

interface VehicleGalleryProps {
  images: ImagenVehiculo[];
  altText: string;
}

export const VehicleGallery = ({ images, altText }: VehicleGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <Box 
        sx={{ 
          width: '100%', 
          aspectRatio: '4/3', 
          bgcolor: 'background.paper', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontFamily: 'var(--font-space)', 
          fontSize: '2.25rem', 
          color: 'rgba(255,255,255,0.05)', 
          fontWeight: 900, 
          borderRadius: 1, 
          border: '1px solid rgba(255,255,255,0.05)' 
        }}
      >
        JBJ
      </Box>
    );
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <Stack spacing={2}>
      {/* Main Image */}
      <Box sx={{ position: 'relative', width: '100%', aspectRatio: '4/3', bgcolor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden', '&:hover .nav-btn': { opacity: 1 } }}>
        <Image
          src={getCldUrl(images[currentIndex].url, "4:3")}
          alt={`${altText} - Imagen ${currentIndex + 1}`}
          fill
          priority
          loading="eager"
          sizes="(max-width: 1024px) 100vw, 65vw"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
        />
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <IconButton 
              className="nav-btn"
              onClick={handlePrev}
              sx={{ 
                position: 'absolute', 
                left: 8, 
                top: '50%', 
                transform: 'translateY(-50%)', 
                bgcolor: 'rgba(255,255,255,0.9)', 
                color: '#000', 
                opacity: 0, 
                transition: 'all 0.3s',
                '&:hover': { bgcolor: '#fff', transform: 'translateY(-50%) scale(1.1)' }
              }}
            >
              <ChevronLeft size={24} />
            </IconButton>
            <IconButton 
              className="nav-btn"
              onClick={handleNext}
              sx={{ 
                position: 'absolute', 
                right: 8, 
                top: '50%', 
                transform: 'translateY(-50%)', 
                bgcolor: 'rgba(255,255,255,0.9)', 
                color: '#000', 
                opacity: 0, 
                transition: 'all 0.3s',
                '&:hover': { bgcolor: '#fff', transform: 'translateY(-50%) scale(1.1)' }
              }}
            >
              <ChevronRight size={24} />
            </IconButton>
          </>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <Box sx={{ position: 'absolute', bottom: 12, right: 12, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '10px', fontWeight: 900, px: 1, py: 0.5, borderRadius: 1, letterSpacing: '0.1em' }}>
            {currentIndex + 1} / {images.length}
          </Box>
        )}
      </Box>

      {/* Thumbnails */}
      {images.length > 1 && (
        <Stack direction="row" spacing={1.5} sx={{ overflowX: 'auto', pb: 1, pt: 0.5, '&::-webkit-scrollbar': { display: 'none' } }}>
          {images.map((img, index) => (
            <Box
              key={img.id}
              component="button"
              onClick={() => setCurrentIndex(index)}
              sx={{ 
                position: 'relative', 
                flexShrink: 0, 
                width: { xs: 80, md: 96 }, 
                aspectRatio: '4/3', 
                borderRadius: 1, 
                overflow: 'hidden', 
                transition: 'all 0.3s',
                border: 'none',
                p: 0,
                cursor: 'pointer',
                ...(currentIndex === index 
                  ? { boxShadow: '0 0 0 2px #c2410c', opacity: 1 } 
                  : { boxShadow: '0 0 0 1px rgba(255,255,255,0.1)', opacity: 0.5, '&:hover': { opacity: 1 } }
                )
              }}
            >
              <Image
                src={getCldUrl(img.url, "4:3")}
                alt={`${altText} miniatura ${index + 1}`}
                fill
                sizes="96px"
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
};
