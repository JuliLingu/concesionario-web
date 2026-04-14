import Link from "next/link";
import { auth, signOut } from "@/auth";

export async function Header() {
  const session = await auth();

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl shadow-sm dark:shadow-none transition-all duration-300">
      <nav className="flex justify-between items-center px-8 py-4 max-w-full mx-auto" aria-label="Global">

        {/* Brand Logo */}
        <Link href="/">
          <span className="text-2xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-50 font-['Space_Grotesk']">
            JBJ<span className="text-primary italic">.</span>
          </span>
        </Link>

        {/* Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center gap-10 font-['Space_Grotesk'] tracking-tight">
          <Link href="/catalogo" className="text-zinc-600 dark:text-zinc-400 font-medium hover:text-primary transition-colors duration-300">
            Catálogo
          </Link>
          <Link href="#nosotros" className="text-zinc-600 dark:text-zinc-400 font-medium hover:text-primary transition-colors duration-300">
            Nosotros
          </Link>
          <Link href="#financiacion" className="text-zinc-600 dark:text-zinc-400 font-medium hover:text-primary transition-colors duration-300">
            Financiación
          </Link>
        </div>

        {/* Trailing Actions */}
        <div className="flex items-center gap-6 font-['Space_Grotesk']">
          {session ? (
            <div className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-zinc-600 dark:text-zinc-400 font-medium hover:text-primary transition-colors duration-300 border-r border-zinc-200 dark:border-zinc-800 pr-6"
              >
                Panel
              </Link>
              <form action={async () => {
                "use server";
                await signOut();
              }}>
                <button className="text-zinc-600 dark:text-zinc-400 font-bold tracking-tight hover:text-primary transition-colors duration-300">
                  Salir
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-primary text-white px-6 py-2.5 rounded-md font-bold tracking-tight scale-95 active:scale-90 transition-all hover:shadow-lg hover:shadow-primary/20"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>

      </nav>
    </header>
  );
}