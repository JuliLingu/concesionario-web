import Link from "next/link";
import { updateConsultaEstado } from "@/actions/consulta";
import { updateTasacionEstado } from "@/actions/tasacion";
import { updateSolicitudEstado } from "@/actions/financiacion";
import { ETIQUETA_TIPO, type TipoPedido } from "@/lib/bandeja";
import { etiquetaEnum } from "@/lib/etiquetas";
import { formatFechaLarga } from "@/lib/formato";
import { formatArs, formatNumeroAr, formatPrecioOriginal } from "@/lib/precio";
import { describirPreferencia } from "@/lib/preferencia-contacto";
import { codigoDeReferencia } from "@/lib/referencia";
import type { Pedido } from "@/services/contactos.service";
import { EstadoButton } from "./EstadoButton";
import { CeldaVehiculo, Contacto, TelefonoCliente, Th } from "./PanelListado";

/**
 * Una fila de la bandeja unificada: consulta, tasación o solicitud de crédito.
 *
 * La usan la bandeja y la ficha del contacto. En la ficha la columna "Cliente"
 * sobra —es siempre la misma persona—, por eso `conCliente`.
 */

const ESTILO_TIPO: Record<TipoPedido, string> = {
  CONSULTA: "bg-blue-100 text-blue-700",
  TASACION: "bg-amber-100 text-amber-700",
  SOLICITUD: "bg-violet-100 text-violet-700",
};

/** Cada tabla tiene su propia acción de estado: es un endpoint por modelo. */
const CAMBIAR_ESTADO = {
  CONSULTA: updateConsultaEstado,
  TASACION: updateTasacionEstado,
  SOLICITUD: updateSolicitudEstado,
} as const;

export const EncabezadoPedidos = ({ conCliente = true }: { conCliente?: boolean }) => (
  <thead className="bg-[#f3f3f6]">
    <tr className="border-b border-[#e5e7eb]">
      <Th>Tipo</Th>
      {conCliente && <Th>Cliente</Th>}
      <Th>Pedido</Th>
      <Th oculta="md">Fecha</Th>
      <Th>Estado</Th>
    </tr>
  </thead>
);

export const FilaPedido = ({ pedido, conCliente = true }: { pedido: Pedido; conCliente?: boolean }) => {
  const nombre = pedido.tipo === "SOLICITUD" ? `${pedido.nombre} ${pedido.apellido}` : pedido.nombre;

  return (
    <tr className="border-b border-[#e5e7eb]/50 hover:bg-[hsl(var(--surface-low))] transition align-top">
      <td className="py-3 px-4">
        <span
          className={`inline-block text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm ${ESTILO_TIPO[pedido.tipo]}`}
        >
          {ETIQUETA_TIPO[pedido.tipo]}
        </span>
      </td>

      {conCliente && (
        <td className="py-3 px-4">
          {pedido.contactoId ? (
            <Link
              href={`/dashboard/contactos/${pedido.contactoId}`}
              className="font-bold text-sm text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] hover:underline"
            >
              {nombre}
            </Link>
          ) : (
            <span className="font-bold text-sm text-[hsl(var(--foreground))]">{nombre}</span>
          )}
          <Contacto href={`mailto:${pedido.email}`} texto={pedido.email} />
          <TelefonoCliente telefono={pedido.telefono} />
          {pedido.tipo === "CONSULTA" && describirPreferencia(pedido.medioContacto, pedido.franjaHoraria) && (
            <div className="text-[10px] font-black uppercase tracking-[0.1em] text-[hsl(var(--foreground))] mt-1">
              Prefiere {describirPreferencia(pedido.medioContacto, pedido.franjaHoraria)}
            </div>
          )}
        </td>
      )}

      <td className="py-3 px-4 max-w-[340px]">
        <DetallePedido pedido={pedido} />
      </td>

      <td className="py-3 px-4 hidden md:table-cell">
        <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium whitespace-nowrap">
          {formatFechaLarga(pedido.createdAt)}
        </span>
      </td>

      <td className="py-3 px-4">
        <EstadoButton
          id={pedido.id}
          estadoActual={pedido.estado}
          cambiarEstadoAction={CAMBIAR_ESTADO[pedido.tipo]}
        />
      </td>
    </tr>
  );
};

const Secundario = ({ children }: { children: React.ReactNode }) => (
  <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{children}</div>
);

const Cita = ({ texto }: { texto: string }) => (
  <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1 italic line-clamp-2">&ldquo;{texto}&rdquo;</div>
);

/** Lo propio de cada tipo de pedido, en el mismo lugar de la fila. */
const DetallePedido = ({ pedido }: { pedido: Pedido }) => {
  switch (pedido.tipo) {
    case "CONSULTA":
      return (
        <>
          <CeldaVehiculo vehiculo={pedido.vehiculo} />
          {pedido.mensaje ? <Cita texto={pedido.mensaje} /> : <Secundario>Sin mensaje</Secundario>}
        </>
      );

    case "TASACION": {
      const fichaTecnica = [
        `${formatNumeroAr(pedido.kilometraje)} km`,
        pedido.version,
        pedido.combustible && etiquetaEnum(pedido.combustible),
        pedido.transmision && etiquetaEnum(pedido.transmision),
      ].filter(Boolean);
      return (
        <>
          <div className="text-sm font-bold text-[hsl(var(--foreground))]">
            Ofrece {pedido.marca} {pedido.modelo} {pedido.anio}
          </div>
          <Secundario>{fichaTecnica.join(" · ")}</Secundario>
          <Secundario>
            Pretende:{" "}
            {pedido.precioPretendido !== null
              ? formatPrecioOriginal(pedido.precioPretendido.toNumber(), pedido.moneda)
              : "no lo indicó"}
          </Secundario>
          {/* El código que el visitante repite al mandar fotos por WhatsApp. */}
          <div className="text-[10px] font-black tracking-widest text-[hsl(var(--muted-foreground))] mt-0.5">
            {codigoDeReferencia(pedido.id)}
          </div>
          {pedido.vehiculoInteres && (
            <div className="mt-1 flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
              Por: <CeldaVehiculo vehiculo={pedido.vehiculoInteres} />
            </div>
          )}
          {pedido.observaciones && <Cita texto={pedido.observaciones} />}
        </>
      );
    }

    case "SOLICITUD":
      return (
        <>
          <CeldaVehiculo vehiculo={pedido.vehiculo} />
          <div className="text-sm font-bold text-[hsl(var(--foreground))] mt-0.5">
            {pedido.cuotas} cuotas · anticipo {formatArs(pedido.anticipo.toNumber())}
          </div>
          <Secundario>
            Ingresos: {pedido.ingresos ? formatArs(pedido.ingresos.toNumber()) : "no especificado"} · DNI {pedido.dni}
          </Secundario>
          {pedido.mensaje && <Cita texto={pedido.mensaje} />}
        </>
      );
  }
};
