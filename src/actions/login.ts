"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { LoginSchema } from "@/schemas/auth";
import {
  REGLAS,
  esperaRestante,
  ipDelCliente,
  limpiarIntentos,
  mensajeDeEspera,
  registrarIntento,
} from "@/lib/rate-limit";

export const login = async (formData: FormData) => {
  const values = Object.fromEntries(formData.entries());
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Campos inválidos" };
  }

  const { email, password } = validatedFields.data;

  const claveIp = `login:ip:${await ipDelCliente()}`;
  const claveCuenta = `login:cuenta:${email.toLowerCase()}`;

  // Se consulta antes de tocar la base: un intento bloqueado no debe llegar a
  // ejecutar bcrypt, que es deliberadamente costoso.
  const espera = Math.max(
    esperaRestante(claveIp, REGLAS.LOGIN_POR_IP),
    esperaRestante(claveCuenta, REGLAS.LOGIN_POR_CUENTA),
  );
  if (espera > 0) {
    return { error: mensajeDeEspera(espera) };
  }

  // El cupo se consume acá, no al fallar. Si se descontara después de `signIn`,
  // una ráfaga simultánea pasaría entera el control de arriba antes de que la
  // primera petición llegara a registrar su fallo, que es justo la forma en que
  // se ataca por fuerza bruta. Entre la consulta y esta línea no hay ningún
  // await, así que el par es indivisible. Un inicio de sesión correcto lo
  // devuelve al limpiar el historial.
  registrarIntento(claveIp, REGLAS.LOGIN_POR_IP);
  registrarIntento(claveCuenta, REGLAS.LOGIN_POR_CUENTA);

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Credenciales inválidas" };
        default:
          return { error: "Algo salió mal" };
      }
    }

    // signIn lanza NEXT_REDIRECT cuando las credenciales son correctas: el
    // inicio de sesión salió bien, así que se devuelve lo consumido —también el
    // cupo por IP, para que quien entra y sale varias veces al día no se
    // bloquee a sí mismo— y se relanza para que Next haga la redirección.
    limpiarIntentos(claveCuenta);
    limpiarIntentos(claveIp);
    throw error;
  }
};
