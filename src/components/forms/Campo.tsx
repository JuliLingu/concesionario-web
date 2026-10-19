/**
 * Campo de los formularios públicos: etiqueta visible, control y error.
 *
 * Antes cada formulario usaba el placeholder como etiqueta. Al empezar a
 * escribir el texto desaparece y no queda a la vista qué se estaba completando,
 * y los lectores de pantalla no siempre lo anuncian. La etiqueta envuelve al
 * control, así queda asociada sin tener que inventar ids.
 *
 * El error va fuera de la etiqueta a propósito: adentro pasaría a formar parte
 * del nombre del campo ("Email El email no es válido").
 */
export const Campo = ({
  label,
  error,
  ayuda,
  className = "",
  children,
}: {
  label: string;
  error?: string;
  /** Indicación de formato que tiene que seguir a la vista mientras se escribe. */
  ayuda?: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-black uppercase tracking-[0.1em] text-[hsl(var(--muted-foreground))] px-1">
        {label}
      </span>
      {children}
    </label>
    {error ? (
      <span role="alert" className="text-xs font-bold text-red-500 px-1">
        {error}
      </span>
    ) : (
      ayuda && <span className="text-xs text-[hsl(var(--muted-foreground))] px-1">{ayuda}</span>
    )}
  </div>
);

/** Ayuda común a todos los campos de teléfono. */
export const AYUDA_TELEFONO = "Código de área + número, sin el 0 ni el 15";

const FONDOS = {
  input: "bg-[hsl(var(--input))]",
  superficie: "bg-[hsl(var(--surface-low))]",
} as const;

/**
 * Clases del control. Los fondos van escritos enteros en `FONDOS` y no
 * interpolados: Tailwind lee el archivo como texto y no generaría una clase
 * armada en tiempo de ejecución.
 */
export function claseCampo({
  error = false,
  fondo = "superficie",
}: { error?: boolean; fondo?: keyof typeof FONDOS } = {}): string {
  return `${error ? "ring-1 ring-red-500 bg-red-50" : FONDOS[fondo]} px-4 py-3 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]/20 w-full disabled:opacity-50`;
}
