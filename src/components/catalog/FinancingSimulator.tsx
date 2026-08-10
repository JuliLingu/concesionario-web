"use client";

import { useState, useMemo } from "react";
import { Calculator } from "lucide-react";
import { FinancingForm } from "./FinancingForm";
import { formatArs } from "@/lib/precio";

interface Plan {
  id: string;
  nombre: string;
  cuotas: number;
  tasaAnual: number;
}

interface FinancingSimulatorProps {
  vehiculoId: string;
  /** El vehículo puede estar cargado en dólares; acá siempre llega convertido a pesos. */
  precioArs: number;
  planes: Plan[];
}

export const FinancingSimulator = ({ vehiculoId, precioArs, planes }: FinancingSimulatorProps) => {
  const [anticipoPercent, setAnticipoPercent] = useState<number>(50);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(planes.length > 0 ? planes[0].id : null);
  const [showForm, setShowForm] = useState(false);

  const anticipoArs = (precioArs * anticipoPercent) / 100;
  
  const selectedPlan = planes.find(p => p.id === selectedPlanId) || planes[0];

  const cuotaMensual = useMemo(() => {
    if (!selectedPlan) return 0;
    const capitalAFinanciar = precioArs - anticipoArs;
    const tasaDecimal = selectedPlan.tasaAnual / 100;
    const años = selectedPlan.cuotas / 12;
    const totalAPagar = capitalAFinanciar + (capitalAFinanciar * tasaDecimal * años);
    return totalAPagar / selectedPlan.cuotas;
  }, [precioArs, anticipoArs, selectedPlan]);

  if (planes.length === 0) {
    return null; // No financing available
  }

  return (
    <div className="bg-[hsl(var(--surface-low))] border border-black/5 rounded-lg overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 rounded bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] flex items-center justify-center shrink-0">
            <Calculator size={20} />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-[-0.02em] text-[hsl(var(--foreground))]">
            Simulador de Cuotas
          </h2>
        </div>

        <div className="flex flex-col gap-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-[0.1em]">
                Tu Anticipo ({anticipoPercent}%)
              </span>
              <span className="text-sm font-black text-[hsl(var(--foreground))]">
                {formatArs(anticipoArs)}
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={90}
              step={5}
              value={anticipoPercent}
              onChange={(e) => setAnticipoPercent(Number(e.target.value))}
              className="w-full h-2 bg-black/10 rounded-lg appearance-none cursor-pointer accent-[hsl(var(--primary))]"
            />
          </div>

          <div>
            <div className="text-sm font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-[0.1em] mb-4">
              Plan de Financiación
            </div>
            <div className="flex flex-wrap gap-2">
              {planes.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] rounded-full transition-colors ${
                    selectedPlanId === plan.id
                      ? "bg-[hsl(var(--foreground))] text-[hsl(var(--background))]"
                      : "border border-black/10 text-[hsl(var(--muted-foreground))] hover:border-black/30 hover:text-[hsl(var(--foreground))]"
                  }`}
                >
                  {plan.cuotas} Cuotas
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[hsl(var(--card))] p-6 rounded-lg border border-black/5 text-center shadow-[0_4px_20px_rgba(26,28,30,0.04)]">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--primary))] mb-2">
              Cuota Fija Mensual
            </div>
            <div className="text-5xl font-black tracking-[-0.05em] text-[hsl(var(--foreground))] leading-none">
              {formatArs(cuotaMensual)}
            </div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] font-medium mt-3">
              TNA: {selectedPlan?.tasaAnual}% (Interés Simple)
            </div>
          </div>

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-[hsl(var(--primary))] hover:brightness-90 text-[hsl(var(--primary-foreground))] py-4 text-sm font-black uppercase tracking-[0.1em] transition-colors rounded"
            >
              Solicitar este crédito
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="p-6 md:p-8 bg-[hsl(var(--card))] border-t border-black/5">
          <div className="text-sm font-bold text-[hsl(var(--foreground))] uppercase tracking-[0.1em] mb-6">
            Completá tus datos
          </div>
          <FinancingForm 
            vehiculoId={vehiculoId} 
            anticipo={anticipoArs} 
            cuotas={selectedPlan?.cuotas || 12} 
          />
        </div>
      )}
    </div>
  );
};
