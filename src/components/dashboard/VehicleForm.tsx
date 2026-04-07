"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useTransition } from "react";
import { VehicleSchema } from "@/schemas/vehicle";
import { createVehicle } from "@/actions/vehicle";
import { 
  Combustible, 
  Transmision, 
  EstadoVehiculo, 
  EstadoPublicacion 
} from "generated/prisma";

interface Category {
  id: string;
  nombre: string;
}

interface VehicleFormProps {
  categorias: Category[];
}

export const VehicleForm = ({ categorias }: VehicleFormProps) => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof VehicleSchema>>({
    resolver: zodResolver(VehicleSchema),
    defaultValues: {
      marca: "",
      modelo: "",
      anio: new Date().getFullYear(),
      precio: 0,
      kilometraje: 0,
      combustible: Combustible.NAFTA,
      transmision: Transmision.MANUAL,
      estado: EstadoVehiculo.USADO,
      color: "",
      descripcion: "",
      categoriaId: categorias[0]?.id || "",
      publicacion: EstadoPublicacion.BORRADOR,
    },
  });

  const onSubmit = (values: z.infer<typeof VehicleSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      createVehicle(values)
        .then((data) => {
          if (data.error) {
            setError(data.error);
          }
          if (data.success) {
            setSuccess(data.success);
            form.reset();
          }
        })
        .catch(() => setError("Ocurrió un error inesperado"));
    });
  };

  return (
    <form 
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Marca */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-bold text-gray-700">Marca</label>
          <input
            {...form.register("marca")}
            placeholder="Ej: Toyota"
            disabled={isPending}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          {form.formState.errors.marca && (
            <span className="text-red-500 text-xs">{form.formState.errors.marca.message}</span>
          )}
        </div>

        {/* Modelo */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-bold text-gray-700">Modelo</label>
          <input
            {...form.register("modelo")}
            placeholder="Ej: Corolla"
            disabled={isPending}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          {form.formState.errors.modelo && (
            <span className="text-red-500 text-xs">{form.formState.errors.modelo.message}</span>
          )}
        </div>

        {/* Año */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-bold text-gray-700">Año</label>
          <input
            {...form.register("anio", { valueAsNumber: true })}
            type="number"
            disabled={isPending}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        {/* Precio */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-bold text-gray-700">Precio</label>
          <input
            {...form.register("precio", { valueAsNumber: true })}
            type="number"
            disabled={isPending}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        {/* Kilometraje */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-bold text-gray-700">Kilometraje (KM)</label>
          <input
            {...form.register("kilometraje", { valueAsNumber: true })}
            type="number"
            disabled={isPending}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        {/* Color */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-bold text-gray-700">Color</label>
          <input
            {...form.register("color")}
            placeholder="Ej: Blanco"
            disabled={isPending}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        {/* Combustible */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-bold text-gray-700">Combustible</label>
          <select
            {...form.register("combustible")}
            disabled={isPending}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          >
            {Object.values(Combustible).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Categoría */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-bold text-gray-700">Categoría</label>
          <select
            {...form.register("categoriaId")}
            disabled={isPending}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          >
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Descripción */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-bold text-gray-700">Descripción</label>
        <textarea
          {...form.register("descripcion")}
          rows={4}
          disabled={isPending}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
          placeholder="Describe el equipamiento, estado general, etc."
        />
      </div>

      {error && <div className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-semibold">{error}</div>}
      {success && <div className="p-4 rounded-xl bg-green-50 text-green-600 border border-green-100 text-sm font-semibold">{success}</div>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg transition-all active:scale-[0.99] disabled:bg-gray-300 disabled:shadow-none"
      >
        {isPending ? "PROCESANDO..." : "GUARDAR VEHÍCULO"}
      </button>
    </form>
  );
};