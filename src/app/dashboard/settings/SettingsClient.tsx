"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  Settings,
  Save,
  Phone,
  Mail,
  MapPin,
  Building2,
  DollarSign,
  Clock,
  ImagePlus,
  Globe,
  Percent,
  Type,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
import { ImageDropzone } from "@/components/dashboard/ImageDropzone";
import { updateConfiguracion } from "@/actions/configuracion";
import type { SiteConfig } from "@/lib/configuracion-defaults";
import { FEATURE_FINANCIACION } from "@/lib/features";
import Link from "next/link";

const Facebook = ({
  size = 24,
  color = "currentColor",
  className = "",
}: {
  size?: number;
  color?: string;
  className?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3.64l.36-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Instagram = ({
  size = 24,
  color = "currentColor",
  className = "",
}: {
  size?: number;
  color?: string;
  className?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

interface SettingsClientProps {
  configuracion: SiteConfig;
}

interface FieldProps {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number | null;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  helperText?: string;
  icon?: React.ReactNode;
}

function FormField({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  required,
  rows,
  helperText,
  icon,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]"
      >
        {label}
        {required && " *"}
      </label>
      <div className="relative flex items-start gap-2">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]">
            {icon}
          </span>
        )}
        {rows ? (
          <textarea
            id={name}
            name={name}
            rows={rows}
            defaultValue={defaultValue ?? ""}
            placeholder={placeholder}
            required={required}
            className={`w-full bg-[hsl(var(--input))] text-sm rounded px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]/20 resize-none ${icon ? "pl-9" : ""}`}
          />
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            defaultValue={defaultValue ?? ""}
            placeholder={placeholder}
            required={required}
            className={`w-full bg-[hsl(var(--input))] text-sm rounded px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]/20 ${icon ? "pl-9" : ""}`}
          />
        )}
      </div>
      {helperText && (
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          {helperText}
        </p>
      )}
    </div>
  );
}

interface ImageUploadFieldProps {
  /** Nombre del input oculto que viaja en el FormData. */
  name: string;
  value: string;
  onChange: (url: string) => void;
  formats: string[];
  /** Clase de proporción para la vista previa, ej. "aspect-video". */
  aspect?: string;
  fit?: "cover" | "contain";
  /** Valor al que vuelve el botón de descarte. "" equivale a quitar la imagen. */
  resetTo?: string;
  resetLabel?: string;
  emptyLabel?: string;
  helperText?: string;
}

