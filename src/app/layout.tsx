import type { Metadata } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { auth } from "@/auth";
import { getConfiguracion } from "@/services/configuracion.service";
import { construirVariablesTema } from "@/lib/colores";
import { siteUrl } from "@/lib/site-url";


const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: '--font-space',
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: '--font-manrope',
});

export async function generateMetadata(): Promise<Metadata> {
  const configuracion = await getConfiguracion();

  return {
    // Base de todas las URLs relativas que se declaran más abajo en el árbol
    // (canónicas, og:url, og:image). Sin esto, una ruta relativa en cualquier
    // `generateMetadata` hijo rompe el build. Ver `lib/site-url.ts`.
    metadataBase: siteUrl(),
    title: {
      default: configuracion.siteTitle,
      // Cada ficha declara solo el nombre de la unidad y el nombre de la
      // concesionaria se lo agrega esta plantilla: así aparece en el resultado
      // de búsqueda sin repetirlo en cada página.
      template: `%s | ${configuracion.nombreConcesionaria}`,
    },
    description: configuracion.siteDescription,
    openGraph: {
      type: "website",
      siteName: configuracion.nombreConcesionaria,
      locale: "es_AR",
      title: configuracion.siteTitle,
      description: configuracion.siteDescription,
    },
    twitter: { card: "summary_large_image" },
    // Solo se declara si el administrador cargó uno. Ojo: un archivo
    // app/icon.* o app/favicon.ico tendría prioridad sobre esto.
    ...(configuracion.faviconUrl && {
      icons: {
        icon: configuracion.faviconUrl,
        apple: configuracion.faviconUrl,
      },
    }),
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ninguna depende de la otra: en serie eran dos viajes encadenados en el
  // camino crítico de todas las páginas.
  const [session, configuracion] = await Promise.all([auth(), getConfiguracion()]);

  // Al encabezado solo se le pasa lo que muestra. El objeto de sesión completo
  // viajaba serializado en el HTML de todas las páginas, incluido el correo.
  const usuario = session?.user
    ? {
        nombre: session.user.name ?? null,
        esAdmin: session.user.role === "ADMIN",
      }
    : null;

  // La paleta va como estilo inline en <html>: gana por especificidad sobre el
  // :root de globals.css, se hereda a todo el árbol y llega en el HTML del
  // servidor, así que no hay parpadeo con los colores por defecto.
  const tema = construirVariablesTema(configuracion) as React.CSSProperties;

  return (
    <html
      lang="es"
      className={`${spaceGrotesk.variable} ${manrope.variable}`}
      style={tema}
      data-scroll-behavior="smooth"
    >
      <body className={manrope.className}>
        <Header usuario={usuario} configuracion={configuracion} />
        <main>{children}</main>
        <Footer configuracion={configuracion} />
      </body>
    </html>
  );
}
