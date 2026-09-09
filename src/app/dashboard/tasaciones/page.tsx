import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/sesion";
import { getTasaciones, updateTasacionEstado } from "@/actions/tasacion";
import { estadoDeUrl } from "@/lib/estados";
import { formatFechaLarga } from "@/lib/formato";
import { formatNumeroAr, formatPrecioOriginal } from "@/lib/precio";
import { getConfiguracion } from "@/services/configuracion.service";
import { EstadoButton } from "@/components/dashboard/EstadoButton";
import {
  CeldaVehiculo,
  Contacto,
  PanelListado,
  SinResultados,
  TablaPanel,
  Th,
} from "@/components/dashboard/PanelListado";

interface TasacionesPageProps {
  searchParams: Promise<{ estado?: string }>;
}

/** Etiquetas legibles de los enums; el resto se muestra capitalizado. */
const LABEL_TRANSMISION: Record<string, string> = {
  AUTOMATICA: "Automática",
  MANUAL: "Manual",
  CVT: "CVT",
};

const capitalizar = (valor: string) => valor.charAt(0) + valor.slice(1).toLowerCase();

export default async function TasacionesPage({ searchParams }: TasacionesPageProps) {
  // Tasación apagada desde Configuración: las propuestas guardadas siguen en la
  // base, pero la pantalla no es alcanzable. El chequeo va antes de requireAdmin
  // para que quien no es administrador no pueda distinguir "la ruta no existe"
  // de "no tenés permiso".
  if (!(await getConfiguracion()).tasacionActiva) notFound();

  await requireAdmin();

  const estado = estadoDeUrl((await searchParams).estado);

  const [tasaciones, pendientes] = await Promise.all([
    getTasaciones(estado),
    prisma.tasacion.count({ where: { estado: "PENDIENTE" } }),
  ]);

  return (
    <PanelListado
      titulo="Tasaciones"
      resumen={`${tasaciones.length} tasaci${tasaciones.length !== 1 ? "ones" : "ón"}`}
      pendientes={pendientes}
      basePath="/dashboard/tasaciones"
      estadoActivo={estado}
    >
      {tasaciones.length === 0 ? (
        <SinResultados texto="No hay tasaciones en esta categoría." />
      ) : (
        <TablaPanel>
          <thead className="bg-[#f3f3f6]">
            <tr className="border-b border-[#e5e7eb]">
              <Th>Cliente</Th>
              <Th>Ofrece</Th>
              <Th>Pretende</Th>
              <Th oculta="lg">Le interesa</Th>
              <Th oculta="md">Fecha</Th>
              <Th>Estado</Th>
            </tr>
          </thead>
          <tbody>
            {tasaciones.map((t) => {
              const fichaTecnica = [
                t.version,
                t.combustible && capitalizar(t.combustible),
                t.transmision && LABEL_TRANSMISION[t.transmision],
              ].filter(Boolean);

              return (
                <tr
                  key={t.id}
                  className="border-b border-[#e5e7eb]/50 hover:bg-[hsl(var(--surface-low))] transition align-top"
                >
                  <td className="py-3 px-4">
                    <div className="font-bold text-sm text-[hsl(var(--foreground))]">
                      {t.nombre}
                    </div>
                    <Contacto href={`mailto:${t.email}`} texto={t.email} />
                    <Contacto href={`tel:${t.telefono}`} texto={t.telefono} tenue />
                  </td>

                  <td className="py-3 px-4">
                    <div className="text-sm font-bold text-[hsl(var(--foreground))]">
                      {t.marca} {t.modelo} {t.anio}
                    </div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                      {formatNumeroAr(t.kilometraje)} km
                    </div>
                    {fichaTecnica.length > 0 && (
                      <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                        {fichaTecnica.join(" · ")}
                      </div>
                    )}
                    {t.observaciones && (
                      <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1 italic line-clamp-2 max-w-[260px]">
                        &ldquo;{t.observaciones}&rdquo;
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    {t.precioPretendido !== null ? (
                      <span className="text-sm font-bold text-[hsl(var(--foreground))] whitespace-nowrap">
                        {formatPrecioOriginal(t.precioPretendido.toNumber(), t.moneda)}
                      </span>
                    ) : (
                      <span className="text-xs text-[hsl(var(--muted-foreground))] italic">
                        No lo indicó
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 hidden lg:table-cell">
                    <CeldaVehiculo
                      vehiculo={t.vehiculoInteres}
                      textoSinUnidad="No eligió unidad"
                    />
                  </td>

                  <td className="py-3 px-4 hidden md:table-cell">
                    <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium whitespace-nowrap">
                      {formatFechaLarga(t.createdAt)}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <EstadoButton
                      id={t.id}
                      estadoActual={t.estado}
                      cambiarEstadoAction={updateTasacionEstado}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </TablaPanel>
      )}
    </PanelListado>
  );
}
