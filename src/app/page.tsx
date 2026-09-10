import { Hero } from "@/components/home/Hero";
import { RecentVehicles } from "@/components/home/RecentVehicles";
import { CompanyInfo } from "@/components/home/CompanyInfo";
import { FinancingSection } from "@/components/home/FinancingSection";
import { TasacionSection } from "@/components/home/TasacionSection";
import { LocationSection } from "@/components/home/LocationSection";

import { prisma } from "@/lib/prisma";
import { getConfiguracion } from "@/services/configuracion.service";
import { JsonLd } from "@/components/seo/JsonLd";
import { jsonLdConcesionaria } from "@/lib/seo";

/**
 * El título y la descripción los pone el layout desde la configuración; acá
 * solo se declara la canónica, para que la portada consolide los enlaces que
 * lleguen con parámetros de campaña pegados atrás.
 */
export const metadata = {
  alternates: { canonical: "/" },
};

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
    // `div` y no `main`: el elemento principal de la página lo pone el layout,
    // y anidar dos deja el documento con dos regiones principales — HTML
    // inválido, y un lector de pantalla sin saber cuál es el contenido.
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* La concesionaria como negocio local: nombre, teléfono, dirección y
          redes. Va entera una sola vez, acá, y cada ficha la referencia por
          `@id` como vendedora de la unidad. */}
      <JsonLd datos={jsonLdConcesionaria(configuracion)} />
      <Hero configuracion={configuracion} />
      <RecentVehicles
        cotizacionDolar={configuracion.cotizacionDolar}
        mostrarPrecios={configuracion.mostrarPrecios}
      />
      <CompanyInfo configuracion={configuracion} />
      {hayFinanciables && <FinancingSection configuracion={configuracion} />}
      {/* A diferencia de financiación, no depende del stock: la tasación existe
          justamente para conseguirlo, así que tiene sentido incluso con el
          catálogo vacío. */}
      {configuracion.tasacionActiva && <TasacionSection configuracion={configuracion} />}
      <LocationSection configuracion={configuracion} />
    </div>
  );
}

