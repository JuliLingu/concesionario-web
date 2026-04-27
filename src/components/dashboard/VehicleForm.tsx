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
      className="space-y-8 bg-surface-lowest p-10 md:p-14 shadow-premium rounded-sm"
    >
      <div className="mb-12">
        <h2 className="text-3xl font-bold font-space uppercase tracking-tight text-foreground">
          {isEditing ? "Editar Vehículo" : "Gestión de Inventario"}
        </h2>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mt-2">
          {isEditing ? "Vehicle Modification" : "Vehicle Specification / Entry"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Marca */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Marca</label>
          <input
            {...form.register("marca")}
            placeholder="Ej: Toyota"
            disabled={isPending}
            className="bg-surface-low px-4 py-3 rounded-sm outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium text-sm border-none"
          />
          {form.formState.errors.marca && (
            <span className="text-primary text-[10px] font-black uppercase mt-1">{form.formState.errors.marca.message}</span>
          )}
        </div>

        {/* Modelo */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Modelo</label>
          <input
            {...form.register("modelo")}
            placeholder="Ej: Corolla"
            disabled={isPending}
            className="bg-surface-low px-4 py-3 rounded-sm outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium text-sm border-none"
          />
          {form.formState.errors.modelo && (
            <span className="text-primary text-[10px] font-black uppercase mt-1">{form.formState.errors.modelo.message}</span>
          )}
        </div>
        
        {/* Version */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Versión</label>
          <input
            {...form.register("version")}
            placeholder="Ej: XEI, Sport, M Comp"
            disabled={isPending}
            className="bg-surface-low px-4 py-3 rounded-sm outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium text-sm border-none"
          />
        </div>

        {/* Año */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Año</label>
          <input
            {...form.register("anio", { valueAsNumber: true })}
            type="number"
            disabled={isPending}
            className="bg-surface-low px-4 py-3 rounded-sm outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium text-sm border-none"
          />
        </div>

        {/* Precio */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Precio (USD)</label>
          <input
            {...form.register("precio", { valueAsNumber: true })}
            type="number"
            disabled={isPending}
            className="bg-surface-low px-4 py-3 rounded-sm outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium text-sm border-none"
          />
        </div>

        {/* Kilometraje */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Kilometraje (KM)</label>
          <input
            {...form.register("kilometraje", { valueAsNumber: true })}
            type="number"
            disabled={isPending}
            className="bg-surface-low px-4 py-3 rounded-sm outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium text-sm border-none"
          />
        </div>

        {/* Motor */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Motor</label>
          <input
            {...form.register("motor")}
            placeholder="Ej: 2.0 TDI, V8 Twinturbo"
            disabled={isPending}
            className="bg-surface-low px-4 py-3 rounded-sm outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium text-sm border-none"
          />
        </div>

        {/* Potencia */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Potencia (CV)</label>
          <input
            {...form.register("potencia", { valueAsNumber: true })}
            type="number"
            placeholder="Ej: 300"
            disabled={isPending}
            className="bg-surface-low px-4 py-3 rounded-sm outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium text-sm border-none"
          />
        </div>

        {/* Puertas */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Puertas</label>
          <input
            {...form.register("puertas", { valueAsNumber: true })}
            type="number"
            placeholder="Ej: 4"
            disabled={isPending}
            className="bg-surface-low px-4 py-3 rounded-sm outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium text-sm border-none"
          />
        </div>

        {/* Color */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Color</label>
          <input
            {...form.register("color")}
            placeholder="Ej: Blanco"
            disabled={isPending}
            className="bg-surface-low px-4 py-3 rounded-sm outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium text-sm border-none"
          />
        </div>

        {/* Combustible */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Combustible</label>
          <select
            {...form.register("combustible")}
            disabled={isPending}
            className="bg-surface-low px-4 py-3 rounded-sm outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium text-sm border-none appearance-none"
          >
            {Object.values(Combustible).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        
        {/* Transmisión */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Transmisión</label>
          <select
            {...form.register("transmision")}
            disabled={isPending}
            className="bg-surface-low px-4 py-3 rounded-sm outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium text-sm border-none appearance-none"
          >
            {Object.values(Transmision).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Estado Vehículo */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Estatus Físico</label>
          <select
            {...form.register("estado")}
            disabled={isPending}
            className="bg-surface-low px-4 py-3 rounded-sm outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium text-sm border-none appearance-none"
          >
            {Object.values(EstadoVehiculo).map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        {/* Estado Publicación */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Estado Visibilidad</label>
          <select
            {...form.register("publicacion")}
            disabled={isPending}
            className="bg-surface-low px-4 py-3 rounded-sm outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium text-sm border-none appearance-none"
          >
            {Object.values(EstadoPublicacion).map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        {/* Categoría */}
        <div className="flex flex-col gap-2 lg:col-span-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Categoría</label>
          <select
            {...form.register("categoriaId")}
            disabled={isPending}
            className="bg-surface-low px-4 py-3 rounded-sm outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium text-sm border-none appearance-none"
          >
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-6 py-6 border-t border-foreground/[0.05]">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Galería de Imágenes</label>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {imagenes.map((url) => (
            <div key={url} className="relative aspect-[4/3] group overflow-hidden rounded-sm bg-surface-low border border-foreground/5">
              <Image 
                src={getCldUrl(url, "4:3")} 
                alt="Imagen vehículo" 
                fill 
                sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 16vw"
                className="object-cover object-center transition-transform group-hover:scale-110 duration-500"
              />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-2 right-2 w-6 h-6 bg-primary text-white flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <X size={14} />
              </button>
            </div>
          ))}

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
              <button
                type="button"
                onClick={() => open()}
                className="aspect-square flex flex-col items-center justify-center gap-2 bg-surface-low border-2 border-dashed border-foreground/10 hover:border-primary/30 hover:bg-primary/5 transition-all group"
              >
                <ImagePlus size={24} className="text-foreground/20 group-hover:text-primary transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 group-hover:text-primary transition-colors">Añadir</span>
              </button>
            )}
          </CldUploadWidget>
        </div>
        
        {imagenes.length === 0 && (
          <p className="text-[10px] font-medium italic text-foreground/40">Sube al menos una imagen para que el vehículo sea visible en el catálogo.</p>
        )}
      </div>

      {/* Descripción */}
      <div className="flex flex-col gap-2 pt-6 border-t border-foreground/[0.05]">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Descripción Editorial</label>
        <textarea
          {...form.register("descripcion")}
          rows={5}
          disabled={isPending}
          className="bg-surface-low px-4 py-4 rounded-sm outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium text-sm border-none resize-none"
          placeholder="Describe el equipamiento, estado general, etc."
        />
      </div>

      {error && <div className="bg-primary/5 p-4 text-primary text-[10px] font-black uppercase tracking-widest">{error}</div>}
      {success && <div className="bg-green-500/5 p-4 text-green-600 text-[10px] font-black uppercase tracking-widest">{success}</div>}

      <div className="pt-6">
        <button
          type="submit"
          disabled={isPending}
          className="bg-racing text-white py-5 px-12 rounded-sm shadow-xl hover:translate-y-[-2px] transition-all font-black text-xs uppercase tracking-[0.4em] disabled:opacity-50"
        >
          {isPending ? "PROCESANDO..." : isEditing ? "ACTUALIZAR VEHÍCULO" : "GUARDAR EN GALERÍA"}
        </button>
      </div>
    </form>
  );
};