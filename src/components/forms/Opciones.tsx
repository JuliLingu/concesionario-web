import type { UseFormRegisterReturn } from "react-hook-form";

/**
 * Grupo de opciones excluyentes como botones, en vez de un `<select>`: con
 * tres o cuatro opciones se ven todas de una y se eligen con un toque, que en
 * el celular es lo que más pesa.
 *
 * Por dentro son radios de verdad (ocultos a la vista, no al teclado ni al
 * lector de pantalla), así que se registran en el formulario como cualquier
 * campo y se recorren con las flechas.
 */
export const Opciones = ({
  leyenda,
  opciones,
  registro,
  error,
  disabled,
}: {
  leyenda: string;
  opciones: { valor: string; etiqueta: string; detalle?: string }[];
  registro: UseFormRegisterReturn;
  error?: string;
  disabled?: boolean;
}) => (
  <fieldset className="flex flex-col gap-1.5" disabled={disabled}>
    <legend className="text-[10px] font-black uppercase tracking-[0.1em] text-[hsl(var(--muted-foreground))] px-1 mb-1.5">
      {leyenda}
    </legend>
    <div className="flex flex-wrap gap-2">
      {opciones.map((o) => (
        <label key={o.valor} className="cursor-pointer">
          <input type="radio" value={o.valor} {...registro} className="sr-only peer" />
          <span className="flex flex-col items-center rounded border border-black/10 bg-[hsl(var(--input))] px-4 py-2 text-sm font-bold transition peer-checked:border-[hsl(var(--primary))] peer-checked:bg-[hsl(var(--primary))]/10 peer-checked:text-[hsl(var(--primary))] peer-focus-visible:ring-2 peer-focus-visible:ring-[hsl(var(--primary))]/40">
            {o.etiqueta}
            {o.detalle && (
              <span className="text-[10px] font-medium text-[hsl(var(--muted-foreground))]">{o.detalle}</span>
            )}
          </span>
        </label>
      ))}
    </div>
    {error && (
      <span role="alert" className="text-xs font-bold text-red-500 px-1">
        {error}
      </span>
    )}
  </fieldset>
);
