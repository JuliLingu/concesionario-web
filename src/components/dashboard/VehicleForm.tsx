"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useTransition } from "react";
import { VehicleSchema } from "@/schemas/vehicle";
import { createVehicle, updateVehicle } from "@/actions/vehicle";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { getCldUrl } from "@/lib/cloudinary";
import { 
  Combustible, 
  Transmision, 
  EstadoVehiculo, 
  EstadoPublicacion 
} from "../../../generated/prisma";
import { Box, Button, CircularProgress, Grid, IconButton, MenuItem, Select, TextField, Typography, Stack } from "@mui/material";

interface Category {
  id: string;
  nombre: string;
}

interface VehicleFormProps {
  categorias: Category[];
  initialData?: any; // The full vehicle object if we are editing
  onSuccess?: () => void;
}

export const VehicleForm = ({ categorias, initialData, onSuccess }: VehicleFormProps) => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [imagenes, setImagenes] = useState<string[]>(
    initialData?.imagenes?.map((img: any) => img.url) || []
  );

  const isEditing = !!initialData;

  const form = useForm<z.infer<typeof VehicleSchema>>({
    resolver: zodResolver(VehicleSchema),
    defaultValues: initialData ? {
      marca: initialData.marca,
      modelo: initialData.modelo,
      version: initialData.version || "",
      motor: initialData.motor || "",
      anio: initialData.anio,
      precio: Number(initialData.precio),
      kilometraje: initialData.kilometraje,
      combustible: initialData.combustible || Combustible.NAFTA,
      transmision: initialData.transmision || Transmision.MANUAL,
      estado: initialData.estado || EstadoVehiculo.USADO,
      puertas: initialData.puertas || undefined,
      potencia: initialData.potencia || undefined,
      color: initialData.color || "",
      descripcion: initialData.descripcion || "",
      categoriaId: initialData.categoriaId,
      publicacion: initialData.publicacion || EstadoPublicacion.BORRADOR,
      imagenes: initialData.imagenes?.map((img: any) => img.url) || [],
    } : {
      marca: "",
      modelo: "",
      version: "",
      motor: "",
      anio: new Date().getFullYear(),
      precio: 0,
      kilometraje: 0,
      combustible: Combustible.NAFTA,
      transmision: Transmision.MANUAL,
      estado: EstadoVehiculo.USADO,
      puertas: undefined,
      potencia: undefined,
      color: "",
      descripcion: "",
      categoriaId: categorias[0]?.id || "",
      publicacion: EstadoPublicacion.BORRADOR,
      imagenes: [],
    },
  });

  const onUpload = (result: any) => {
    const info = result.info;
    if (info && info.secure_url) {
      setImagenes((prev) => {
        const newImages = [...prev, info.secure_url];
        form.setValue("imagenes", newImages);
        return newImages;
      });
    }
  };

  const removeImage = (url: string) => {
    const newImages = imagenes.filter((img) => img !== url);
    setImagenes(newImages);
    form.setValue("imagenes", newImages);
  };

  const onSubmit = (values: z.infer<typeof VehicleSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      if (isEditing) {
        updateVehicle(initialData.id, values)
          .then((data) => {
            if (data.error) setError(data.error);
            if (data.success) {
              setSuccess(data.success);
              if (onSuccess) onSuccess();
            }
          })
          .catch(() => setError("Ocurrió un error inesperado"));
      } else {
        createVehicle(values)
          .then((data) => {
            if (data.error) setError(data.error);
            if (data.success) {
              setSuccess(data.success);
              setImagenes([]);
              form.reset();
              if (onSuccess) onSuccess();
            }
          })
          .catch(() => setError("Ocurrió un error inesperado"));
      }
    });
  };

  return (
    <Box 
      component="form" 
      onSubmit={form.handleSubmit(onSubmit)}
      sx={{ 
        bgcolor: 'background.paper', 
        p: { xs: 4, md: 6 }, 
        borderRadius: 1, 
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="h2" sx={{ fontSize: '1.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '-0.02em', color: 'text.primary' }}>
          {isEditing ? "Editar Vehículo" : "Gestión de Inventario"}
        </Typography>
        <Typography sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.4em', color: 'primary.main', mt: 1 }}>
          {isEditing ? "Vehicle Modification" : "Vehicle Specification / Entry"}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Marca */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }} >
          <TextField
            {...form.register("marca")}
            label="Marca"
            placeholder="Ej: Toyota"
            disabled={isPending}
            error={!!form.formState.errors.marca}
            helperText={form.formState.errors.marca?.message}
            fullWidth
            variant="filled"
            slotProps={{
          input: {},
          inputLabel: {}
        }}
            sx={{ '& .MuiFilledInput-root': { bgcolor: '#0a0a0a', borderRadius: 1 } }}
          />
        </Grid>

        {/* Modelo */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }} >
          <TextField
            {...form.register("modelo")}
            label="Modelo"
            placeholder="Ej: Corolla"
            disabled={isPending}
            error={!!form.formState.errors.modelo}
            helperText={form.formState.errors.modelo?.message}
            fullWidth
            variant="filled"
            slotProps={{
          input: {},
          inputLabel: {}
        }}
            sx={{ '& .MuiFilledInput-root': { bgcolor: '#0a0a0a', borderRadius: 1 } }}
          />
        </Grid>
        
        {/* Version */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }} >
          <TextField
            {...form.register("version")}
            label="Versión"
            placeholder="Ej: XEI, Sport, M Comp"
            disabled={isPending}
            fullWidth
            variant="filled"
            slotProps={{
          input: {},
          inputLabel: {}
        }}
            sx={{ '& .MuiFilledInput-root': { bgcolor: '#0a0a0a', borderRadius: 1 } }}
          />
        </Grid>

        {/* Año */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }} >
          <TextField
            {...form.register("anio", { valueAsNumber: true })}
            type="number"
            label="Año"
            disabled={isPending}
            fullWidth
            variant="filled"
            slotProps={{
          input: {},
          inputLabel: {}
        }}
            sx={{ '& .MuiFilledInput-root': { bgcolor: '#0a0a0a', borderRadius: 1 } }}
          />
        </Grid>

        {/* Precio */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }} >
          <TextField
            {...form.register("precio", { valueAsNumber: true })}
            type="number"
            label="Precio (USD)"
            disabled={isPending}
            fullWidth
            variant="filled"
            slotProps={{
          input: {},
          inputLabel: {}
        }}
            sx={{ '& .MuiFilledInput-root': { bgcolor: '#0a0a0a', borderRadius: 1 } }}
          />
        </Grid>

        {/* Kilometraje */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }} >
          <TextField
            {...form.register("kilometraje", { valueAsNumber: true })}
            type="number"
            label="Kilometraje (KM)"
            disabled={isPending}
            fullWidth
            variant="filled"
            slotProps={{
          input: {},
          inputLabel: {}
        }}
            sx={{ '& .MuiFilledInput-root': { bgcolor: '#0a0a0a', borderRadius: 1 } }}
          />
        </Grid>

        {/* Motor */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }} >
          <TextField
            {...form.register("motor")}
            label="Motor"
            placeholder="Ej: 2.0 TDI, V8 Twinturbo"
            disabled={isPending}
            fullWidth
            variant="filled"
            slotProps={{
          input: {},
          inputLabel: {}
        }}
            sx={{ '& .MuiFilledInput-root': { bgcolor: '#0a0a0a', borderRadius: 1 } }}
          />
        </Grid>

        {/* Potencia */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }} >
          <TextField
            {...form.register("potencia", { valueAsNumber: true })}
            type="number"
            label="Potencia (CV)"
            placeholder="Ej: 300"
            disabled={isPending}
            fullWidth
            variant="filled"
            slotProps={{
          input: {},
          inputLabel: {}
        }}
            sx={{ '& .MuiFilledInput-root': { bgcolor: '#0a0a0a', borderRadius: 1 } }}
          />
        </Grid>

        {/* Puertas */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }} >
          <TextField
            {...form.register("puertas", { valueAsNumber: true })}
            type="number"
            label="Puertas"
            placeholder="Ej: 4"
            disabled={isPending}
            fullWidth
            variant="filled"
            slotProps={{
          input: {},
          inputLabel: {}
        }}
            sx={{ '& .MuiFilledInput-root': { bgcolor: '#0a0a0a', borderRadius: 1 } }}
          />
        </Grid>

        {/* Color */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }} >
          <TextField
            {...form.register("color")}
            label="Color"
            placeholder="Ej: Blanco"
            disabled={isPending}
            fullWidth
            variant="filled"
            slotProps={{
          input: {},
          inputLabel: {}
        }}
            sx={{ '& .MuiFilledInput-root': { bgcolor: '#0a0a0a', borderRadius: 1 } }}
          />
        </Grid>

        {/* Combustible */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }} >
          <TextField
            select
            {...form.register("combustible")}
            defaultValue={initialData?.combustible || Combustible.NAFTA}
            label="Combustible"
            disabled={isPending}
            fullWidth
            variant="filled"
            slotProps={{
          input: {},
          inputLabel: {}
        }}
            sx={{ '& .MuiFilledInput-root': { bgcolor: '#0a0a0a', borderRadius: 1 } }}
          >
            {Object.values(Combustible).map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </TextField>
        </Grid>
        
        {/* Transmisión */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }} >
          <TextField
            select
            {...form.register("transmision")}
            defaultValue={initialData?.transmision || Transmision.MANUAL}
            label="Transmisión"
            disabled={isPending}
            fullWidth
            variant="filled"
            slotProps={{
          input: {},
          inputLabel: {}
        }}
            sx={{ '& .MuiFilledInput-root': { bgcolor: '#0a0a0a', borderRadius: 1 } }}
          >
            {Object.values(Transmision).map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Estado Vehículo */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }} >
          <TextField
            select
            {...form.register("estado")}
            defaultValue={initialData?.estado || EstadoVehiculo.USADO}
            label="Estatus Físico"
            disabled={isPending}
            fullWidth
            variant="filled"
            slotProps={{
          input: {},
          inputLabel: {}
        }}
            sx={{ '& .MuiFilledInput-root': { bgcolor: '#0a0a0a', borderRadius: 1 } }}
          >
            {Object.values(EstadoVehiculo).map((o) => (
              <MenuItem key={o} value={o}>{o}</MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Estado Publicación */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }} >
          <TextField
            select
            {...form.register("publicacion")}
            defaultValue={initialData?.publicacion || EstadoPublicacion.BORRADOR}
            label="Estado Visibilidad"
            disabled={isPending}
            fullWidth
            variant="filled"
            slotProps={{
          input: {},
          inputLabel: {}
        }}
            sx={{ '& .MuiFilledInput-root': { bgcolor: '#0a0a0a', borderRadius: 1 } }}
          >
            {Object.values(EstadoPublicacion).map((o) => (
              <MenuItem key={o} value={o}>{o}</MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Categoría */}
        <Grid size={{ xs: 12, md: 6, lg: 8 }} >
          <TextField
            select
            {...form.register("categoriaId")}
            defaultValue={initialData?.categoriaId || categorias[0]?.id || ""}
            label="Categoría"
            disabled={isPending}
            fullWidth
            variant="filled"
            slotProps={{
          input: {},
          inputLabel: {}
        }}
            sx={{ '& .MuiFilledInput-root': { bgcolor: '#0a0a0a', borderRadius: 1 } }}
          >
            {categorias.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>{cat.nombre}</MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <Box sx={{ pt: 4, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'text.secondary' }}>Galería de Imágenes</Typography>
        
        <Grid container spacing={2}>
          {imagenes.map((url) => (
            <Grid size={{ xs: 6, md: 3, lg: 2 }} key={url}>
              <Box sx={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', borderRadius: 1, bgcolor: '#0a0a0a', '&:hover .del-btn': { opacity: 1 } }}>
                <Image 
                  src={getCldUrl(url, "4:3")} 
                  alt="Imagen vehículo" 
                  fill 
                  sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 16vw"
                  style={{ objectFit: 'cover', objectPosition: 'center', transition: 'transform 0.5s' }}
                />
                <IconButton
                  onClick={() => removeImage(url)}
                  className="del-btn"
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    width: 24,
                    height: 24,
                    bgcolor: 'primary.main',
                    color: 'white',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  <X size={14} />
                </IconButton>
              </Box>
            </Grid>
          ))}

          <Grid size={{ xs: 6, md: 3, lg: 2 }} >
            <CldUploadWidget 
              onSuccess={onUpload} 
              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "concesionario_unsigned"}
              options={{
                multiple: true,
                maxFiles: 10,
                resourceType: "image",
                clientAllowedFormats: ["webp", "png", "jpg", "jpeg"],
                cropping: true,
                croppingAspectRatio: 4/3,
                croppingShowDimensions: true,
                croppingDefaultSelectionRatio: 4/3
              }}
            >
              {({ open }) => (
                <Box
                  onClick={() => open()}
                  sx={{
                    aspectRatio: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    bgcolor: '#0a0a0a',
                    border: '2px dashed rgba(255,255,255,0.1)',
                    borderRadius: 1,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    color: 'text.secondary',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'rgba(194,65,12,0.05)',
                      color: 'primary.main'
                    }
                  }}
                >
                  <ImagePlus size={24} />
                  <Typography sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Añadir</Typography>
                </Box>
              )}
            </CldUploadWidget>
          </Grid>
        </Grid>
        
        {imagenes.length === 0 && (
          <Typography sx={{ fontSize: '10px', fontWeight: 500, fontStyle: 'italic', color: 'text.secondary' }}>Sube al menos una imagen para que el vehículo sea visible en el catálogo.</Typography>
        )}
      </Box>

      {/* Descripción */}
      <Box sx={{ pt: 4, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          {...form.register("descripcion")}
          label="Descripción Editorial"
          placeholder="Describe el equipamiento, estado general, etc."
          disabled={isPending}
          multiline
          rows={5}
          fullWidth
          variant="filled"
          slotProps={{
          input: {},
          inputLabel: {}
        }}
          sx={{ '& .MuiFilledInput-root': { bgcolor: '#0a0a0a', borderRadius: 1 } }}
        />
      </Box>

      {error && <Typography sx={{ bgcolor: 'rgba(194,65,12,0.1)', color: 'primary.main', p: 2, fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{error}</Typography>}
      {success && <Typography sx={{ bgcolor: 'rgba(34,197,94,0.1)', color: '#16a34a', p: 2, fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{success}</Typography>}

      <Box sx={{ pt: 4 }}>
        <Button
          type="submit"
          disabled={isPending}
          variant="contained"
          sx={{
            bgcolor: '#c2410c',
            color: 'white',
            py: 2.5,
            px: 6,
            fontSize: '12px',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.4em',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            '&:hover': { bgcolor: '#9a3412', transform: 'translateY(-2px)' },
            transition: 'all 0.3s'
          }}
        >
          {isPending ? "PROCESANDO..." : isEditing ? "ACTUALIZAR VEHÍCULO" : "GUARDAR EN GALERÍA"}
        </Button>
      </Box>
    </Box>
  );
};