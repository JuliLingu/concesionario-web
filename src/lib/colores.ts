/**
 * Paleta configurable del sitio.
 *
 * El administrador carga los colores como hex (#rrggbb) desde
 * /dashboard/settings, pero las hojas de estilo consumen las variables como
 * tripletas HSL sin la función `hsl()` — `hsl(var(--primary))`,
 * `hsl(var(--primary)/0.2)` —, así que hay que convertirlos antes de
 * inyectarlos en el layout.
 *
 * Solo se piden los seis colores que definen la identidad; el resto de la
 * escala (superficies, bordes, inputs) se deriva de ellos para que el
 * administrador no tenga que elegir doce colores coherentes entre sí.
 */

/** Formato aceptado en la base y en el formulario: hex de 6 dígitos. */
export const COLOR_HEX_REGEX = /^#[0-9a-fA-F]{6}$/;

type Hsl = { h: number; s: number; l: number };

/** Colores que el administrador edita, con la variable CSS que gobiernan. */
export const CAMPOS_COLOR = [
  "colorPrimario",
  "colorAcento",
  "colorFondo",
  "colorSuperficie",
  "colorTexto",
  "colorTextoSuave",
  "colorTextoSobrePrimario",
] as const;

export type CampoColor = (typeof CAMPOS_COLOR)[number];

/**
 * Valores por defecto: son exactamente los que declara `:root` en globals.css,
 * así el sitio se ve igual con la configuración vacía que con la configuración
 * recién guardada sin tocar nada.
 */
export const COLORES_DEFAULTS: Record<CampoColor, string> = {
  colorPrimario: "#b5000b",
  colorAcento: "#e30613",
  colorFondo: "#f9f9fc",
  colorSuperficie: "#ffffff",
  colorTexto: "#1a1c1e",
  colorTextoSuave: "#6d7379",
  colorTextoSobrePrimario: "#ffffff",
};

function clamp(valor: number, minimo: number, maximo: number) {
  return Math.min(maximo, Math.max(minimo, valor));
}

/** Convierte "#rrggbb" a HSL. Devuelve null si el texto no es un hex válido. */
export function hexAHsl(hex: string | null | undefined): Hsl | null {
  if (!hex || !COLOR_HEX_REGEX.test(hex.trim())) return null;

  const limpio = hex.trim().slice(1);
  const r = parseInt(limpio.slice(0, 2), 16) / 255;
  const g = parseInt(limpio.slice(2, 4), 16) / 255;
  const b = parseInt(limpio.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;

  if (delta === 0) return { h: 0, s: 0, l: l * 100 };

  const s = delta / (1 - Math.abs(2 * l - 1));

  let h: number;
  if (max === r) h = ((g - b) / delta) % 6;
  else if (max === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h *= 60;
  if (h < 0) h += 360;

  return { h, s: s * 100, l: l * 100 };
}

/** Tripleta lista para inyectar en una variable CSS: "356 100% 35%". */
function tripleta({ h, s, l }: Hsl) {
  return `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;
}

/**
 * Desplaza la luminosidad hacia el lado opuesto al que ya está el color.
 *
 * Sobre una paleta clara oscurece y sobre una oscura aclara, así los bordes y
 * las superficies derivadas siguen viéndose aunque el administrador elija un
 * fondo negro.
 */
function contrastar(color: Hsl, puntos: number): Hsl {
  const direccion = color.l > 50 ? -1 : 1;
  return { ...color, l: clamp(color.l + direccion * puntos, 0, 100) };
}

function resolver(hex: string | null | undefined, campo: CampoColor): Hsl {
  // El fallback nunca falla: COLORES_DEFAULTS solo tiene hex válidos.
  return hexAHsl(hex) ?? hexAHsl(COLORES_DEFAULTS[campo])!;
}

/** Los colores tal como llegan desde la configuración del sitio. */
export type ColoresConfig = Partial<Record<CampoColor, string | null>>;

/**
 * Traduce la paleta cargada por el administrador a las variables CSS que usa
 * todo el sitio. Se inyecta como estilo inline en `<html>`, que gana por
 * especificidad sobre el `:root` de globals.css.
 */
export function construirVariablesTema(
  colores: ColoresConfig,
): Record<string, string> {
  const primario = resolver(colores.colorPrimario, "colorPrimario");
  const acento = resolver(colores.colorAcento, "colorAcento");
  const fondo = resolver(colores.colorFondo, "colorFondo");
  const superficie = resolver(colores.colorSuperficie, "colorSuperficie");
  const texto = resolver(colores.colorTexto, "colorTexto");
  const textoSuave = resolver(colores.colorTextoSuave, "colorTextoSuave");
  const sobrePrimario = resolver(
    colores.colorTextoSobrePrimario,
    "colorTextoSobrePrimario",
  );

  return {
    "--primary": tripleta(primario),
    "--primary-foreground": tripleta(sobrePrimario),
    "--accent": tripleta(acento),
    "--accent-foreground": tripleta(sobrePrimario),
    "--ring": tripleta(primario),

    "--background": tripleta(fondo),
    "--foreground": tripleta(texto),

    "--card": tripleta(superficie),
    "--card-foreground": tripleta(texto),
    "--popover": tripleta(superficie),
    "--popover-foreground": tripleta(texto),

    "--surface-lowest": tripleta(superficie),
    "--surface-low": tripleta(contrastar(superficie, 4)),

    "--secondary": tripleta(contrastar(superficie, 4)),
    "--secondary-foreground": tripleta(texto),
    "--muted": tripleta(contrastar(superficie, 6)),
    "--muted-foreground": tripleta(textoSuave),

    "--border": tripleta(contrastar(superficie, 10)),
    "--input": tripleta(contrastar(superficie, 6)),
  };
}
