import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/sesion";
import { getConfiguracion } from "@/services/configuracion.service";
import { SettingsClient } from "./SettingsClient";

export const metadata = {
  title: "Configuración | Panel de Control",
};

export default async function SettingsPage() {
  await requireAdmin();

  // La portada esconde la financiación si no hay ninguna unidad marcada; el
  // panel lo avisa para que el interruptor no quede encendido sin efecto.
  const [configuracion, vehiculosFinanciables] = await Promise.all([
    getConfiguracion(),
    prisma.vehiculo.count({ where: { publicacion: "PUBLICADO", financiable: true } }),
  ]);

  return (
    <SettingsClient
      configuracion={configuracion}
      vehiculosFinanciables={vehiculosFinanciables}
    />
  );
}
