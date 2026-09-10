import Link from "next/link";
import { ArrowLeft, Eye, MessageSquare, Timer, TrendingUp, ExternalLink } from "lucide-react";
import { formatFechaLarga } from "@/lib/formato";
import { formatPrecioOriginal } from "@/lib/precio";
import { DIAS_INMOVILIZADA, SENAL_COPY, type Senal } from "@/lib/metricas";
import type { RendimientoStock, UnidadRendimiento } from "@/services/metricas.service";

interface MetricasViewProps {
  rendimiento: RendimientoStock;
  /** Precios a la vista, según Configuración. Con `false` la tabla va sin la columna. */
  mostrarPrecios?: boolean;
}

const TONO_CLASS: Record<(typeof SENAL_COPY)[Senal]["tono"], string> = {
  alerta: "bg-red-50 text-[hsl(var(--primary))]",
  aviso:  "bg-amber-100 text-amber-700",
  neutro: "bg-gray-100 text-gray-500",
  ok:     "bg-green-100 text-green-700",
};

export const MetricasView = ({ rendimiento, mostrarPrecios = true }: MetricasViewProps) => {
  const { ventanaDias, unidades, ventas, resumen } = rendimiento;

  // Recién instalado no hay nada contado todavía y una tabla llena de ceros
  // parece un catálogo que no mira nadie. El aviso se va solo con la primera
  // visita registrada.
  const sinMediciones = unidades.every((u) => u.vistas === 0 && u.clicksWhatsapp === 0);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] pt-header pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 mb-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] text-sm font-medium transition"
        >
          <ArrowLeft size={16} /> Volver al Panel
        </Link>

        {/* ── Header ── */}
        <div className="mb-6">
          <div className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--primary))] mb-1">
            Panel de Control
          </div>
          <h1 className="text-[2.5rem] font-bold tracking-tight mb-0.5 text-[hsl(var(--foreground))]">
            Rendimiento del stock
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] font-medium">
            Visitas y consultas de los últimos {ventanaDias} días. Los días en stock se
            cuentan desde el alta de cada unidad.
          </p>
        </div>

        {sinMediciones && (
          <div className="mb-6 bg-white rounded p-4 shadow-[0_20px_40px_rgba(26,28,30,0.06)] border-l-4 border-[hsl(var(--primary))]">
            <p className="text-sm font-medium text-[hsl(var(--foreground))]">
              Todavía no hay visitas registradas.
            </p>
            <p className="text-sm text-[hsl(var(--muted-foreground))] font-medium mt-1">
              La medición empieza a contar desde ahora: lo que pasó antes de activarla no
              quedó guardado en ningún lado. Los días en stock, en cambio, ya son reales.
            </p>
          </div>
        )}

        {/* ── Resumen ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Tarjeta
            label="Días promedio en stock"
            valor={resumen.diasPromedioEnStock ?? "—"}
            icon={<Timer size={20} />}
          />
          <Tarjeta
            label={`Unidades +${DIAS_INMOVILIZADA} días`}
            valor={resumen.inmovilizadas}
            icon={<Timer size={20} />}
            acento={resumen.inmovilizadas > 0 ? "alerta" : undefined}
          />
          <Tarjeta
            label="Se miran, nadie pregunta"
            valor={resumen.caras}
            icon={<Eye size={20} />}
            acento={resumen.caras > 0 ? "alerta" : undefined}
          />
          <Tarjeta
            label="Días promedio hasta vender"
            valor={resumen.diasPromedioHastaLaVenta ?? "—"}
            icon={<TrendingUp size={20} />}
          />
        </div>

        {/* ── Stock ── */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold uppercase tracking-tight text-[hsl(var(--foreground))]">
            Stock ({resumen.unidadesEnStock})
          </h2>
          <Link
            href="/dashboard/vehicles"
            className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--primary))] hover:underline"
          >
            Ir al inventario
          </Link>
        </div>

        <div className="bg-white rounded shadow-[0_20px_40px_rgba(26,28,30,0.06)] overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f3f3f6]">
                <tr className="border-b border-[#e5e7eb]">
                  <Encabezado>Vehículo</Encabezado>
                  <Encabezado alineado="right">Días en stock</Encabezado>
                  <Encabezado alineado="right">Visitas</Encabezado>
                  <Encabezado alineado="right">Consultas</Encabezado>
                  <Encabezado>Diagnóstico</Encabezado>
                </tr>
              </thead>
              <tbody>
                {unidades.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-8 text-[hsl(var(--muted-foreground))] text-sm font-medium italic"
                    >
                      No hay unidades en stock.
                    </td>
                  </tr>
                )}
                {unidades.map((u) => (
                  <Fila key={u.id} unidad={u} mostrarPrecios={mostrarPrecios} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Rotación ── */}
        <h2 className="text-lg font-bold uppercase tracking-tight text-[hsl(var(--foreground))] mb-3">
          Últimas ventas
        </h2>

        <div className="bg-white rounded shadow-[0_20px_40px_rgba(26,28,30,0.06)] overflow-hidden">
          {ventas.length === 0 ? (
            <p className="py-8 px-4 text-center text-[hsl(var(--muted-foreground))] text-sm font-medium">
              Todavía no hay ventas con fecha registrada. Se anota sola cuando marcás una
              unidad como vendida desde el inventario.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#f3f3f6]">
                  <tr className="border-b border-[#e5e7eb]">
                    <Encabezado>Vehículo</Encabezado>
                    <Encabezado>Vendida el</Encabezado>
                    <Encabezado alineado="right">Días hasta vender</Encabezado>
                  </tr>
                </thead>
                <tbody>
                  {ventas.map((v) => (
                    <tr key={v.id} className="border-b border-[#e5e7eb]/50">
                      <td className="py-3 px-4 font-bold text-sm text-[hsl(var(--foreground))]">
                        {v.nombre}{" "}
                        <span className="font-medium text-[hsl(var(--muted-foreground))]">
                          {v.anio}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-[hsl(var(--muted-foreground))] font-medium">
                        {formatFechaLarga(v.vendidoAt)}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-sm text-[hsl(var(--foreground))]">
                        {v.diasHastaLaVenta}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const Encabezado = ({
  children,
  alineado = "left",
}: {
  children: React.ReactNode;
  alineado?: "left" | "right";
}) => (
  <th
    className={`${alineado === "right" ? "text-right" : "text-left"} py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]`}
  >
    {children}
  </th>
);

const Tarjeta = ({
  label,
  valor,
  icon,
  acento,
}: {
  label: string;
  valor: number | string;
  icon: React.ReactNode;
  acento?: "alerta";
}) => {
  const color = acento === "alerta" ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--foreground))]";

  return (
    <div className="bg-white p-6 rounded shadow-[0_20px_40px_rgba(26,28,30,0.06)]">
      <div className={`mb-4 ${acento === "alerta" ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))]"}`}>
        {icon}
      </div>
      <div className={`text-4xl font-black tracking-tight leading-none mb-2 ${color}`}>
        {valor}
      </div>
      <div className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
        {label}
      </div>
    </div>
  );
};

const Fila = ({
  unidad,
  mostrarPrecios,
}: {
  unidad: UnidadRendimiento;
  mostrarPrecios: boolean;
}) => {
  // El detalle largo se muestra solo para lo que hay que hacer algo: repetirlo
  // en cada fila sin novedad convertiría la tabla en un muro de texto.
  const explicacion = unidad.senales
    .map((senal) => SENAL_COPY[senal])
    .find((copy) => copy.tono === "alerta" || copy.tono === "aviso");

  return (
    <tr className="border-b border-[#e5e7eb]/50 hover:bg-[hsl(var(--surface-low))] transition align-top">
      <td className="py-3 px-4">
        <Link
          href={`/dashboard/vehicles/${unidad.id}`}
          className="font-bold text-sm text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] inline-flex items-center gap-1"
        >
          {unidad.nombre}
          <ExternalLink size={11} className="opacity-40" />
        </Link>
        <div className="text-xs text-[hsl(var(--muted-foreground))] font-medium mt-0.5">
          {unidad.anio}
          {mostrarPrecios && ` · ${formatPrecioOriginal(unidad.precio, unidad.moneda)}`}
        </div>
      </td>

      <td className="py-3 px-4 text-right">
        <span
          className={`font-black text-sm ${unidad.diasEnStock >= DIAS_INMOVILIZADA ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--foreground))]"}`}
        >
          {unidad.diasEnStock}
        </span>
      </td>

      <td className="py-3 px-4 text-right font-bold text-sm text-[hsl(var(--foreground))]">
        {unidad.vistas}
      </td>

      <td className="py-3 px-4 text-right">
        <span className="font-bold text-sm text-[hsl(var(--foreground))]">
          {unidad.contactos}
        </span>
        {unidad.clicksWhatsapp > 0 && (
          <div className="text-[10px] text-[hsl(var(--muted-foreground))] font-medium mt-0.5 flex items-center justify-end gap-1">
            <MessageSquare size={10} />
            {unidad.clicksWhatsapp} por WhatsApp
          </div>
        )}
      </td>

      <td className="py-3 px-4">
        <div className="flex flex-wrap gap-1">
          {unidad.senales.map((senal) => (
            <span
              key={senal}
              className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${TONO_CLASS[SENAL_COPY[senal].tono]}`}
            >
              {SENAL_COPY[senal].label}
            </span>
          ))}
        </div>
        {explicacion && (
          <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium mt-1 max-w-xs">
            {explicacion.detalle}
          </p>
        )}
      </td>
    </tr>
  );
};
