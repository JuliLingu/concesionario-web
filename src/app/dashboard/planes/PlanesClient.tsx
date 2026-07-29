"use client";

import { useState, useTransition } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { deletePlan } from "@/actions/financiacion";
import { PlanForm } from "./PlanForm";

export const PlanesClient = ({ planes }: { planes: any[] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [isPending, start] = useTransition();

  const handleOpenNew = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: any) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este plan?")) {
      start(async () => {
        await deletePlan(id);
      });
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b5000b] mb-1">
              Panel de Control
            </div>
            <h1 className="text-4xl md:text-[2.5rem] font-bold tracking-tight text-[hsl(var(--foreground))]">
              Planes de Financiación
            </h1>
          </div>
          <button
            onClick={handleOpenNew}
            className="bg-[#b5000b] hover:bg-red-800 text-white font-black uppercase tracking-[0.1em] px-6 py-3 text-xs rounded shadow-sm flex items-center gap-2 transition-colors"
          >
            <Plus size={16} />
            Nuevo Plan
          </button>
        </div>

        <div className="bg-white rounded border border-black/5 shadow-[0_20px_40px_rgba(26,28,30,0.06)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f3f3f6]">
                <tr className="border-b border-[#e5e7eb]">
                  <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Nombre</th>
                  <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Cuotas</th>
                  <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Tasa Anual (TNA)</th>
                  <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Estado</th>
                  <th className="text-right py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {planes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-[hsl(var(--muted-foreground))] text-sm italic">
                      No hay planes configurados
                    </td>
                  </tr>
                ) : (
                  planes.map((p) => (
                    <tr key={p.id} className="border-b border-[#e5e7eb]/50 hover:bg-[hsl(var(--surface-low))] transition-colors">
                      <td className="py-3 px-4 font-bold text-[hsl(var(--foreground))]">{p.nombre}</td>
                      <td className="py-3 px-4 text-[hsl(var(--muted-foreground))]">{p.cuotas}</td>
                      <td className="py-3 px-4 text-[hsl(var(--muted-foreground))]">{p.tasaAnual}%</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-sm ${
                          p.activo 
                            ? "bg-green-100 text-green-700" 
                            : "bg-gray-100 text-gray-500"
                        }`}>
                          {p.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenEdit(p)} 
                            disabled={isPending}
                            className="p-2 rounded text-[hsl(var(--muted-foreground))] hover:text-[#b5000b] hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(p.id)} 
                            disabled={isPending}
                            className="p-2 rounded text-[hsl(var(--muted-foreground))] hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setIsModalOpen(false)} 
            />
            <div className="relative bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 z-10 p-2 text-[hsl(var(--muted-foreground))] hover:text-[#b5000b] hover:bg-red-50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <div className="overflow-y-auto">
                <PlanForm initialData={editingPlan} onSuccess={() => setIsModalOpen(false)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
