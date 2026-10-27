import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { requireAdmin } from "@/lib/sesion";
import { estadoDeUrl } from "@/lib/estados";
import { ETIQUETA_TIPO, cursorDeUrl, tipoDeUrl, tiposActivos, type TipoPedido } from "@/lib/bandeja";
import { getConfiguracion } from "@/services/configuracion.service";
import { getBandeja } from "@/services/contactos.service";
import { PanelListado, SinResultados, TablaPanel } from "@/components/dashboard/PanelListado";
import { EncabezadoPedidos, FilaPedido } from "@/components/dashboard/FilaPedido";

interface BandejaPageProps {
  searchParams: Promise<{ tipo?: string; estado?: string; antes?: string }>;
}

/**
 * Bandeja unificada: consultas, tasaciones y solicitudes de crédito en una
 * sola lista. Reemplaza a las tres pantallas separadas, que obligaban a abrir
 * tres lugares para saber si alguien estaba esperando respuesta.
 */
export default async function BandejaPage({ searchParams }: BandejaPageProps) {
  await requireAdmin();

  const [params, configuracion] = await Promise.all([searchParams, getConfiguracion()]);
  const activos = tiposActivos(configuracion);
  const tipo = tipoDeUrl(params.tipo, activos);
  const estado = estadoDeUrl(params.estado);
  const antes = cursorDeUrl(params.antes);

  const { items, siguiente, pendientes } = await getBandeja({
    tipos: tipo ? [tipo] : activos,
    estado,
    antes,
  });

  const totalPendientes = activos.reduce((total, t) => total + pendientes[t], 0);

  /** Enlace a esta misma bandeja con otros filtros, siempre desde la primera página. */
  const enlace = (cambios: { tipo?: TipoPedido; estado?: string; antes?: string }) => {
    const query = new URLSearchParams();
    const t = "tipo" in cambios ? cambios.tipo : tipo;
    if (t) query.set("tipo", t);
    const e = "estado" in cambios ? cambios.estado : estado;
    if (e) query.set("estado", e);
    if (cambios.antes) query.set("antes", cambios.antes);
    return query.size > 0 ? `/dashboard/bandeja?${query}` : "/dashboard/bandeja";
  };

  // Solo vale la pena filtrar por tipo si hay más de uno encendido.
  const filtroDeTipo =
    activos.length > 1 ? (
      <div className="flex flex-wrap gap-2 mb-3">
        {[undefined, ...activos].map((t) => {
          const activo = t === tipo;
          const cantidad = t ? pendientes[t] : totalPendientes;
          return (
            <Link
              key={t ?? "todos"}
              href={enlace({ tipo: t })}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
                activo
                  ? "bg-[hsl(var(--foreground))] text-white border-transparent"
                  : "bg-white border-[#e5e7eb] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              }`}
            >
              {t ? ETIQUETA_TIPO[t] : "Todo"}
              {cantidad > 0 && (
                <span className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-[9px] font-black rounded-full px-1.5 tabular-nums">
                  {cantidad}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    ) : null;

  return (
    <PanelListado
      titulo="Bandeja"
      resumen={
        antes
          ? "Pedidos anteriores"
          : `${items.length}${siguiente ? "+" : ""} pedido${items.length !== 1 ? "s" : ""}`
      }
      pendientes={tipo ? pendientes[tipo] : totalPendientes}
      basePath="/dashboard/bandeja"
      parametros={tipo ? { tipo } : {}}
      estadoActivo={estado}
      filtros={filtroDeTipo}
    >
      {items.length === 0 ? (
        <SinResultados texto="No hay pedidos en esta categoría." />
      ) : (
        <>
          <TablaPanel>
            <EncabezadoPedidos />
            <tbody>
              {items.map((pedido) => (
                <FilaPedido key={`${pedido.tipo}-${pedido.id}`} pedido={pedido} />
              ))}
            </tbody>
          </TablaPanel>

          <div className="flex justify-between items-center mt-4 text-[10px] font-black uppercase tracking-widest">
            {antes ? (
              <Link href={enlace({})} className="text-[hsl(var(--primary))] hover:underline">
                Volver a lo más reciente
              </Link>
            ) : (
              <span />
            )}
            {siguiente && (
              <Link
                href={enlace({ antes: siguiente.toISOString() })}
                className="inline-flex items-center gap-1 text-[hsl(var(--primary))] hover:underline"
              >
                Anteriores <ChevronRight size={14} />
              </Link>
            )}
          </div>
        </>
      )}
    </PanelListado>
  );
}
