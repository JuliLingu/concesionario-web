import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Car, GitCompareArrows, Plus, X } from "lucide-react";
import { SincronizarComparacion } from "@/components/catalog/SincronizarSeleccion";
import { getConfiguracion } from "@/services/configuracion.service";
import { getVehiculosPorIds, type VehiculoElegido } from "@/services/vehiculo.service";
import { getCldUrl } from "@/lib/cloudinary";
import { etiquetaEnum } from "@/lib/etiquetas";
import { formatNumeroAr } from "@/lib/precio";
import { precioDeVitrina } from "@/lib/vitrina";
import { mejoresDeLaFila, preciosComparables, type Criterio } from "@/lib/comparador";
import { MAXIMO_COMPARAR, MINIMO_COMPARAR, idsDeUrl, urlConIds } from "@/lib/seleccion";

export const metadata: Metadata = {
  title: "Comparar unidades",
  // Cada combinación de ids es una URL distinta con contenido que ya está en
  // las fichas: no se indexa, pero se sigue para llegar a ellas.
  robots: { index: false, follow: true },
};

interface CompararPageProps {
  searchParams: Promise<{ ids?: string | string[] }>;
}

/** Una fila de la tabla: qué se muestra en cada columna y, si aplica, cuál gana. */
interface Fila {
  label: string;
  valores: (React.ReactNode | null)[];
  mejores?: boolean[];
}

/** Arma una fila numérica con su criterio de "mejor". */
function filaNumerica(
  label: string,
  numeros: (number | null)[],
  criterio: Criterio,
  formato: (n: number) => string,
): Fila {
  return {
    label,
    valores: numeros.map((n) => (n === null ? null : formato(n))),
    mejores: mejoresDeLaFila(numeros, criterio),
  };
}

