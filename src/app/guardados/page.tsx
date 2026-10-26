import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";
import { VehicleCard } from "@/components/catalog/VehicleCard";
import { SincronizarGuardados } from "@/components/catalog/SincronizarSeleccion";
import { getConfiguracion } from "@/services/configuracion.service";
import { getVehiculosPorIds } from "@/services/vehiculo.service";
import { getPlanes } from "@/actions/financiacion";
import { MAXIMO_GUARDADOS, idsDeUrl } from "@/lib/seleccion";

export const metadata: Metadata = {
  title: "Mis guardados",
  // Es una lista personal: cada visitante ve la suya. No hay nada que indexar.
  robots: { index: false, follow: true },
};

interface GuardadosPageProps {
  searchParams: Promise<{ ids?: string | string[] }>;
}

export default async function GuardadosPage({ searchParams }: GuardadosPageProps) {
  const ids = idsDeUrl((await searchParams).ids, MAXIMO_GUARDADOS);

  // Sin try/catch a propósito: si la base falla, que responda la página de
  // error. Devolver una lista vacía haría que el navegador crea que ninguna
  // unidad existe más y vacíe los guardados del visitante.
  const [vehiculos, configuracion] = await Promise.all([
    getVehiculosPorIds(ids),
    getConfiguracion(),
  ]);
  const planes =
    configuracion.financiacionActiva && vehiculos.length > 0
      ? (await getPlanes(false)).map((p) => ({ cuotas: p.cuotas, tasaAnual: p.tasaAnual.toNumber() }))
      : [];

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] pt-header pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="mb-6 mt-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[hsl(var(--primary))] mb-2">
            Tu selección
          </p>
          <h1 className="text-4xl md:text-[3rem] font-bold tracking-tight mb-1">Mis guardados</h1>
          <p className="text-[hsl(var(--muted-foreground))] font-medium max-w-2xl">
            Quedan guardados en este navegador, sin necesidad de crear una cuenta. Elegí dos o tres
            con el botón de comparar para verlas lado a lado.
          </p>
        </div>

        <SincronizarGuardados
          idsEnUrl={ids}
          idsEncontrados={vehiculos.map((v) => v.id)}
          cargando={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy>
              {[0, 1, 2].map((i) => (
                <div key={i} className="aspect-[4/5] bg-[hsl(var(--surface-low))] animate-pulse" />
              ))}
            </div>
          }
          vacio={
            <div className="py-12 text-center flex flex-col items-center justify-center bg-black/5 border border-dashed border-black/10 rounded">
              <Heart size={32} className="text-[hsl(var(--muted-foreground))] opacity-40 mb-3" />
              <h2 className="text-xl font-bold mb-1">Todavía no guardaste ninguna unidad.</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4 max-w-md">
                Tocá el corazón en cualquier auto del catálogo y lo vas a encontrar acá.
              </p>
              <Link
                href="/catalogo"
                className="bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-[10px] font-black uppercase tracking-[0.1em] px-4 py-2 rounded hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] transition"
              >
                Ver el catálogo
              </Link>
            </div>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehiculos.map((v, index) => (
              <VehicleCard
                key={v.id}
                vehiculo={v}
                priority={index < 2}
                cotizacionDolar={configuracion.cotizacionDolar}
                mostrarPrecios={configuracion.mostrarPrecios}
                planes={planes}
              />
            ))}
          </div>
        </SincronizarGuardados>
      </div>
    </div>
  );
}
