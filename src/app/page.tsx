import { Hero } from "@/components/home/Hero";
import { RecentVehicles } from "@/components/home/RecentVehicles";
import { CompanyInfo } from "@/components/home/CompanyInfo";
import { FinancingSection } from "@/components/home/FinancingSection";
import { LocationSection } from "@/components/home/LocationSection";

import { getConfiguracion } from "@/actions/configuracion";

export default async function HomePage() {
  const configuracion = await getConfiguracion();

  return (
    <main style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Hero />
      <RecentVehicles cotizacionDolar={configuracion?.cotizacionDolar} />
      <CompanyInfo />
      <FinancingSection />
      <LocationSection configuracion={configuracion} />
    </main>
  );
}

