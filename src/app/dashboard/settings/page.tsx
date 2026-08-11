import { requireAdmin } from "@/lib/sesion";
import { getConfiguracion } from "@/services/configuracion.service";
import { SettingsClient } from "./SettingsClient";

export const metadata = {
  title: "Configuración | Panel de Control",
};

export default async function SettingsPage() {
  await requireAdmin();

  const configuracion = await getConfiguracion();

  return <SettingsClient configuracion={configuracion} />;
}
