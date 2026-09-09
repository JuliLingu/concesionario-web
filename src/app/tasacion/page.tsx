import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getConfiguracion } from "@/services/configuracion.service";
import { TasacionForm, type UnidadDeInteres } from "@/components/tasacion/TasacionForm";

/**
 * Formulario público de tasación: un visitante ofrece su usado.
 *
 * Vive en su propia ruta, y no dentro de la portada, para poder mandarle el
 * enlace directo a alguien —o pautarlo— sin arrastrar el resto del sitio.
 */

interface TasacionPageProps {
  /** `?vehiculo=<id>` preselecciona la unidad, al llegar desde una ficha. */
  searchParams: Promise<{ vehiculo?: string }>;
}

/** Tope del desplegable de unidades: es una ayuda, no el catálogo entero. */
const MAXIMO_UNIDADES = 60;

export async function generateMetadata(): Promise<Metadata> {
  const configuracion = await getConfiguracion();

  if (!configuracion.tasacionActiva) return {};

  return {
    title: `${configuracion.tasacionCtaTexto} | ${configuracion.nombreConcesionaria}`,
    description: configuracion.tasacionTexto,
  };
}

export default async function TasacionPage({ searchParams }: TasacionPageProps) {
  const configuracion = await getConfiguracion();

  // Módulo apagado: la ruta no existe. Las tasaciones ya recibidas siguen en la
  // base, pero nadie puede mandar una nueva.
  if (!configuracion.tasacionActiva) notFound();

  const { vehiculo } = await searchParams;

  const unidades: UnidadDeInteres[] = await prisma.vehiculo
    .findMany({
      where: { publicacion: "PUBLICADO" },
      select: { id: true, marca: true, modelo: true, anio: true },
      orderBy: [{ marca: "asc" }, { modelo: "asc" }],
      take: MAXIMO_UNIDADES,
    })
    .catch(() => []);

  // El id de la URL solo sirve para preseleccionar el desplegable; la acción lo
  // vuelve a verificar contra la base antes de guardarlo.
  const unidadInicial = unidades.some((u) => u.id === vehiculo) ? vehiculo : undefined;

  return (
    <main className="min-h-screen bg-[hsl(var(--background))] pt-header pb-20">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <header className="pt-10 pb-8">
          <div className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--primary))] mb-3">
            {configuracion.tasacionEyebrow}
          </div>
          <h1 className="text-[2.5rem] md:text-[3.5rem] font-bold tracking-[-0.02em] leading-[0.95] text-[hsl(var(--foreground))] whitespace-pre-line mb-5">
            {configuracion.tasacionTitulo}
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] font-medium leading-relaxed max-w-[46ch]">
            {configuracion.tasacionTexto}
          </p>
        </header>

        <div className="bg-[hsl(var(--card))] rounded p-6 md:p-8 shadow-[0_20px_40px_rgba(26,28,30,0.06)]">
          <TasacionForm
            unidades={unidades}
            unidadInicial={unidadInicial}
            telefono={configuracion.telefono}
          />
        </div>

        <p className="text-xs text-[hsl(var(--muted-foreground))] text-center mt-6">
          Los datos que dejes se usan solo para contactarte por esta cotización.
        </p>
      </div>
    </main>
  );
}
