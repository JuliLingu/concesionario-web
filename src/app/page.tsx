import { Hero } from "@/components/home/Hero";
import { RecentVehicles } from "@/components/home/RecentVehicles";
import { CompanyInfo } from "@/components/home/CompanyInfo";
import { FinancingSection } from "@/components/home/FinancingSection";
import { LocationSection } from "@/components/home/LocationSection";

import { prisma } from "@/lib/prisma";
import { getConfiguracion } from "@/services/configuracion.service";

export default async function HomePage() {
  const configuracion = await getConfiguracion();

  // La sección promete cuotas y su botón abre el catálogo filtrado por unidades
  // financiables: sin ninguna marcada, ese enlace caería en una grilla vacía.
  // Se cuenta solo si el módulo está encendido, para no consultar de más.
  const hayFinanciables =
    configuracion.financiacionActiva &&
    (await prisma.vehiculo.count({
      where: { publicacion: "PUBLICADO", financiable: true },
    })) > 0;

  return (
    <main style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Hero configuracion={configuracion} />
      <RecentVehicles
        cotizacionDolar={configuracion.cotizacionDolar}
        mostrarPrecios={configuracion.mostrarPrecios}
      />
      <CompanyInfo configuracion={configuracion} />
      {hayFinanciables && <FinancingSection configuracion={configuracion} />}
      <LocationSection configuracion={configuracion} />
    </main>
  );
}

