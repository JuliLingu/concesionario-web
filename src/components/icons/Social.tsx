/**
 * Iconos de marca.
 *
 * lucide-react no incluye logos de redes sociales, así que van inline. Estaban
 * definidos dos veces —en el pie y en la pantalla de configuración— con el
 * mismo path pero distinta firma.
 */

interface IconoProps {
  size?: number;
  color?: string;
  className?: string;
}

const base = (size: number, color: string, className: string) => ({
  xmlns: "http://www.w3.org/2000/svg",
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: color,
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className,
});

export const Facebook = ({ size = 18, color = "currentColor", className = "" }: IconoProps) => (
  <svg {...base(size, color, className)}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3.64l.36-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export const Instagram = ({ size = 18, color = "currentColor", className = "" }: IconoProps) => (
  <svg {...base(size, color, className)}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
