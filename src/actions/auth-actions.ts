"use server";

import { signOut } from "@/auth";

/**
 * Cierre de sesión desde el encabezado.
 *
 * Este archivo tenía además `loginAction`, `registerAction` y
 * `googleLoginAction`, que no llamaba ninguna pantalla: el login vive en
 * @/actions/login y el alta en @/actions/register. No eran código muerto
 * inofensivo — toda función exportada de un archivo "use server" queda
 * registrada como endpoint alcanzable— así que se eliminaron junto con el
 * Route Handler /api/auth/register, que duplicaba el alta una tercera vez.
 */
export async function handleSignOut() {
  await signOut({ redirectTo: "/" });
}
