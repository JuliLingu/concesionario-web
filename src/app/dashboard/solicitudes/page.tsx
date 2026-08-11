import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/sesion";
import { getSolicitudes } from "@/actions/financiacion";
import { estadoDeUrl } from "@/lib/estados";
import { formatFechaLarga } from "@/lib/formato";
import { formatArs } from "@/lib/precio";
import { FEATURE_FINANCIACION } from "@/lib/features";
import { SolicitudStatusButton } from "@/components/dashboard/SolicitudStatusButton";
import {
  CeldaVehiculo,
  Contacto,
  PanelListado,
  SinResultados,
  TablaPanel,
  Th,
} from "@/components/dashboard/PanelListado";

interface SolicitudesPageProps {
  searchParams: Promise<{ estado?: string }>;
}

export default async function SolicitudesPage({ searchParams }: SolicitudesPageProps) {
  // Financiación en stand by: las solicitudes guardadas siguen en la base, pero
  // la pantalla no es alcanzable.
  if (!FEATURE_FINANCIACION) notFound();

  await requireAdmin();

  const estado = estadoDeUrl((await searchParams).estado);

  const [solicitudes, pendientes] = await Promise.all([
    getSolicitudes(estado),
    prisma.solicitudFinanciacion.count({ where: { estado: "PENDIENTE" } }),
  ]);

  return (
    <PanelListado
      titulo="Solicitudes de Crédito"
      resumen={`${solicitudes.length} solicitud${solicitudes.length !== 1 ? "es" : ""}`}
      pendientes={pendientes}
      basePath="/dashboard/solicitudes"
      estadoActivo={estado}
    >
      {solicitudes.length === 0 ? (
        <SinResultados texto="No hay solicitudes en esta categoría." />
      ) : (
        <TablaPanel>
          <thead className="bg-[#f3f3f6]">
            <tr className="border-b border-[#e5e7eb]">
              <Th>Cliente / DNI</Th>
              <Th oculta="lg">Vehículo</Th>
              <Th>Financiación</Th>
              <Th oculta="md">Fecha</Th>
              <Th>Estado</Th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.map((s) => (
              <tr
                key={s.id}
                className="border-b border-[#e5e7eb]/50 hover:bg-[hsl(var(--surface-low))] transition align-top"
              >
                <td className="py-3 px-4">
                  <div className="font-bold text-sm text-[hsl(var(--foreground))]">
                    {s.nombre} {s.apellido}
                  </div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                    DNI: {s.dni}
                  </div>
                  <Contacto href={`mailto:${s.email}`} texto={s.email} />
                  {s.telefono && <Contacto href={`tel:${s.telefono}`} texto={s.telefono} tenue />}
                </td>
                <td className="py-3 px-4 hidden lg:table-cell">
                  <CeldaVehiculo vehiculo={s.vehiculo} />
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm font-bold text-[hsl(var(--foreground))]">
                    {s.cuotas} Cuotas
                  </div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                    Anticipo: {formatArs(s.anticipo.toNumber())}
                  </div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                    Ingresos: {s.ingresos ? formatArs(s.ingresos.toNumber()) : "No especificado"}
                  </div>
                  {s.mensaje && (
                    <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1 italic line-clamp-2">
                      &ldquo;{s.mensaje}&rdquo;
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 hidden md:table-cell">
                  <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium whitespace-nowrap">
                    {formatFechaLarga(s.createdAt)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <SolicitudStatusButton solicitudId={s.id} estadoActual={s.estado} />
                </td>
              </tr>
            ))}
          </tbody>
        </TablaPanel>
      )}
    </PanelListado>
  );
}
