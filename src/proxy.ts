import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;
  const { nextUrl } = req;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isAuthRoute = ["/login", "/register"].includes(nextUrl.pathname);
  // Consideramos tanto /admin como /dashboard como rutas que requieren rol ADMIN
  const isAdminRoute =
    nextUrl.pathname.startsWith("/admin") ||
    nextUrl.pathname.startsWith("/dashboard");

  const isProtectedRoute = ["/dashboard", "/vehicles"].some((route) =>
    nextUrl.pathname.startsWith(route),
  );

  if (isApiAuthRoute) return NextResponse.next();

  // 1. .redirect
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  // 2. Lógica de ADMIN
  if (isAdminRoute) {
    if (!isLoggedIn) {
      const callbackUrl = nextUrl.pathname + nextUrl.search;
      return NextResponse.redirect(
        new URL(
          `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`,
          nextUrl,
        ),
      );
    }

    if (userRole !== "ADMIN") {
      // Si no es ADMIN, lo mandamos al inicio para evitar bucles en /dashboard
      return NextResponse.redirect(new URL("/", nextUrl));
    }

    return NextResponse.next();
  }

  // 3. Protección de rutas generales
  if (isProtectedRoute && !isLoggedIn) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, nextUrl),
    );
  }

  return NextResponse.next();
});
/**
 * Solo las rutas sobre las que este proxy realmente decide algo.
 *
 * Antes el matcher era `/((?!api|_next/static|_next/image|favicon.ico).*)`, que
 * hacía descifrar el JWT de sesión en cada request de la portada, del catálogo
 * y de cada ficha, para terminar siempre en `NextResponse.next()`. Las páginas
 * públicas no consultan nada de acá.
 *
 * La comprobación de rol no queda solo en manos de este archivo: cada página
 * del panel la repite con `requireAdmin()` (ver src/lib/sesion.ts).
 */
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/vehicles/:path*", "/login", "/register"],
};
