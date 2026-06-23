import { Hero } from "@/components/home/Hero";
import { RecentVehicles } from "@/components/home/RecentVehicles";
import { CompanyInfo } from "@/components/home/CompanyInfo";
import { FinancingSection } from "@/components/home/FinancingSection";
import { LocationSection } from "@/components/home/LocationSection";

export default async function HomePage() {
  return (
    <main style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Hero />
      <RecentVehicles />
      <CompanyInfo />
      <FinancingSection />
      <LocationSection />
    </main>
  );
}

