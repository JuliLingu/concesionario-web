import { aJsonSeguro } from "@/lib/seo";

/**
 * Bloque de datos estructurados de la página.
 *
 * No renderiza nada visible: es el JSON-LD que lee el buscador. Va como
 * componente y no como `<script>` suelto en cada página para que la
 * serialización pase siempre por `aJsonSeguro()`, que es lo que impide que un
 * texto cargado desde el panel cierre la etiqueta.
 *
 * `type="application/ld+json"` no es JavaScript ejecutable, así que la
 * directiva `script-src` de la política de seguridad no lo bloquea.
 */
export function JsonLd({ datos }: { datos: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: aJsonSeguro(datos) }}
    />
  );
}
