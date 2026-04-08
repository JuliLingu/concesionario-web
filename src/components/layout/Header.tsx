import Link from "next/link";
import { auth, signOut } from "@/auth";

export async function Header() {
  const session = await auth();

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-black text-blue-600 tracking-tighter"
        >
          CONCESIONARIO<span className="text-gray-900">WEB</span>
        </Link>
        <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-blue-600 transition">
            Inicio
          </Link>
          <Link href="/catalogo" className="hover:text-blue-600 transition">
            Vehículos
          </Link>
          <Link href="#contacto" className="hover:text-blue-600 transition">
            Contacto
          </Link>
        </div>

          {session ? (
            <>
              {session.user.role === "ADMIN" && (
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 transition"
                >
                  Dashboard
                </Link>
              )}
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition cursor-pointer">
                  Salir
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition"
            >
              Ingresar
            </Link>
          )}
        <div className="flex items-center gap-4">
        </div>
      </nav>
    </header>
  );
}
