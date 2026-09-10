"use client";

import { avisarMetrica } from "@/lib/metricas-cliente";

interface WhatsappLinkProps {
  href: string;
  /** Unidad por la que se consulta. El click se cuenta a su nombre. */
  vehiculoId: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Botón de WhatsApp de la ficha, que además cuenta el click.
 *
 * Es la única señal de intención que deja el visitante sin llenar un formulario,
 * y es la que separa "esta unidad se mira" de "esta unidad se pregunta". Sin
 * contarla, una publicación cuyo tráfico se va todo por WhatsApp parecería una
 * publicación que no le interesa a nadie.
 *
 * El aviso sale por `sendBeacon`, así que no compite con la navegación: el
 * enlace abre WhatsApp de inmediato y el conteo viaja igual.
 */
export const WhatsappLink = ({ href, vehiculoId, className, children }: WhatsappLinkProps) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className={className}
    onClick={() => avisarMetrica(vehiculoId, "whatsapp")}
  >
    {children}
  </a>
);
