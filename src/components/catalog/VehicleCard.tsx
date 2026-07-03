"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Vehiculo, ImagenVehiculo } from "../../../generated/prisma";
import { Calendar, Fuel, AlignJustify, ArrowRight, Settings2 } from "lucide-react";
import { EditModal } from "./EditModal";
import { getCldUrl } from "@/lib/cloudinary";
import { Box, Typography, Button, IconButton } from "@mui/material";

interface VehicleCardProps {
  vehiculo: Omit<Vehiculo, "precio"> & {
    imagenes: ImagenVehiculo[];
    precio: number;
  };
  isAdmin?: boolean;
  categorias?: { id: string; nombre: string }[];
  priority?: boolean;
  cotizacionDolar?: number | null;
}

export const VehicleCard = ({ vehiculo, isAdmin = false, categorias = [], priority = false, cotizacionDolar }: VehicleCardProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const imagenPrincipal = vehiculo.imagenes.find(img => img.esPrincipal)?.url || vehiculo.imagenes[0]?.url || "";

  return (
    <Box 
      sx={{ 
        bgcolor: '#0a0a0a', 
        position: 'relative', 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        transition: 'all 0.3s',
        '&:hover': {
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          '& .vehicle-img': {
            transform: 'scale(1.05)'
          }
        }
      }}
    >
      {/* Top Image Section */}
      <Box sx={{ position: 'relative', aspectRatio: '4/3', width: '100%', bgcolor: '#171717', overflow: 'hidden' }}>
        {imagenPrincipal ? (
          <Image
            src={getCldUrl(imagenPrincipal, "4:3")}
            alt={`${vehiculo.marca} ${vehiculo.modelo}`}
            fill
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="vehicle-img"
            style={{ objectFit: 'cover', objectPosition: 'center', transition: 'transform 0.7s ease' }}
          />
        ) : (
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ color: 'rgba(255,255,255,0.05)', fontWeight: 900, fontSize: '2.25rem', fontStyle: 'italic' }}>
              JBJ
            </Typography>
          </Box>
        )}

        {/* Edit Overlay Button */}
        {isAdmin && (
          <Button
            onClick={(e) => { e.preventDefault(); setIsEditModalOpen(true); }}
            variant="contained"
            sx={{ 
              position: 'absolute', 
              top: 12, 
              right: 12, 
              zIndex: 10, 
              bgcolor: 'rgba(0,0,0,0.6)', 
              backdropFilter: 'blur(4px)',
              color: 'white',
              fontSize: '9px',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              p: '6px 12px',
              minWidth: 0,
              gap: 1,
              '&:hover': { bgcolor: 'primary.main' }
            }}
          >
            <Settings2 size={11} />
            Editar
          </Button>
        )}
      </Box>

      {/* Content Section */}
      <Box sx={{ display: 'flex', flexDirection: 'column', p: 3, flexGrow: 1 }}>
        {/* Badges row */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography sx={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'primary.main' }}>
            Nuevo Ingreso
          </Typography>
          <Typography sx={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.6)', px: 1, py: 0.5, bgcolor: '#171717' }}>
            {vehiculo.estado}
          </Typography>
        </Box>

        {/* Title */}
        <Typography variant="h3" sx={{ fontSize: '1.5rem', fontWeight: 700, color: 'text.primary', letterSpacing: '-0.05em', lineHeight: 1, mb: 0.5 }}>
          {vehiculo.marca} {vehiculo.modelo}
        </Typography>

        {/* Subtitle / Engine */}
        <Typography sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', mb: 3, fontWeight: 500 }}>
          {vehiculo.version || vehiculo.motor || "Versión Base"}
        </Typography>

        {/* Inline Specs */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, color: 'rgba(255,255,255,0.6)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Calendar size={14} style={{ opacity: 0.4 }} />
            <Typography sx={{ fontSize: '11px', fontWeight: 700 }}>{vehiculo.anio}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Fuel size={14} style={{ opacity: 0.4 }} />
            <Typography sx={{ fontSize: '11px', fontWeight: 700, textTransform: 'capitalize' }}>{vehiculo.combustible?.toLowerCase()}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AlignJustify size={14} style={{ opacity: 0.4 }} />
            <Typography sx={{ fontSize: '11px', fontWeight: 700, textTransform: 'capitalize' }}>{vehiculo.transmision?.toLowerCase()}</Typography>
          </Box>
        </Box>

        {/* Price and CTA */}
        <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: 'primary.main', letterSpacing: '-0.05em' }}>
            {cotizacionDolar 
              ? `ARS $ ${(vehiculo.precio * cotizacionDolar).toLocaleString("es-AR")}` 
              : `U$D ${vehiculo.precio.toLocaleString("es-AR")}`}
          </Typography>
          <Button
            component={Link}
            href={`/catalogo/${vehiculo.id}`}
            variant="contained"
            sx={{
              bgcolor: '#c2410c',
              color: 'white',
              px: 2.5,
              py: 1.5,
              fontSize: '11px',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              boxShadow: '0 4px 6px -1px rgba(194,65,12,0.2), 0 2px 4px -1px rgba(194,65,12,0.1)',
              display: 'flex',
              gap: 1,
              '&:hover': { bgcolor: '#9a3412', opacity: 0.9 },
              '&:active': { transform: 'scale(0.95)' }
            }}
          >
            Ver Detalles <ArrowRight size={14} />
          </Button>
        </Box>
      </Box>

      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        vehiculo={vehiculo}
        categorias={categorias}
      />
    </Box>
  );
};
