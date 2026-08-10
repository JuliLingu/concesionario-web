import { Hero } from "@/components/home/Hero";
import { RecentVehicles } from "@/components/home/RecentVehicles";
import { CompanyInfo } from "@/components/home/CompanyInfo";
import { FinancingSection } from "@/components/home/FinancingSection";
import { LocationSection } from "@/components/home/LocationSection";

import { getConfiguracion } from "@/services/configuracion.service";
import { FEATURE_FINANCIACION } from "@/lib/features";

export default async function HomePage() {
  const configuracion = await getConfiguracion();

  return (
    <main style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Hero configuracion={configuracion} />
      <RecentVehicles cotizacionDolar={configuracion.cotizacionDolar} />
      <CompanyInfo configuracion={configuracion} />
      {FEATURE_FINANCIACION && <FinancingSection configuracion={configuracion} />}
      <LocationSection configuracion={configuracion} />
    </main>
  );
}

