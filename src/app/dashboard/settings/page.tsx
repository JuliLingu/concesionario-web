import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getConfiguracion } from "@/actions/configuracion";
import { SettingsClient } from "./SettingsClient";

export const metadata = {
  title: "Configuración | Panel de Control",
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/login");
  }

  const configuracion = await getConfiguracion();

  return <SettingsClient configuracion={configuracion} />;
}
