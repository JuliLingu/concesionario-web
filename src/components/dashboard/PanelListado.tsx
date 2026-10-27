import Link from "next/link";
import { ArrowLeft, ExternalLink, MessageSquare } from "lucide-react";
import { TABS_ESTADO } from "@/lib/estados";
import { whatsappDeCliente } from "@/lib/telefono";
import type { EstadoConsulta } from "../../../generated/prisma";

/**
 * Marco de la bandeja del panel: enlace de vuelta, encabezado con contador y
 * globo de pendientes, barra de pestañas por estado y la tarjeta blanca con
 * scroll horizontal. Las columnas de la tabla llegan como `children`.
 *
 * Nació para las tres bandejas separadas (consultas, solicitudes, tasaciones),
 * que eran casi idénticas; hoy las une `/dashboard/bandeja`.
 */
interface PanelListadoProps {
  titulo: string;
  /** Ej: "12 pedidos". Lo arma quien llama porque el plural cambia por pantalla. */
  resumen: string;
  pendientes: number;
  /** Ruta base para los enlaces de las pestañas. Ej: "/dashboard/bandeja". */
  basePath: string;
  /**
   * Otros parámetros que las pestañas de estado tienen que conservar, como el
   * `?tipo=` de la bandeja: cambiar de estado no debería quitar el filtro.
   */
  parametros?: Record<string, string>;
  estadoActivo?: EstadoConsulta;
  /** Filtros propios de la pantalla, encima de las pestañas de estado. */
  filtros?: React.ReactNode;
  children: React.ReactNode;
}

export const PanelListado = ({
  titulo,
  resumen,
  pendientes,
  basePath,
  parametros = {},
  estadoActivo,
  filtros,
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

      {filtros}

      <div className="flex flex-wrap gap-1 mb-4 bg-white p-1 rounded border border-[#e5e7eb] shadow-sm w-fit max-w-full">
        {TABS_ESTADO.map((tab) => {
          const activa = tab.value === "TODAS" ? !estadoActivo : estadoActivo === tab.value;
          const query = new URLSearchParams(parametros);
          if (tab.value !== "TODAS") query.set("estado", tab.value);
          const href = query.size > 0 ? `${basePath}?${query}` : basePath;
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

/**
 * Teléfono del cliente: para llamar y, si el número se puede interpretar, un
 * enlace directo a WhatsApp. Los números nuevos ya llegan normalizados; los
 * viejos se intentan normalizar al vuelo y, si no se puede, queda solo el
 * teléfono en vez de un enlace que abre un chat con nadie.
 */
export const TelefonoCliente = ({ telefono }: { telefono: string | null | undefined }) => {
  if (!telefono) return null;
  const whatsapp = whatsappDeCliente(telefono);
  return (
    <div className="flex items-center gap-2 mt-0.5">
      <a
        href={`tel:${telefono.replace(/[^\d+]/g, "")}`}
        className="text-xs font-medium hover:underline text-[hsl(var(--muted-foreground))]"
      >
        {telefono}
      </a>
      {whatsapp && (
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-black uppercase tracking-[0.1em] text-[#1a9e4b] hover:underline"
        >
          WhatsApp
        </a>
      )}
    </div>
  );
};

/**
 * Celda "Vehículo": enlace a la ficha, o un texto tenue si la fila no apunta a
 * ninguna unidad. Ese texto cambia según la bandeja —una consulta sin vehículo
 * es "General", una tasación sin vehículo es otra cosa—, así que es un prop.
 */
export const CeldaVehiculo = ({
  vehiculo,
  textoSinUnidad = "General",
}: {
  vehiculo: { id: string; marca: string; modelo: string; anio: number } | null;
  textoSinUnidad?: string;
}) => {
  if (!vehiculo) {
    return (
      <span className="text-sm text-[hsl(var(--muted-foreground))] italic">
        {textoSinUnidad}
      </span>
    );
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
