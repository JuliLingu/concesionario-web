import { requireAdmin } from "@/lib/sesion";
import { getConfiguracion } from "@/services/configuracion.service";
import { getRendimientoStock } from "@/services/metricas.service";
import { MetricasView } from "./MetricasView";

export default async function MetricasPage() {
  await requireAdmin();

  const [rendimiento, configuracion] = await Promise.all([
    getRendimientoStock(),
    getConfiguracion(),
  ]);

  return <MetricasView rendimiento={rendimiento} mostrarPrecios={configuracion.mostrarPrecios} />;
}
