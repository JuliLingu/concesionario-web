"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useTransition } from "react";
import { VehicleSchema } from "@/schemas/vehicle";
import { createVehicle, updateVehicle } from "@/actions/vehicle";
import { ImageDropzone } from "@/components/dashboard/ImageDropzone";
import Image from "next/image";
import { X } from "lucide-react";
import { getCldUrl } from "@/lib/cloudinary";
import {
  Combustible,
  Transmision,
  EstadoVehiculo,
  EstadoPublicacion,
  Moneda
} from "../../../generated/prisma";
import { formatArs, formatNumeroAr, parseNumeroAr, precioEnPesos } from "@/lib/precio";

const MAX_IMAGENES = 10;

const MONEDA_LABEL: Record<Moneda, string> = {
  [Moneda.ARS]: "Pesos (ARS)",
  [Moneda.USD]: "Dólares (USD)",
};

interface Category {
  id: string;
  nombre: string;
}

interface VehicleFormProps {
  categorias: Category[];
  initialData?: any; // The full vehicle object if we are editing
  onSuccess?: () => void;
  cotizacionDolar?: number | null;
}

export const VehicleForm = ({ categorias, initialData, onSuccess, cotizacionDolar }: VehicleFormProps) => {
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
      moneda: initialData.moneda || Moneda.USD,
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
      moneda: Moneda.USD,
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

  const moneda = form.watch("moneda");
  const precio = form.watch("precio");
  const [precioTexto, setPrecioTexto] = useState(
    initialData?.precio ? formatNumeroAr(Number(initialData.precio)) : ""
  );

  /** El precio se escribe con separadores de miles, pero se envía como número. */
  const onPrecioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = parseNumeroAr(e.target.value);
    setPrecioTexto(valor ? formatNumeroAr(valor) : "");
    form.setValue("precio", valor, { shouldValidate: true });
  };

  const precioArs = precioEnPesos(precio || 0, moneda, cotizacionDolar);

  const onUpload = (urls: string[]) => {
    setImagenes((prev) => {
      const newImages = [...prev, ...urls].slice(0, MAX_IMAGENES);
      form.setValue("imagenes", newImages);
      return newImages;
    });
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
              setPrecioTexto("");
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

        {/* Moneda */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Moneda del Precio</label>
          <select
            {...form.register("moneda")}
            disabled={isPending}
            className="w-full bg-[hsl(var(--surface-low))] px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]/20 border border-transparent focus:border-[hsl(var(--primary))]/20"
          >
            {Object.values(Moneda).map((m) => (
              <option key={m} value={m}>{MONEDA_LABEL[m]}</option>
            ))}
          </select>
        </div>

        {/* Precio */}
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
            Precio {moneda === Moneda.ARS ? "en Pesos" : "en Dólares"}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-[hsl(var(--muted-foreground))] pointer-events-none">
              {moneda === Moneda.ARS ? "$" : "U$D"}
            </span>
            <input
              value={precioTexto}
              onChange={onPrecioChange}
              inputMode="numeric"
              placeholder={moneda === Moneda.ARS ? "15.000.000" : "20.000"}
              disabled={isPending}
              className={`w-full bg-[hsl(var(--surface-low))] py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]/20 border border-transparent focus:border-[hsl(var(--primary))]/20 pr-3 ${moneda === Moneda.ARS ? "pl-7" : "pl-12"}`}
            />
          </div>

          {/* Lo que va a ver el visitante: siempre pesos */}
          {precioArs !== null && precio > 0 && (
            <span className="text-[10px] font-bold text-[hsl(var(--muted-foreground))]">
              Se publica como <span className="text-[hsl(var(--primary))]">{formatArs(precioArs)}</span>
              {moneda === Moneda.USD && cotizacionDolar
                ? ` · cotización ${formatArs(cotizacionDolar)}`
                : ""}
            </span>
          )}
          {moneda === Moneda.USD && !cotizacionDolar && (
            <span className="text-[10px] font-bold text-amber-600">
              Cargá la cotización del dólar en Configuración para que el precio se muestre en pesos.
            </span>
          )}
          {form.formState.errors.precio && <span className="text-[10px] text-red-500">{form.formState.errors.precio.message}</span>}
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
            placeholder="Ej: 2.0 TDI, 1.0 Turbo"
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
          <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Estado Vehiculo</label>
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
        
        {imagenes.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {imagenes.map((url) => (
              <div key={url} className="relative aspect-[4/3] overflow-hidden rounded bg-black/5 group">
                <Image
                  src={getCldUrl(url, { modo: "recorte", relacion: "4:3" })}
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
          </div>
        )}

        <ImageDropzone
          onUpload={onUpload}
          multiple
          cupoDisponible={MAX_IMAGENES - imagenes.length}
          disabled={isPending}
          titulo="Arrastrá las fotos o hacé clic"
        />

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