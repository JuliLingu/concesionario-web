"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlanFinanciacionSchema } from "@/schemas/financiacion";
import { createPlan, updatePlan } from "@/actions/financiacion";

interface PlanFormProps {
  initialData?: any;
  onSuccess: () => void;
}

type FormData = z.infer<typeof PlanFinanciacionSchema>;

export const PlanForm = ({ initialData, onSuccess }: PlanFormProps) => {
  const [isPending, start] = useTransition();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(PlanFinanciacionSchema),
    defaultValues: {
      nombre: initialData?.nombre || "",
      cuotas: initialData?.cuotas || 12,
      tasaAnual: initialData?.tasaAnual ? Number(initialData.tasaAnual) : 0,
      activo: initialData?.activo ?? true,
    },
  });

  const onSubmit = (data: FormData) => {
    start(async () => {
      const res = initialData
        ? await updatePlan(initialData.id, data)
        : await createPlan(data);

      if (res.success) {
        onSuccess();
      } else {
        alert(res.error || "Ocurrió un error");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 bg-white rounded-lg">
      <h2 className="text-xl font-bold mb-6 text-[hsl(var(--foreground))]">
        {initialData ? "Editar Plan" : "Nuevo Plan de Financiación"}
      </h2>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.1em] text-[hsl(var(--muted-foreground))]">
            Nombre del Plan
          </label>
          <input
            {...register("nombre")}
            placeholder="ej. '12 Cuotas Fijas'"
            disabled={isPending}
            className={`bg-[hsl(var(--input))] px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#b5000b]/20 w-full disabled:opacity-50 ${errors.nombre ? 'ring-1 ring-red-500 bg-red-50' : ''}`}
          />
          {errors.nombre && (
            <span className="text-xs font-bold text-red-500">{errors.nombre.message}</span>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.1em] text-[hsl(var(--muted-foreground))]">
              Cantidad de Cuotas
            </label>
            <input
              type="number"
              {...register("cuotas", { valueAsNumber: true })}
              disabled={isPending}
              className={`bg-[hsl(var(--input))] px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#b5000b]/20 w-full disabled:opacity-50 ${errors.cuotas ? 'ring-1 ring-red-500 bg-red-50' : ''}`}
            />
            {errors.cuotas && (
              <span className="text-xs font-bold text-red-500">{errors.cuotas.message}</span>
            )}
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.1em] text-[hsl(var(--muted-foreground))]">
              Tasa Anual (TNA %)
            </label>
            <input
              type="number"
              step="0.01"
              {...register("tasaAnual", { valueAsNumber: true })}
              disabled={isPending}
              className={`bg-[hsl(var(--input))] px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#b5000b]/20 w-full disabled:opacity-50 ${errors.tasaAnual ? 'ring-1 ring-red-500 bg-red-50' : ''}`}
            />
            {errors.tasaAnual && (
              <span className="text-xs font-bold text-red-500">{errors.tasaAnual.message}</span>
            )}
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            {...register("activo")}
            defaultChecked={initialData?.activo ?? true}
            disabled={isPending}
            className="w-4 h-4 rounded-sm border-gray-300 accent-[#b5000b] cursor-pointer disabled:opacity-50"
          />
          <span className="text-[13px] font-medium text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))] transition-colors">
            Plan Activo
          </span>
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#b5000b] hover:bg-[#9a3412] text-white py-3 text-xs font-black uppercase tracking-[0.1em] rounded transition-colors disabled:opacity-70 mt-2"
        >
          {isPending ? "Guardando..." : "Guardar Plan"}
        </button>
      </div>
    </form>
  );
};
