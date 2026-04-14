import type { Metadata } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: '--font-space',
});

const manrope = Manrope({ 
  subsets: ["latin"],
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  title: "JBJ Automotores | The Kinetic Gallery",
  description: "Una experiencia automotriz editorial y premium.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${spaceGrotesk.variable} ${manrope.variable}`}>
      <body className={manrope.className}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