export default async function CompararPage({ searchParams }: CompararPageProps) {
  const ids = idsDeUrl((await searchParams).ids, MAXIMO_COMPARAR);
  const [vehiculos, configuracion] = await Promise.all([
    getVehiculosPorIds(ids),
    getConfiguracion(),
  ]);
  const idsVisibles = vehiculos.map((v) => v.id);

  if (vehiculos.length < MINIMO_COMPARAR) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] pt-header pb-12">
        <SincronizarComparacion ids={idsVisibles} />
        <div className="max-w-3xl mx-auto px-4 md:px-8 mt-12 text-center flex flex-col items-center">
          <GitCompareArrows size={36} className="text-[hsl(var(--muted-foreground))] opacity-40 mb-3" />
          <h1 className="text-3xl font-bold tracking-tight mb-2">Elegí al menos dos unidades</h1>
          <p className="text-[hsl(var(--muted-foreground))] font-medium mb-5 max-w-md">
            {ids.length > vehiculos.length
              ? "Alguna de las unidades de este enlace ya no está disponible. "
              : ""}
            Tocá el botón de comparar en hasta {MAXIMO_COMPARAR} autos del catálogo para verlos lado a lado.
          </p>
          <Link
            href="/catalogo"
            className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-[11px] font-black uppercase tracking-[0.1em] px-5 py-3 rounded hover:brightness-90 transition"
          >
            Ir al catálogo
          </Link>
        </div>
      </div>
    );
  }

  const { mostrarPrecios, cotizacionDolar, financiacionActiva } = configuracion;
  const vendido = (v: VehiculoElegido) => v.publicacion === "VENDIDO";

  // Una vendida no compite por precio: ya no se puede comprar a ninguno.
  const precios = preciosComparables(vehiculos, cotizacionDolar).map((p, i) =>
    vendido(vehiculos[i]) ? null : p,
  );

  const filas: Fila[] = [
    ...(mostrarPrecios
      ? [
          {
            label: "Precio",
            valores: vehiculos.map((v) => {
              if (vendido(v)) return "Vendido";
              const precio = precioDeVitrina(v.precio, v.moneda, cotizacionDolar);
              return (
                <>
                  <span className="block font-black text-[hsl(var(--primary))] text-lg tracking-tight">
                    {precio.principal}
                  </span>
                  {precio.secundario && (
                    <span className="block text-xs text-[hsl(var(--muted-foreground))]">
                      {precio.secundario}
                    </span>
                  )}
                </>
              );
            }),
            mejores: mejoresDeLaFila(precios, "menor"),
          },
        ]
      : []),
    filaNumerica("Año", vehiculos.map((v) => v.anio), "mayor", String),
    filaNumerica("Kilometraje", vehiculos.map((v) => v.kilometraje), "menor", (n) => `${formatNumeroAr(n)} km`),
    { label: "Condición", valores: vehiculos.map((v) => etiquetaEnum(v.estado)) },
    { label: "Categoría", valores: vehiculos.map((v) => v.categoria.nombre) },
    { label: "Combustible", valores: vehiculos.map((v) => (v.combustible ? etiquetaEnum(v.combustible) : null)) },
    { label: "Transmisión", valores: vehiculos.map((v) => (v.transmision ? etiquetaEnum(v.transmision) : null)) },
    { label: "Motor", valores: vehiculos.map((v) => v.motor) },
    filaNumerica("Potencia", vehiculos.map((v) => v.potencia || null), "mayor", (n) => `${n} CV`),
    { label: "Puertas", valores: vehiculos.map((v) => v.puertas || null) },
    { label: "Color", valores: vehiculos.map((v) => v.color) },
    ...(financiacionActiva
      ? [
          {
            label: "Financiación",
            valores: vehiculos.map((v) => (vendido(v) ? null : v.financiable ? "En cuotas" : "Solo contado")),
          },
        ]
      : []),
  ]
    // Un dato que no está cargado en ninguna de las unidades no compara nada.
    .filter((fila) => fila.valores.some((valor) => valor !== null));

  const quitar = (id: string) => urlConIds("/comparar", idsVisibles.filter((otro) => otro !== id));

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] pt-header pb-12">
      <SincronizarComparacion ids={idsVisibles} />
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="mb-6 mt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[hsl(var(--primary))] mb-2">
              Lado a lado
            </p>
            <h1 className="text-4xl md:text-[3rem] font-bold tracking-tight">Comparar unidades</h1>
          </div>
          {vehiculos.length < MAXIMO_COMPARAR && (
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.1em] text-[hsl(var(--primary))] hover:text-[hsl(var(--foreground))] transition-colors"
            >
              <Plus size={14} /> Sumar otra
            </Link>
          )}
        </div>

        {/* El scroll horizontal queda dentro de la tarjeta: en un teléfono tres
            columnas no entran, y la de etiquetas queda fija a la izquierda. */}
        <div className="bg-[hsl(var(--card))] shadow-[0_4px_20px_rgba(26,28,30,0.06)] overflow-x-auto">
          <table className="w-full text-sm border-collapse table-fixed min-w-[560px]">
            <colgroup>
              <col className="w-28 md:w-40" />
              {vehiculos.map((v) => (
                <col key={v.id} />
              ))}
            </colgroup>
            <thead>
              <tr className="align-top">
                <th className="sticky left-0 z-10 bg-[hsl(var(--card))]" />
                {vehiculos.map((v) => (
                  <th key={v.id} scope="col" className="p-3 text-left font-normal">
                    <Encabezado vehiculo={v} hrefQuitar={quitar(v.id)} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map((fila) => (
                <tr key={fila.label} className="border-t border-black/5">
                  <th
                    scope="row"
                    className="sticky left-0 z-10 bg-[hsl(var(--card))] p-3 text-left text-[10px] font-black uppercase tracking-[0.1em] text-[hsl(var(--muted-foreground))]"
                  >
                    {fila.label}
                  </th>
                  {fila.valores.map((valor, i) => {
                    const mejor = fila.mejores?.[i] ?? false;
                    return (
                      <td
                        key={vehiculos[i].id}
                        className={`p-3 font-bold tabular-nums ${mejor ? "bg-emerald-600/10 text-emerald-800" : ""}`}
                      >
                        {valor ?? <span className="text-[hsl(var(--muted-foreground))] font-medium">—</span>}
                        {mejor && (
                          <span className="block text-[9px] font-black uppercase tracking-[0.15em] text-emerald-700 mt-0.5">
                            Mejor
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const Encabezado = ({ vehiculo, hrefQuitar }: { vehiculo: VehiculoElegido; hrefQuitar: string }) => {
  const imagen =
    vehiculo.imagenes.find((img) => img.esPrincipal)?.url || vehiculo.imagenes[0]?.url || "";

  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-[4/3] bg-[hsl(var(--surface-low))] overflow-hidden">
        {imagen ? (
          <Image
            src={getCldUrl(imagen, { modo: "recorte", relacion: "4:3" })}
            alt={`${vehiculo.marca} ${vehiculo.modelo}`}
            fill
            sizes="(max-width: 768px) 45vw, 30vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Car className="w-10 h-10 text-[hsl(var(--muted-foreground))] opacity-20" />
          </div>
        )}
        <Link
          href={hrefQuitar}
          aria-label={`Quitar ${vehiculo.marca} ${vehiculo.modelo} de la comparación`}
          title="Quitar"
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white/85 text-[hsl(var(--foreground))] hover:bg-white shadow"
        >
          <X size={14} />
        </Link>
      </div>
      <div>
        <p className="text-base md:text-lg font-bold tracking-tight leading-tight text-[hsl(var(--foreground))]">
          {vehiculo.marca} {vehiculo.modelo}
        </p>
        <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium truncate">
          {vehiculo.version || vehiculo.motor || "Versión Base"}
        </p>
      </div>
      {vehiculo.publicacion !== "VENDIDO" && (
        <Link
          href={`/catalogo/${vehiculo.id}`}
          className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.1em] text-[hsl(var(--primary))] hover:text-[hsl(var(--foreground))] transition-colors"
        >
          Ver ficha <ArrowRight size={12} />
        </Link>
      )}
    </div>
  );
};
