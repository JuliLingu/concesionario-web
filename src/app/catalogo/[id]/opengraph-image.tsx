import { ImageResponse } from "next/og";
import { getVehiculoPublicado } from "@/services/vehiculo.service";
import { getConfiguracion } from "@/services/configuracion.service";
import { getCldUrlOg } from "@/lib/cloudinary";
import { etiquetaEnum } from "@/lib/etiquetas";
import { formatNumeroAr } from "@/lib/precio";
import { precioPublicado, tituloVehiculo } from "@/lib/seo";

/**
 * La tarjeta que se ve cuando alguien comparte una unidad por WhatsApp o la
 * pega en Facebook. Es la primera impresión del catálogo fuera del sitio, y sin
 * esto lo que aparece es un rectángulo gris con la URL.
 *
 * Se arma en el servidor a partir de la foto principal, así que sigue a la
 * unidad: cambia la foto o el precio en el panel y la tarjeta cambia sola.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * El texto alternativo tiene que ser una constante del módulo, así que no puede
 * nombrar a la unidad. El nombre igual viaja en `og:title`, que es lo que lee
 * un lector de pantalla junto a la imagen.
 */
export const alt = "Vehículo en venta";

/**
 * Una hora, igual que el resto de las lecturas cacheadas del sitio.
 *
 * Sin esto la imagen se volvería a renderizar —y a descargar la foto de
 * Cloudinary— en cada visita de cada rastreador. La ruta no lee la sesión (ver
 * `getVehiculoPublicado`) justamente para poder cachearse.
 */
export const revalidate = 3600;

/** Las fichas sin foto caen a una tarjeta de texto sobre el color del sitio. */
function TarjetaDeTexto({
  titulo,
  subtitulo,
  fondo,
  texto,
  acento,
}: {
  titulo: string;
  subtitulo: string;
  fondo: string;
  texto: string;
  acento: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 80px",
        backgroundColor: fondo,
        color: texto,
      }}
    >
      <div style={{ width: 120, height: 10, backgroundColor: acento, marginBottom: 40 }} />
      <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>{titulo}</div>
      <div style={{ fontSize: 34, marginTop: 24, opacity: 0.7 }}>{subtitulo}</div>
    </div>
  );
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [vehiculo, configuracion] = await Promise.all([
    getVehiculoPublicado(id),
    getConfiguracion(),
  ]);

  // Un id inexistente, un borrador o una unidad dada de baja: la imagen no
  // puede fallar, porque la pide el mismo rastreador que va a mostrar el
  // enlace. Se devuelve la tarjeta genérica de la concesionaria.
  if (!vehiculo) {
    return new ImageResponse(
      (
        <TarjetaDeTexto
          titulo={configuracion.nombreConcesionaria}
          subtitulo="Catálogo de vehículos"
          fondo={configuracion.colorFondo}
          texto={configuracion.colorTexto}
          acento={configuracion.colorPrimario}
        />
      ),
      size,
    );
  }

  const titulo = tituloVehiculo(vehiculo);
  const precio = precioPublicado(vehiculo, {
    mostrarPrecios: configuracion.mostrarPrecios,
    cotizacionDolar: configuracion.cotizacionDolar,
  });

  const especificaciones = [
    `${formatNumeroAr(vehiculo.kilometraje)} km`,
    vehiculo.combustible ? etiquetaEnum(vehiculo.combustible) : null,
    vehiculo.transmision ? etiquetaEnum(vehiculo.transmision) : null,
  ].filter((valor): valor is string => valor !== null);

  const foto = vehiculo.imagenes[0]?.url;

  if (!foto) {
    return new ImageResponse(
      (
        <TarjetaDeTexto
          titulo={titulo}
          subtitulo={`${especificaciones.join(" · ")} — ${configuracion.nombreConcesionaria}`}
          fondo={configuracion.colorFondo}
          texto={configuracion.colorTexto}
          acento={configuracion.colorPrimario}
        />
      ),
      size,
    );
  }

  // Las medidas van en píxeles y no en porcentaje: el lienzo es fijo y conocido,
  // y el generador de imágenes no resuelve porcentajes contra el viewport como
  // lo haría un navegador.
  return new ImageResponse(
    (
      <div
        style={{
          width: size.width,
          height: size.height,
          display: "flex",
          position: "relative",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- Esto no es el
            DOM: lo renderiza el generador de imágenes, que no conoce next/image. */}
        <img
          src={getCldUrlOg(foto, size.width, size.height)}
          alt=""
          width={size.width}
          height={size.height}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size.width,
            height: size.height,
            objectFit: "cover",
          }}
        />

        {/* Velo oscuro de abajo hacia arriba: el texto tiene que leerse tanto
            sobre un auto blanco como sobre uno negro. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size.width,
            height: size.height,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 42%, rgba(0,0,0,0.05) 75%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: size.width,
            display: "flex",
            flexDirection: "column",
            padding: "0 64px 56px",
            color: "#ffffff",
          }}
        >
          <div
            style={{
              fontSize: 26,
              letterSpacing: 4,
              textTransform: "uppercase",
              opacity: 0.85,
              marginBottom: 14,
            }}
          >
            {configuracion.nombreConcesionaria}
          </div>

          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05 }}>{titulo}</div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 28 }}>
            {especificaciones.map((valor) => (
              <div
                key={valor}
                style={{
                  display: "flex",
                  fontSize: 28,
                  padding: "10px 22px",
                  borderRadius: 999,
                  backgroundColor: "rgba(255,255,255,0.16)",
                  border: "1px solid rgba(255,255,255,0.28)",
                }}
              >
                {valor}
              </div>
            ))}

            {/* Sin precio a la vista en el sitio, tampoco acá: la tarjeta se
                comparte por fuera y sería la filtración más fácil de todas. */}
            {precio && (
              <div
                style={{
                  display: "flex",
                  fontSize: 32,
                  fontWeight: 700,
                  padding: "10px 26px",
                  borderRadius: 999,
                  backgroundColor: configuracion.colorPrimario,
                  color: configuracion.colorTextoSobrePrimario,
                }}
              >
                {precio.moneda === "ARS" ? "$" : "US$"} {formatNumeroAr(precio.importe)}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
