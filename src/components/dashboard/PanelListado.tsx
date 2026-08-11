import Link from "next/link";
import { ArrowLeft, ExternalLink, MessageSquare } from "lucide-react";
import { TABS_ESTADO } from "@/lib/estados";
import type { EstadoConsulta } from "../../../generated/prisma";

/**
 * Marco común de las bandejas del panel (consultas y solicitudes de crédito).
 *
 * Las dos pantallas eran ~200 líneas prácticamente idénticas: mismo enlace de
 * vuelta, mismo encabezado con contador y globo de pendientes, misma barra de
 * pestañas y misma tarjeta blanca con scroll horizontal. Lo único propio de
 * cada una son las columnas de la tabla, que llegan como `children`.
 */
interface PanelListadoProps {
  titulo: string;
  /** Ej: "12 consultas". Lo arma quien llama porque el plural cambia por pantalla. */
  resumen: string;
  pendientes: number;
  /** Ruta base para los enlaces de las pestañas. Ej: "/dashboard/consultas". */
  basePath: string;
  estadoActivo?: EstadoConsulta;
  children: React.ReactNode;
}

export const PanelListado = ({
  titulo,
  resumen,
  pendientes,
  basePath,
  estadoActivo,
  children,
}: PanelListadoProps) => (
  <div className="min-h-screen bg-[hsl(var(--background))] pt-header pb-8">
    <div className="max-w-7xl mx-auto px-4 md:px-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 mb-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] text-sm font-medium transition"
      >
        <ArrowLeft size={16} /> Volver al Panel
      </Link>

      <div className="mb-6">
        <div className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--primary))] mb-1">
          Panel de Control
        </div>
        <h1 className="text-[2.5rem] font-bold tracking-tight mb-0.5 text-[hsl(var(--foreground))]">
          {titulo}
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-[hsl(var(--muted-foreground))] font-medium">{resumen}</span>
          {pendientes > 0 && (
            <span className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-[9px] font-black px-2 py-1 rounded-full">
              {pendientes} pendiente{pendientes !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      <div className="inline-flex gap-1 mb-4 bg-white p-1 rounded border border-[#e5e7eb] shadow-sm">
        {TABS_ESTADO.map((tab) => {
          const activa = tab.value === "TODAS" ? !estadoActivo : estadoActivo === tab.value;
          const href = tab.value === "TODAS" ? basePath : `${basePath}?estado=${tab.value}`;
          return (
            <Link
              key={tab.value}
              href={href}
              className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded transition ${
                activa
                  ? "bg-[hsl(var(--foreground))] text-white"
                  : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[#f3f3f6]"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  </div>
);

/** Estado vacío de una bandeja. */
export const SinResultados = ({ texto }: { texto: string }) => (
  <div className="py-10 text-center bg-white rounded shadow-[0_20px_40px_rgba(26,28,30,0.06)] flex flex-col items-center gap-2">
    <MessageSquare size={32} className="text-[hsl(var(--muted-foreground))] opacity-40" />
    <span className="text-[hsl(var(--muted-foreground))] font-medium text-sm">{texto}</span>
  </div>
);

/** Tarjeta blanca con scroll horizontal que envuelve las tablas del panel. */
export const TablaPanel = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white rounded shadow-[0_20px_40px_rgba(26,28,30,0.06)] overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">{children}</table>
    </div>
  </div>
);

/** Celda de encabezado. `oculta` define desde qué ancho se muestra la columna. */
export const Th = ({
  children,
  oculta,
}: {
  children: React.ReactNode;
  oculta?: "md" | "lg";
}) => (
  <th
    className={`text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))] ${
      oculta === "md" ? "hidden md:table-cell" : oculta === "lg" ? "hidden lg:table-cell" : ""
    }`}
  >
    {children}
  </th>
);

/** Enlace de contacto (mailto/tel) repetido en las dos bandejas. */
export const Contacto = ({
  href,
  texto,
  tenue,
}: {
  href: string;
  texto: string;
  tenue?: boolean;
}) => (
  <a
    href={href}
    className={`text-xs font-medium hover:underline block mt-0.5 ${
      tenue ? "text-[hsl(var(--muted-foreground))]" : "text-[hsl(var(--primary))]"
    }`}
  >
    {texto}
  </a>
);

/** Celda "Vehículo": enlace a la ficha, o "General" si la consulta no es de una unidad. */
export const CeldaVehiculo = ({
  vehiculo,
}: {
  vehiculo: { id: string; marca: string; modelo: string; anio: number } | null;
}) => {
  if (!vehiculo) {
    return <span className="text-sm text-[hsl(var(--muted-foreground))] italic">General</span>;
  }
  return (
    <Link
      href={`/catalogo/${vehiculo.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm font-bold text-[hsl(var(--foreground))] flex items-center gap-1 hover:text-[hsl(var(--primary))]"
    >
      {vehiculo.marca} {vehiculo.modelo} {vehiculo.anio}
      <ExternalLink size={11} className="opacity-40" />
    </Link>
  );
};
