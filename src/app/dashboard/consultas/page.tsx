import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/sesion";
import { getConsultas } from "@/actions/consulta";
import { estadoDeUrl } from "@/lib/estados";
import { formatFechaLarga } from "@/lib/formato";
import { ConsultaStatusButton } from "@/components/dashboard/ConsultaStatusButton";
import {
  CeldaVehiculo,
  Contacto,
  PanelListado,
  SinResultados,
  TablaPanel,
  Th,
} from "@/components/dashboard/PanelListado";

interface ConsultasPageProps {
  searchParams: Promise<{ estado?: string }>;
}

export default async function ConsultasPage({ searchParams }: ConsultasPageProps) {
  await requireAdmin();

  const estado = estadoDeUrl((await searchParams).estado);

  // El globo de pendientes solo necesita el número. Antes se traía la lista
  // entera de pendientes —con su join de vehículo— para leerle el `.length`.
  const [consultas, pendientes] = await Promise.all([
    getConsultas(estado),
    prisma.consulta.count({ where: { estado: "PENDIENTE" } }),
  ]);

  return (
    <PanelListado
      titulo="Consultas"
      resumen={`${consultas.length} consulta${consultas.length !== 1 ? "s" : ""}`}
      pendientes={pendientes}
      basePath="/dashboard/consultas"
      estadoActivo={estado}
    >
      {consultas.length === 0 ? (
        <SinResultados texto="No hay consultas en esta categoría." />
      ) : (
        <TablaPanel>
          <thead className="bg-[#f3f3f6]">
            <tr className="border-b border-[#e5e7eb]">
              <Th>Cliente</Th>
              <Th oculta="lg">Vehículo</Th>
              <Th oculta="md">Mensaje</Th>
              <Th oculta="md">Fecha</Th>
              <Th>Estado</Th>
            </tr>
          </thead>
          <tbody>
            {consultas.map((c) => (
              <tr
                key={c.id}
                className="border-b border-[#e5e7eb]/50 hover:bg-[hsl(var(--surface-low))] transition align-top"
              >
                <td className="py-3 px-4">
                  <div className="font-bold text-sm text-[hsl(var(--foreground))]">{c.nombre}</div>
                  <Contacto href={`mailto:${c.email}`} texto={c.email} />
                  {c.telefono && <Contacto href={`tel:${c.telefono}`} texto={c.telefono} tenue />}
                </td>
                <td className="py-3 px-4 hidden lg:table-cell">
                  <CeldaVehiculo vehiculo={c.vehiculo} />
                </td>
                <td className="py-3 px-4 hidden md:table-cell max-w-[260px]">
                  <div className="text-sm text-[hsl(var(--muted-foreground))] font-medium line-clamp-2">
                    {c.mensaje || <span className="italic opacity-50">Sin mensaje</span>}
                  </div>
                </td>
                <td className="py-3 px-4 hidden md:table-cell">
                  <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium whitespace-nowrap">
                    {formatFechaLarga(c.createdAt)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <ConsultaStatusButton consultaId={c.id} estadoActual={c.estado} />
                </td>
              </tr>
            ))}
          </tbody>
        </TablaPanel>
      )}
    </PanelListado>
  );
}
