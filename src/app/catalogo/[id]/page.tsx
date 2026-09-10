import type { Metadata } from "next";
import { getVehiculoPorId } from "@/services/vehiculo.service";
import { getConfiguracion } from "@/services/configuracion.service";
import { getPlanes } from "@/actions/financiacion";
import { notFound } from "next/navigation";
import { VehicleDetail } from "./VehicleDetail";
import { JsonLd } from "@/components/seo/JsonLd";
import { whatsappUrl } from "@/lib/whatsapp";
import {
  descripcionVehiculo,
  jsonLdVehiculo,
  nombreVehiculo,
  tituloVehiculo,
  type ContextoSeo,
} from "@/lib/seo";

interface VehiclePageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Lo que la ficha le declara a un buscador, armado con los mismos datos que se
 * ven en pantalla (ver `lib/seo.ts`). Tanto esta función como la página piden la
 * unidad y la configuración, pero las dos lecturas están cacheadas por request,
 * así que la base se consulta una sola vez.
 */
export async function generateMetadata({ params }: VehiclePageProps): Promise<Metadata> {
  const { id } = await params;
  const [vehicle, configuracion] = await Promise.all([
    getVehiculoPorId(id),
    getConfiguracion(),
  ]);

  // La página responde 404; acá alcanza con no declarar nada de la unidad.
  if (!vehicle) return { title: "Vehículo no encontrado" };

  const contexto: ContextoSeo = {
    concesionaria: configuracion,
    mostrarPrecios: configuracion.mostrarPrecios,
    cotizacionDolar: configuracion.cotizacionDolar,
  };

  const titulo = tituloVehiculo(vehicle);
  const descripcion = descripcionVehiculo(vehicle, contexto);
  const ruta = `/catalogo/${vehicle.id}`;

  return {
    title: titulo,
    description: descripcion,
    // Cada unidad tiene una sola URL, pero conviene declararla igual: es lo que
    // consolida el enlace cuando alguien la comparte con parámetros de campaña
    // (`?utm_source=...`) pegados atrás.
    alternates: { canonical: ruta },
    openGraph: {
      type: "website",
      title: titulo,
      description: descripcion,
      url: ruta,
      // Next reemplaza el `openGraph` del layout entero, no lo fusiona campo a
      // campo: lo que no se repita acá desaparece de la ficha.
      siteName: configuracion.nombreConcesionaria,
      locale: "es_AR",
      // Las imágenes las aporta `opengraph-image.tsx`, que está al lado.
    },
    twitter: { card: "summary_large_image", title: titulo, description: descripcion },
    // Un borrador o una unidad pausada solo es alcanzable por el administrador
    // —a cualquier otro le responde 404—, pero si alguna vez se compartiera ese
    // enlace, esto evita que termine indexado.
    ...(vehicle.publicacion !== "PUBLICADO" && {
      robots: { index: false, follow: false },
    }),
  };
}

export default async function VehicleDetailPage({ params }: VehiclePageProps) {
  const { id } = await params;

  const [vehicle, configuracion] = await Promise.all([
    getVehiculoPorId(id),
    getConfiguracion(),
  ]);

  if (!vehicle) {
    notFound();
  }

  // Los planes son globales, así que la unidad tiene que estar marcada como
  // financiable para ofrecerlos: sin eso, un alta nueva entraría sola al
  // simulador. Si el módulo está apagado o la unidad es solo contado, los planes
  // ni se consultan.
  const rawPlanes =
    configuracion.financiacionActiva && vehicle.financiable
      ? await getPlanes(false) // solo activos
      : [];

  const vehiculoNombre = nombreVehiculo(vehicle);
  const whatsappHref = whatsappUrl(
    configuracion.telefono,
    `Hola, me interesa el ${vehiculoNombre}. ¿Podría darme más información?`,
  );

  const planes = rawPlanes.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    cuotas: p.cuotas,
    tasaAnual: p.tasaAnual.toNumber(),
  }));

  // Textos de la sección de consulta: se editan en /dashboard/settings. El
  // marcador {concesionaria} ya viene resuelto por el service.
  const contacto = {
    eyebrow: configuracion.contactoEyebrow,
    titulo: configuracion.contactoTitulo,
    texto: configuracion.contactoTexto,
    whatsappTexto: configuracion.contactoWhatsappTexto,
  };

  return (
    <>
      {/* El bloque que Google convierte en resultado enriquecido: precio, año y
          kilometraje debajo del enlace. Solo se emite para la unidad publicada;
          declarar datos estructurados de algo que el visitante no puede ver es
          justamente lo que la documentación llama contenido oculto. */}
      {vehicle.publicacion === "PUBLICADO" && (
        <JsonLd
          datos={jsonLdVehiculo(vehicle, {
            concesionaria: configuracion,
            mostrarPrecios: configuracion.mostrarPrecios,
            cotizacionDolar: configuracion.cotizacionDolar,
          })}
        />
      )}
      <VehicleDetail
        vehicle={vehicle}
        vehiculoNombre={vehiculoNombre}
        whatsappUrl={whatsappHref}
        cotizacionDolar={configuracion.cotizacionDolar}
        mostrarPrecios={configuracion.mostrarPrecios}
        financiacionActiva={configuracion.financiacionActiva}
        tasacion={{
          activa: configuracion.tasacionActiva,
          ctaTexto: configuracion.tasacionCtaTexto,
        }}
        planes={planes}
        contacto={contacto}
      />
    </>
  );
}