function ImageUploadField({
  name,
  value,
  onChange,
  formats,
  aspect = "aspect-video",
  fit = "cover",
  resetTo = "",
  resetLabel = "Quitar",
  emptyLabel = "Sin imagen cargada",
  helperText,
}: ImageUploadFieldProps) {
  return (
    <>
      <input type="hidden" name={name} value={value} />

      <div
        className={`relative w-full overflow-hidden rounded bg-[hsl(var(--surface-low))] ${aspect}`}
      >
        {value ? (
          <Image
            key={value}
            src={value}
            alt="Vista previa"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            // Sin optimizar: son imágenes chicas y puede tratarse de .ico o .svg,
            // formatos que el optimizador de Next no procesa.
            unoptimized
            className={fit === "cover" ? "object-cover" : "object-contain p-4"}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
            {emptyLabel}
          </div>
        )}
      </div>

      <ImageDropzone
        onUpload={(urls) => {
          if (urls[0]) onChange(urls[0]);
        }}
        extensiones={formats}
        compact
      />

      {value !== resetTo && (
        <button
          type="button"
          onClick={() => onChange(resetTo)}
          className="self-start px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.1em] border border-[hsl(var(--border))] rounded text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--surface-low))] transition"
        >
          {resetLabel}
        </button>
      )}

      {helperText && (
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          {helperText}
        </p>
      )}
    </>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(26,28,30,0.06)] p-6 h-full">
      <h2 className="text-base font-black uppercase tracking-tight mb-6 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

const TABS = [
  { id: "general", label: "General" },
  { id: "marca", label: "Marca" },
  { id: "portada", label: "Portada" },
  { id: "nosotros", label: "Nosotros" },
  { id: "financiacion", label: "Financiación" },
  { id: "contacto", label: "Consulta por Unidad" },
  { id: "pie", label: "Pie y SEO" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// La pestaña de financiación queda oculta mientras la feature está en stand by.
// Sus campos siguen montados (ocultos) para que guardar la configuración no
// borre los textos ya cargados.
const TABS_VISIBLES = TABS.filter(
  (t) => t.id !== "financiacion" || FEATURE_FINANCIACION,
);

export const SettingsClient = ({ configuracion }: SettingsClientProps) => {
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<TabId>("general");
  const [heroImagenUrl, setHeroImagenUrl] = useState(
    configuracion.heroImagenUrl,
  );
  const [logoUrl, setLogoUrl] = useState(configuracion.logoUrl);
  const [faviconUrl, setFaviconUrl] = useState(configuracion.faviconUrl);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({
    type: null,
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ type: null, message: "" });

    const formData = new FormData(e.currentTarget);
    // Se envía el formulario completo, no solo la pestaña visible: los campos
    // de las pestañas ocultas siguen montados en el DOM.
    const data = Object.fromEntries(formData.entries());

    startTransition(async () => {
      const result = await updateConfiguracion(data);
      if (result.success) {
        setStatus({
          type: "success",
          message: "Configuración actualizada correctamente.",
        });
      } else {
        setStatus({
          type: "error",
          message: result.error || "Ocurrió un error inesperado.",
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] pt-header pb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 mb-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] text-sm font-medium transition"
        >
          <ArrowLeft size={16} /> Volver al Panel
        </Link>
        {/* Header */}
        <div className="mb-10 flex items-center gap-4">
          <div className="p-3 bg-white rounded-xl shadow-[0_20px_40px_rgba(26,28,30,0.06)]">
            <Settings size={28} color="#b5000b" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[hsl(var(--primary))] mb-1">
              Panel de Control
            </p>
            <h1 className="text-4xl font-black uppercase tracking-tight text-[hsl(var(--foreground))]">
              Configuración
            </h1>
          </div>
        </div>

        {/* Alert */}
        {status.type && (
          <div
            className={`mb-6 p-4 rounded text-sm font-medium ${
              status.type === "success"
                ? "bg-green-50 text-green-700 border-l-4 border-green-500"
                : "bg-red-50 text-red-700 border-l-4 border-red-500"
            }`}
          >
            {status.message}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-[hsl(var(--border))]">
          {TABS_VISIBLES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 -mb-px transition ${
                tab === t.id
                  ? "border-[#b5000b] text-[#b5000b]"
                  : "border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* ── General ─────────────────────────────────────────────── */}
          <div
            className={
              tab === "general"
                ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                : "hidden"
            }
          >
            <Card
              title="Información de la Concesionaria"
              icon={<Building2 size={18} color="#b5000b" />}
            >
              <FormField
                label="Nombre de la Concesionaria"
                name="nombreConcesionaria"
                defaultValue={configuracion.nombreConcesionaria}
                helperText="Obligatorio"
                icon={<Building2 size={16} />}
              />
              <FormField
                label="Teléfono"
                name="telefono"
                defaultValue={configuracion.telefono}
                icon={<Phone size={16} />}
              />
              <FormField
                label="Correo Electrónico"
                name="email"
                type="email"
                defaultValue={configuracion.email}
                icon={<Mail size={16} />}
              />
              <FormField
                label="Dirección"
                name="direccion"
                defaultValue={configuracion.direccion}
                rows={2}
                icon={<MapPin size={16} />}
              />
              <FormField
                label="Horarios de Atención"
                name="horariosAtencion"
                defaultValue={configuracion.horariosAtencion}
                rows={2}
                placeholder="Ej: Lun — Vie: 09:00 — 19:00"
                helperText="Cada salto de línea se respeta en la página"
                icon={<Clock size={16} />}
              />
              <FormField
                label="Cotización del Dólar (ARS)"
                name="cotizacionDolar"
                type="number"
                defaultValue={configuracion.cotizacionDolar}
                helperText="Se utilizará para mostrar los precios en pesos argentinos"
                icon={<DollarSign size={16} />}
              />
            </Card>

            <Card
              title="Redes Sociales"
              icon={<Facebook size={18} color="#b5000b" />}
            >
              <FormField
                label="URL de Facebook"
                name="facebookUrl"
                defaultValue={configuracion.facebookUrl}
                placeholder="https://facebook.com/..."
                icon={<Facebook size={16} />}
              />
              <FormField
                label="URL de Instagram"
                name="instagramUrl"
                defaultValue={configuracion.instagramUrl}
                placeholder="https://instagram.com/..."
                icon={<Instagram size={16} />}
              />
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Los iconos solo aparecen en el pie de página si cargás la URL.
              </p>
            </Card>
          </div>

          {/* ── Marca ───────────────────────────────────────────────── */}
          <div
            className={
              tab === "marca"
                ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                : "hidden"
            }
          >
            <Card title="Logo" icon={<ImagePlus size={18} color="#b5000b" />}>
              <ImageUploadField
                name="logoUrl"
                value={logoUrl}
                onChange={setLogoUrl}
                formats={["webp", "png", "jpg", "jpeg"]}
                aspect="aspect-[3/1]"
                fit="contain"
                emptyLabel="Sin logo — se usa el icono por defecto"
                helperText="Se muestra en el encabezado y en el pie, con 32px de alto. Conviene un PNG con fondo transparente. No se admite SVG."
              />
            </Card>

            <Card title="Favicon" icon={<Globe size={18} color="#b5000b" />}>
              <ImageUploadField
                name="faviconUrl"
                value={faviconUrl}
                onChange={setFaviconUrl}
                formats={["png", "ico", "svg", "webp"]}
                aspect="aspect-square max-w-[160px]"
                fit="contain"
                emptyLabel="Sin favicon"
                helperText="Es el icono de la pestaña del navegador. Se recomienda una imagen cuadrada de 512x512px. Puede tardar en verse: los navegadores lo cachean de forma agresiva."
              />
            </Card>
          </div>

          {/* ── Portada ─────────────────────────────────────────────── */}
          <div
            className={
              tab === "portada"
                ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                : "hidden"
            }
          >
            <Card
              title="Textos de la Portada"
              icon={<Type size={18} color="#b5000b" />}
            >
              <FormField
                label="Título Principal"
                name="heroTitulo"
                defaultValue={configuracion.heroTitulo}
                placeholder="KINETIC"
                icon={<Type size={16} />}
              />
              <FormField
                label="Subtítulo"
                name="heroSubtitulo"
                defaultValue={configuracion.heroSubtitulo}
                placeholder="Ingeniería en Movimiento."
              />
              <FormField
                label="Texto del Botón"
                name="heroCtaTexto"
                defaultValue={configuracion.heroCtaTexto}
                placeholder="Ver Catálogo"
              />
              <FormField
                label="Destino del Botón"
                name="heroCtaUrl"
                defaultValue={configuracion.heroCtaUrl}
                placeholder="/catalogo"
                helperText="Una ruta interna (/catalogo) o una URL completa"
              />
            </Card>

            <Card
              title="Imagen de Portada"
              icon={<ImagePlus size={18} color="#b5000b" />}
            >
              <ImageUploadField
                name="heroImagenUrl"
                value={heroImagenUrl}
                onChange={setHeroImagenUrl}
                formats={["webp", "png", "jpg", "jpeg"]}
                resetTo="/banner.png"
                resetLabel="Restaurar por defecto"
                helperText="Se recomienda una imagen apaisada de al menos 1920px de ancho."
              />
            </Card>
          </div>

          {/* ── Nosotros ────────────────────────────────────────────── */}
          <div
            className={
              tab === "nosotros"
                ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                : "hidden"
            }
          >
            <Card
              title="Sección Nosotros"
              icon={<Building2 size={18} color="#b5000b" />}
            >
              <FormField
                label="Título"
                name="nosotrosTitulo"
                defaultValue={configuracion.nosotrosTitulo}
                rows={3}
                helperText="Cada salto de línea se respeta en la página"
              />
              <FormField
                label="Texto Descriptivo"
                name="nosotrosTexto"
                defaultValue={configuracion.nosotrosTexto}
                rows={6}
              />
            </Card>

            <Card
              title="Métricas Destacadas"
              icon={<Percent size={18} color="#b5000b" />}
            >
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  label="Métrica 1 — Valor"
                  name="nosotrosMetrica1Valor"
                  defaultValue={configuracion.nosotrosMetrica1Valor}
                  placeholder="5K"
                />
                <FormField
                  label="Métrica 1 — Sufijo"
                  name="nosotrosMetrica1Sufijo"
                  defaultValue={configuracion.nosotrosMetrica1Sufijo}
                  placeholder="+"
                />
              </div>
              <FormField
                label="Métrica 1 — Descripción"
                name="nosotrosMetrica1Label"
                defaultValue={configuracion.nosotrosMetrica1Label}
                placeholder="Relaciones Consolidadas"
              />

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-black/5">
                <FormField
                  label="Métrica 2 — Valor"
                  name="nosotrosMetrica2Valor"
                  defaultValue={configuracion.nosotrosMetrica2Valor}
                  placeholder="24"
                />
                <FormField
                  label="Métrica 2 — Sufijo"
                  name="nosotrosMetrica2Sufijo"
                  defaultValue={configuracion.nosotrosMetrica2Sufijo}
                  placeholder="/7"
                />
              </div>
              <FormField
                label="Métrica 2 — Descripción"
                name="nosotrosMetrica2Label"
                defaultValue={configuracion.nosotrosMetrica2Label}
                placeholder="Soporte de Ingeniería"
              />
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                El sufijo se muestra resaltado en rojo junto al valor.
              </p>
            </Card>
          </div>

          {/* ── Financiación ────────────────────────────────────────── */}
          <div
            className={
              tab === "financiacion"
                ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                : "hidden"
            }
          >
            <Card
              title="Textos de Financiación"
              icon={<Type size={18} color="#b5000b" />}
            >
              <FormField
                label="Volanta"
                name="finanEyebrow"
                defaultValue={configuracion.finanEyebrow}
                placeholder="Financial Services"
              />
              <FormField
                label="Título"
                name="finanTitulo"
                defaultValue={configuracion.finanTitulo}
                rows={2}
                helperText="Cada salto de línea se respeta en la página"
              />
              <FormField
                label="Texto Descriptivo"
                name="finanTexto"
                defaultValue={configuracion.finanTexto}
                rows={5}
              />
              <FormField
                label="Texto del Botón"
                name="finanCtaTexto"
                defaultValue={configuracion.finanCtaTexto}
                placeholder="Simular Crédito"
              />
            </Card>

            <Card
              title="Cifras Destacadas"
              icon={<Percent size={18} color="#b5000b" />}
            >
              <FormField
                label="Tasa Anual (%)"
                name="finanTasaAnual"
                type="number"
                defaultValue={configuracion.finanTasaAnual}
                placeholder="29"
                icon={<Percent size={16} />}
              />
              <FormField
                label="Entrega Mínima (%)"
                name="finanEntregaMinima"
                type="number"
                defaultValue={configuracion.finanEntregaMinima}
                placeholder="30"
                icon={<Percent size={16} />}
              />
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Si dejás una cifra vacía, deja de mostrarse en la página de
                inicio.
              </p>
            </Card>
          </div>

          {/* ── Consulta por Unidad ─────────────────────────────────── */}
          <div
            className={
              tab === "contacto"
                ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                : "hidden"
            }
          >
            <Card
              title="Consulta por Unidad"
              icon={<MessageCircle size={18} color="#b5000b" />}
            >
              <FormField
                label="Volanta"
                name="contactoEyebrow"
                defaultValue={configuracion.contactoEyebrow}
                placeholder="¿Te interesa?"
              />
              <FormField
                label="Título"
                name="contactoTitulo"
                defaultValue={configuracion.contactoTitulo}
                rows={2}
                helperText="Cada salto de línea se respeta en la página"
              />
              <FormField
                label="Texto Descriptivo"
                name="contactoTexto"
                defaultValue={configuracion.contactoTexto}
                rows={5}
                helperText="Escribí {concesionaria} donde quieras que aparezca el nombre cargado arriba"
              />
              <FormField
                label="Enlace a WhatsApp"
                name="contactoWhatsappTexto"
                defaultValue={configuracion.contactoWhatsappTexto}
                placeholder="O escribinos directo por WhatsApp"
              />
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Estos textos acompañan al formulario de consulta en la ficha de
                cada vehículo.
              </p>
            </Card>
          </div>

          {/* ── Pie y SEO ───────────────────────────────────────────── */}
          <div
            className={
              tab === "pie" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "hidden"
            }
          >
            <Card
              title="Pie de Página"
              icon={<Type size={18} color="#b5000b" />}
            >
              <FormField
                label="Texto del Pie"
                name="footerTexto"
                defaultValue={configuracion.footerTexto}
                rows={2}
                helperText="El año y la dirección se agregan automáticamente"
              />
              <FormField
                label="URL de Términos"
                name="terminosUrl"
                defaultValue={configuracion.terminosUrl}
                placeholder="/terminos"
              />
              <FormField
                label="URL de Privacidad"
                name="privacidadUrl"
                defaultValue={configuracion.privacidadUrl}
                placeholder="/privacidad"
              />
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Los enlaces legales se ocultan si no cargás una URL.
              </p>
            </Card>

            <Card
              title="SEO del Sitio"
              icon={<Globe size={18} color="#b5000b" />}
            >
              <FormField
                label="Título del Sitio"
                name="siteTitle"
                defaultValue={configuracion.siteTitle}
                helperText="Aparece en la pestaña del navegador y en los resultados de búsqueda"
                icon={<Globe size={16} />}
              />
              <FormField
                label="Descripción del Sitio"
                name="siteDescription"
                defaultValue={configuracion.siteDescription}
                rows={4}
                helperText="Se recomienda un texto de entre 120 y 160 caracteres"
              />
            </Card>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3 justify-end">
            <Link
              href="/dashboard"
              className="px-5 py-2.5 text-sm font-bold border border-[hsl(var(--border))] rounded text-[hsl(var(--foreground))] hover:bg-[hsl(var(--surface-low))] transition"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded bg-racing hover:opacity-90 transition disabled:opacity-60"
            >
              <Save size={18} />
              {isPending ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
