import { RecentVehicles } from "@/components/home/RecentVehicles";
import { Hero } from "@/components/home/Hero";
import { CompanyInfo } from "@/components/home/CompanyInfo";

export default async function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <RecentVehicles />
      <CompanyInfo />
    </div>
  );
}
