import Link from "next/link";
import { auth, signOut } from "@/auth";

export async function Header() {
  const session = await auth();

  return (
    <header className="fixed top-0 w-full z-50 glass-nav transition-all duration-300">
      <nav
        className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto"
        aria-label="Global"
      >
        {/* ── Brand Logo ── */}
        <Link href="/" className="flex items-center shrink-0">
          <span className="text-2xl font-black tracking-tighter text-foreground font-space">
            JBJ
          </span>
          <span className="text-2xl font-black tracking-tighter text-primary font-space">
            AUTO
          </span>
          <span className="text-2xl font-black tracking-tighter text-foreground font-space">
            MOTORES
          </span>
        </Link>

        {/* ── Navigation Links (Desktop) — includes Admin if logged in ── */}
        <div className="hidden md:flex items-center gap-8 font-space">
          <Link
            href="/catalogo"
            className="text-foreground/60 font-medium hover:text-primary transition-colors duration-300 text-sm uppercase tracking-widest"
          >
            Catálogo
          </Link>
          <Link
            href="#nosotros"
            className="text-foreground/60 font-medium hover:text-primary transition-colors duration-300 text-sm uppercase tracking-widest"
          >
            Nosotros
          </Link>
          <Link
            href="#financiacion"
            className="text-foreground/60 font-medium hover:text-primary transition-colors duration-300 text-sm uppercase tracking-widest"
          >
            Financiación
          </Link>

          {/* Administrador aparece en la nav junto al resto, solo si hay sesión */}
          {session && (
            <Link
              href="/dashboard"
              className="text-foreground/60 font-medium hover:text-primary transition-colors duration-300 text-sm uppercase tracking-widest"
            >
              Administrador
            </Link>
          )}
        </div>

        {/* ── Trailing: solo acción de sesión, separada ── */}
        <div className="flex items-center font-space">
          {session ? (
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <button className="bg-racing text-white px-6 py-2.5 text-[11px] font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20">
                Salir
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="bg-racing text-white px-6 py-2.5 text-[11px] font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}