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
    <form 
      onSubmit={form.handleSubmit(onSubmit)}
      className="bg-[hsl(var(--card))] p-6 md:p-10 rounded shadow-premium flex flex-col gap-8"
    >
      <div>
        <h2 className="text-3xl font-bold tracking-tight uppercase text-foreground">
          {isEditing ? "Editar Vehículo" : "Gestión de Inventario"}
        </h2>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[hsl(var(--primary))] mt-2">
          {isEditing ? "Vehicle Modification" : "Vehicle Specification / Entry"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Marca */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Marca</label>
          <input
            {...form.register("marca")}
            placeholder="Ej: Toyota"
            disabled={isPending}
            className="w-full bg-[hsl(var(--surface-low))] px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]/20 border border-transparent focus:border-[hsl(var(--primary))]/20"
          />
          {form.formState.errors.marca && <span className="text-[10px] text-red-500">{form.formState.errors.marca.message}</span>}
        </div>

        {/* Modelo */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Modelo</label>
          <input
            {...form.register("modelo")}
            placeholder="Ej: Corolla"
            disabled={isPending}
            className="w-full bg-[hsl(var(--surface-low))] px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]/20 border border-transparent focus:border-[hsl(var(--primary))]/20"
          />
          {form.formState.errors.modelo && <span className="text-[10px] text-red-500">{form.formState.errors.modelo.message}</span>}
        </div>
        
        {/* Version */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Versión</label>
          <input
            {...form.register("version")}
            placeholder="Ej: XEI, Sport, M Comp"
            disabled={isPending}
            className="w-full bg-[hsl(var(--surface-low))] px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]/20 border border-transparent focus:border-[hsl(var(--primary))]/20"
          />
        </div>

        {/* Año */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Año</label>
          <input
            {...form.register("anio", { valueAsNumber: true })}
            type="number"
            disabled={isPending}
            className="w-full bg-[hsl(var(--surface-low))] px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]/20 border border-transparent focus:border-[hsl(var(--primary))]/20"
          />
        </div>

        {/* Precio */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Precio (USD)</label>
          <input
            {...form.register("precio", { valueAsNumber: true })}
            type="number"
            disabled={isPending}
            className="w-full bg-[hsl(var(--surface-low))] px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]/20 border border-transparent focus:border-[hsl(var(--primary))]/20"
          />
        </div>

        {/* Kilometraje */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Kilometraje (KM)</label>
          <input
            {...form.register("kilometraje", { valueAsNumber: true })}
            type="number"
            disabled={isPending}
            className="w-full bg-[hsl(var(--surface-low))] px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]/20 border border-transparent focus:border-[hsl(var(--primary))]/20"
          />
        </div>

        {/* Motor */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Motor</label>
          <input
            {...form.register("motor")}
            placeholder="Ej: 2.0 TDI, V8 Twinturbo"
            disabled={isPending}
            className="w-full bg-[hsl(var(--surface-low))] px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]/20 border border-transparent focus:border-[hsl(var(--primary))]/20"
          />
        </div>

        {/* Potencia */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Potencia (CV)</label>
          <input
            {...form.register("potencia", { valueAsNumber: true })}
            type="number"
            placeholder="Ej: 300"
            disabled={isPending}
            className="w-full bg-[hsl(var(--surface-low))] px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]/20 border border-transparent focus:border-[hsl(var(--primary))]/20"
          />
        </div>

        {/* Puertas */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Puertas</label>
          <input
            {...form.register("puertas", { valueAsNumber: true })}
            type="number"
            placeholder="Ej: 4"
            disabled={isPending}
            className="w-full bg-[hsl(var(--surface-low))] px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]/20 border border-transparent focus:border-[hsl(var(--primary))]/20"
          />
        </div>

        {/* Color */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Color</label>
          <input
            {...form.register("color")}
            placeholder="Ej: Blanco"
            disabled={isPending}
            className="w-full bg-[hsl(var(--surface-low))] px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]/20 border border-transparent focus:border-[hsl(var(--primary))]/20"
          />
        </div>

        {/* Combustible */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Combustible</label>
          <select
            {...form.register("combustible")}
            disabled={isPending}
            className="w-full bg-[hsl(var(--surface-low))] px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]/20 border border-transparent focus:border-[hsl(var(--primary))]/20"
          >
            {Object.values(Combustible).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        
        {/* Transmisión */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Transmisión</label>
          <select
            {...form.register("transmision")}
            disabled={isPending}
            className="w-full bg-[hsl(var(--surface-low))] px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]/20 border border-transparent focus:border-[hsl(var(--primary))]/20"
          >
            {Object.values(Transmision).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Estado Vehículo */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Estatus Físico</label>
          <select
            {...form.register("estado")}
            disabled={isPending}
            className="w-full bg-[hsl(var(--surface-low))] px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]/20 border border-transparent focus:border-[hsl(var(--primary))]/20"
          >
            {Object.values(EstadoVehiculo).map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        {/* Estado Publicación */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Estado Visibilidad</label>
          <select
            {...form.register("publicacion")}
            disabled={isPending}
            className="w-full bg-[hsl(var(--surface-low))] px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]/20 border border-transparent focus:border-[hsl(var(--primary))]/20"
          >
            {Object.values(EstadoPublicacion).map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        {/* Categoría */}
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Categoría</label>
          <select
            {...form.register("categoriaId")}
            disabled={isPending}
            className="w-full bg-[hsl(var(--surface-low))] px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]/20 border border-transparent focus:border-[hsl(var(--primary))]/20"
          >
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="pt-8 border-t border-black/5 flex flex-col gap-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">Galería de Imágenes</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {imagenes.map((url) => (
            <div key={url} className="relative aspect-[4/3] overflow-hidden rounded bg-black/5 group">
              <Image 
                src={getCldUrl(url, "4:3")} 
                alt="Imagen vehículo" 
                fill 
                sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 16vw"
                className="object-cover object-center transition-transform duration-500"
              />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-1 right-1 w-6 h-6 bg-[hsl(var(--primary))] text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded hover:bg-red-800"
              >
                <X size={14} />
              </button>
            </div>
          ))}

          <div>
            <CldUploadWidget 
              onSuccess={onUpload} 
              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "concesionario_unsigned"}
              options={{
                multiple: true,
                maxFiles: 10,
                resourceType: "image",
                clientAllowedFormats: ["webp", "png", "jpg", "jpeg"]
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  className="w-full aspect-square flex flex-col items-center justify-center gap-2 bg-[hsl(var(--surface-low))] border-2 border-dashed border-black/10 rounded cursor-pointer transition-colors text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/5 hover:text-[hsl(var(--primary))]"
                >
                  <ImagePlus size={24} />
                  <span className="text-[10px] font-black uppercase tracking-[0.1em]">Añadir</span>
                </button>
              )}
            </CldUploadWidget>
          </div>
        </div>
        
        {imagenes.length === 0 && (
          <p className="text-[10px] font-medium italic text-[hsl(var(--muted-foreground))]">Sube al menos una imagen para que el vehículo sea visible en el catálogo.</p>
        )}
      </div>

      {/* Descripción */}
      <div className="pt-8 border-t border-black/5 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Descripción Editorial</label>
          <textarea
            {...form.register("descripcion")}
            placeholder="Describe el equipamiento, estado general, etc."
            disabled={isPending}
            rows={5}
            className="w-full bg-[hsl(var(--surface-low))] px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]/20 border border-transparent focus:border-[hsl(var(--primary))]/20 resize-y"
          />
        </div>
      </div>

      {error && <p className="bg-red-500/10 text-red-600 p-4 text-[10px] font-black uppercase tracking-[0.1em] rounded">{error}</p>}
      {success && <p className="bg-green-500/10 text-green-600 p-4 text-[10px] font-black uppercase tracking-[0.1em] rounded">{success}</p>}

      <div className="pt-8">
        <button
          type="submit"
          disabled={isPending}
          className="bg-[hsl(var(--primary))] text-white py-3 px-8 text-xs font-black uppercase tracking-[0.4em] rounded shadow-premium transition-all hover:bg-red-800 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isPending ? "PROCESANDO..." : isEditing ? "ACTUALIZAR VEHÍCULO" : "GUARDAR EN GALERÍA"}
        </button>
      </div>
    </form>
  );
};