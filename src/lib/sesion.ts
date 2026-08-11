import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";

/**
 * Exige rol ADMIN para renderizar la página.
 *
 * Es redundante con el control de `proxy.ts`, y a propósito: el middleware
 * decide sobre la ruta, esto sobre los datos. Si mañana el matcher del proxy
 * cambia o una ruta nueva se olvida de incluirse, la página sigue protegida.
 *
 * Quien no tiene sesión ya fue desviado a /login por el middleware con su
 * callbackUrl, así que llegar acá sin ser ADMIN significa estar identificado
 * con otro rol: a esa persona la manda al inicio, no a un login que ya pasó.
 */
export async function requireAdmin(): Promise<Session> {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/");
  }

  return session;
}
