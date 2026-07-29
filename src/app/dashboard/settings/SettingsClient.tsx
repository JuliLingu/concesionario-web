"use client";

import { useState, useTransition } from "react";
import { Settings, Save, Phone, Mail, MapPin, Building2, DollarSign, Clock } from "lucide-react";
import { updateConfiguracion } from "@/actions/configuracion";
import Link from "next/link";

const Facebook = ({ size = 24, color = "currentColor", className = "" }: { size?: number, color?: string, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3.64l.36-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Instagram = ({ size = 24, color = "currentColor", className = "" }: { size?: number, color?: string, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

interface SettingsClientProps {
  configuracion: any;
}

interface FieldProps {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  helperText?: string;
  icon?: React.ReactNode;
}

function FormField({ label, name, type = "text", defaultValue, placeholder, required, rows, helperText, icon }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]"
      >
        {label}{required && " *"}
      </label>
      <div className="relative flex items-start gap-2">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]">
            {icon}
          </span>
        )}
        {rows ? (
          <textarea
            id={name}
            name={name}
            rows={rows}
            defaultValue={defaultValue}
            placeholder={placeholder}
            required={required}
            className={`w-full bg-[hsl(var(--input))] text-sm rounded px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]/20 resize-none ${icon ? "pl-9" : ""}`}
          />
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            defaultValue={defaultValue}
            placeholder={placeholder}
            required={required}
            className={`w-full bg-[hsl(var(--input))] text-sm rounded px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]/20 ${icon ? "pl-9" : ""}`}
          />
        )}
      </div>
      {helperText && (
        <p className="text-xs text-[hsl(var(--muted-foreground))]">{helperText}</p>
      )}
    </div>
  );
}

export const SettingsClient = ({ configuracion }: SettingsClientProps) => {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ type: null, message: "" });

    const formData = new FormData(e.currentTarget);
    const data = {
      nombreConcesionaria: formData.get("nombreConcesionaria"),
      telefono: formData.get("telefono"),
      email: formData.get("email"),
      direccion: formData.get("direccion"),
      facebookUrl: formData.get("facebookUrl"),
      instagramUrl: formData.get("instagramUrl"),
      horariosAtencion: formData.get("horariosAtencion"),
      cotizacionDolar: formData.get("cotizacionDolar") || null,
    };

    startTransition(async () => {
      const result = await updateConfiguracion(data);
      if (result.success) {
        setStatus({ type: "success", message: "Configuración actualizada correctamente." });
      } else {
        setStatus({ type: "error", message: result.error || "Ocurrió un error inesperado." });
      }
    });
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* Header */}
        <div className="mb-10 flex items-center gap-4">
          <div className="p-3 bg-white rounded-xl shadow-[0_20px_40px_rgba(26,28,30,0.06)]">
            <Settings size={28} color="#b5000b" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[hsl(var(--primary))] mb-1">
              Panel de Control
            </p>
            <h1 className="text-4xl font-black uppercase tracking-tight text-[hsl(var(--foreground))]">
              Configuración
            </h1>
          </div>
        </div>

        {/* Alert */}
        {status.type && (
          <div
            className={`mb-6 p-4 rounded text-sm font-medium ${
              status.type === "success"
                ? "bg-green-50 text-green-700 border-l-4 border-green-500"
                : "bg-red-50 text-red-700 border-l-4 border-red-500"
            }`}
          >
            {status.message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Información Principal */}
            <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(26,28,30,0.06)] p-6 h-full">
              <h2 className="text-base font-black uppercase tracking-tight mb-6 flex items-center gap-2">
                <Building2 size={18} color="#b5000b" />
                Información de la Concesionaria
              </h2>
              <div className="flex flex-col gap-4">
                <FormField
                  label="Nombre de la Concesionaria"
                  name="nombreConcesionaria"
                  defaultValue={configuracion.nombreConcesionaria}
                  required
                  icon={<Building2 size={16} />}
                />
                <FormField
                  label="Teléfono"
                  name="telefono"
                  defaultValue={configuracion.telefono}
                  icon={<Phone size={16} />}
                />
                <FormField
                  label="Correo Electrónico"
                  name="email"
                  type="email"
                  defaultValue={configuracion.email}
                  icon={<Mail size={16} />}
                />
                <FormField
                  label="Dirección"
                  name="direccion"
                  defaultValue={configuracion.direccion}
                  rows={2}
                  icon={<MapPin size={16} />}
                />
                <FormField
                  label="Horarios de Atención"
                  name="horariosAtencion"
                  defaultValue={configuracion.horariosAtencion}
                  placeholder="Ej: Lun — Vie: 09:00 — 19:00"
                  icon={<Clock size={16} />}
                />
                <FormField
                  label="Cotización del Dólar (ARS)"
                  name="cotizacionDolar"
                  type="number"
                  defaultValue={configuracion.cotizacionDolar}
                  helperText="Se utilizará para mostrar los precios en pesos argentinos"
                  icon={<DollarSign size={16} />}
                />
              </div>
            </div>

            {/* Redes Sociales */}
            <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(26,28,30,0.06)] p-6 h-full">
              <h2 className="text-base font-black uppercase tracking-tight mb-6 flex items-center gap-2">
                <Facebook size={18} color="#b5000b" />
                Redes Sociales
              </h2>
              <div className="flex flex-col gap-4">
                <FormField
                  label="URL de Facebook"
                  name="facebookUrl"
                  defaultValue={configuracion.facebookUrl}
                  placeholder="https://facebook.com/..."
                  icon={<Facebook size={16} />}
                />
                <FormField
                  label="URL de Instagram"
                  name="instagramUrl"
                  defaultValue={configuracion.instagramUrl}
                  placeholder="https://instagram.com/..."
                  icon={<Instagram size={16} />}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3 justify-end">
            <Link
              href="/dashboard"
              className="px-5 py-2.5 text-sm font-bold border border-[hsl(var(--border))] rounded text-[hsl(var(--foreground))] hover:bg-[hsl(var(--surface-low))] transition"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded bg-racing hover:opacity-90 transition disabled:opacity-60"
            >
              <Save size={18} />
              {isPending ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
