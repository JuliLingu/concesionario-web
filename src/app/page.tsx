import { Hero } from "@/components/home/Hero";
import { RecentVehicles } from "@/components/home/RecentVehicles";
import { CompanyInfo } from "@/components/home/CompanyInfo";
import { FinancingSection } from "@/components/home/FinancingSection";
import { LocationSection } from "@/components/home/LocationSection";

export default async function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <RecentVehicles />
      <CompanyInfo />
      <FinancingSection />
      <LocationSection />
    </div>
  );
}

