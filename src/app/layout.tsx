import type { Metadata } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { auth } from "@/auth";
import { getConfiguracion } from "@/services/configuracion.service";
import { construirVariablesTema } from "@/lib/colores";


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
    title: configuracion.siteTitle,
    description: configuracion.siteDescription,
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
  const session = await auth();
  const configuracion = await getConfiguracion();

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
        <Header session={session} configuracion={configuracion} />
        <main>{children}</main>
        <Footer configuracion={configuracion} />
      </body>
    </html>
  );
}
