"use client";

import { useCallback, useState } from "react";
import Image from "next/image";

interface LogoConcesionariaProps {
  /** Vacío significa "sin logo cargado": se muestra el respaldo directamente. */
  url: string;
  nombre: string;
  className?: string;
  /** El logo del encabezado está sobre el pliegue y conviene precargarlo. */
  prioridad?: boolean;
  /** El ícono por defecto, que cada lugar dibuja a su manera. */
  respaldo: React.ReactNode;
}

/**
 * El logo de la concesionaria, con vuelta atrás si la imagen no se puede cargar.
 *
 * El encabezado y el pie ya sabían qué dibujar sin logo, pero solo miraban si el
 * campo estaba vacío. Una URL cargada que dejó de resolver —la foto se borró de
 * Cloudinary, se renombró, se cambió de cuenta— no es un campo vacío: es un
 * campo lleno que ya no apunta a nada, y ahí el sitio mostraba el recuadro roto
 * del navegador en todas las páginas. Ahora ese caso cae en el mismo respaldo.
 *
 * La comprobación se hace por dos caminos porque uno solo no alcanza:
 *
 * - `onError` cubre la imagen que todavía se está descargando cuando React
 *   toma el control de la página.
 * - La función de referencia cubre la que ya falló antes de eso. El navegador
 *   empieza a pedir la imagen apenas lee el HTML, mucho antes de que llegue el
 *   JavaScript: si el error ocurrió en esa ventana, el evento ya pasó y nadie
 *   lo escuchó. Una imagen terminada con ancho cero es una imagen que falló.
 */
export function LogoConcesionaria({
  url,
  nombre,
  className,
  prioridad = false,
  respaldo,
}: LogoConcesionariaProps) {
  const [falló, setFalló] = useState(false);

  const comprobarSiYaFalló = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth === 0) setFalló(true);
  }, []);

  if (!url || falló) return <>{respaldo}</>;

  return (
    <Image
      ref={comprobarSiYaFalló}
      src={url}
      alt={nombre}
      width={120}
      height={32}
      priority={prioridad}
      className={className}
      onError={() => setFalló(true)}
    />
  );
}
