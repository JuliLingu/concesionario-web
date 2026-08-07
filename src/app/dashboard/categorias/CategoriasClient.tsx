"use client";

import { useState, useTransition } from "react";
import { Tags, Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createCategoria, deleteCategoria } from "@/actions/categorias";

export const CategoriasClient = ({ initialCategorias }: any) => {
  const [categorias, setCategorias] = useState(initialCategorias);
  const [isPending, startTransition] = useTransition();
  const [openModal, setOpenModal] = useState(false);
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCreate = () => {
    setError(null);
    startTransition(async () => {
      const result = await createCategoria({ nombre });
      if (result?.error) {
        setError(result.error);
      } else {
        setOpenModal(false);
        setNombre("");
        window.location.reload();
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta categoría?")) return;

    startTransition(async () => {
      const result = await deleteCategoria(id);
      if (result?.error) {
        alert(result.error);
      } else {
        window.location.reload();
      }
    });
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] pt-header pb-8">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-4">
          <Link href="/dashboard" className="inline-flex items-center gap-2 mb-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] text-sm font-medium transition">
            <ArrowLeft size={16} /> Volver al Panel
          </Link>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--primary))] mb-1">
                Administración
              </div>
              <h1 className="text-[2.5rem] font-bold tracking-tight flex items-center gap-2 text-[hsl(var(--foreground))]">
                <Tags size={32} /> Categorías
              </h1>
            </div>
            <button
              onClick={() => setOpenModal(true)}
              className="inline-flex items-center gap-2 bg-[#b5000b] text-white px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-[#9a3412] transition rounded"
            >
              <Plus size={20} /> Nueva Categoría
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded shadow-[0_20px_40px_rgba(26,28,30,0.06)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f3f3f6]">
                <tr className="border-b border-[#e5e7eb]">
                  <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Nombre</th>
                  <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Slug</th>
                  <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Vehículos</th>
                  <th className="text-right py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categorias.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-[hsl(var(--muted-foreground))]">
                      No hay categorías creadas.
                    </td>
                  </tr>
                ) : categorias.map((cat: any) => (
                  <tr key={cat.id} className="border-b border-[#e5e7eb]/50 hover:bg-[hsl(var(--surface-low))] transition">
                    <td className="py-3 px-4 font-bold text-[hsl(var(--foreground))]">{cat.nombre}</td>
                    <td className="py-3 px-4 text-[hsl(var(--muted-foreground))]">{cat.slug}</td>
                    <td className="py-3 px-4 text-[hsl(var(--foreground))]">{cat._count.vehiculos}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(cat.id)}
                        disabled={isPending || cat._count.vehiculos > 0}
                        className="p-2 rounded text-red-500 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        title={cat._count.vehiculos > 0 ? "No se puede eliminar porque tiene vehículos" : "Eliminar"}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Crear */}
        {openModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isPending && setOpenModal(false)} />
            <div className="relative bg-white rounded-lg shadow-2xl max-w-sm w-full mx-4 p-6">
              <h2 className="text-xl font-bold mb-4 text-[hsl(var(--foreground))]">Crear Nueva Categoría</h2>
              
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 text-xs font-black uppercase tracking-widest text-red-700 mb-4">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-1 mb-6">
                <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
                  Nombre de la categoría
                </label>
                <input 
                  type="text"
                  autoFocus
                  placeholder="Ej: Camionetas, SUV, Motos..."
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  disabled={isPending}
                  className="bg-[hsl(var(--input))] px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#b5000b]/20 w-full"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button 
                  onClick={() => setOpenModal(false)} 
                  disabled={isPending}
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] font-black text-xs uppercase tracking-widest"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isPending || !nombre.trim()}
                  className="bg-[#b5000b] text-white px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-[#9a3412] transition rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
                >
                  {isPending ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : "Crear Categoría"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
