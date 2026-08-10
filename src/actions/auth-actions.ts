"use server";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { registerSchema, loginSchema } from "@/lib/zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signOut } from "@/auth";
import {
  REGLAS,
  esperaRestante,
  ipDelCliente,
  limpiarIntentos,
  mensajeDeEspera,
  registrarIntento,
} from "@/lib/rate-limit";
import { registrarError } from "@/lib/log";

/**
 * Ojo: `loginAction`, `registerAction` y `googleLoginAction` no las llama
 * ninguna pantalla — el login vive en @/actions/login y el alta en
 * @/actions/register. Siguen acá porque toda función exportada de un archivo
 * "use server" queda registrada como endpoint, así que se mantienen con los
 * mismos límites que sus equivalentes en uso. Lo correcto es eliminarlas.
 */

const RONDAS_BCRYPT = 12;

export async function handleSignOut() {
  await signOut({ redirectTo: "/" });
}

// Definimos el tipo de respuesta para mantener consistencia
export type ActionState = {
  error?: string;
  success?: boolean;
};

export const loginAction = async (prevState: ActionState, formData: FormData): Promise<ActionState> => {
  const data = Object.fromEntries(formData);

  const validated = loginSchema.safeParse(data);
  if (!validated.success) {
    return { error: "Datos inválidos" };
  }

  const claveIp = `login:ip:${await ipDelCliente()}`;
  const claveCuenta = `login:cuenta:${validated.data.email.toLowerCase()}`;

  const espera = Math.max(
    esperaRestante(claveIp, REGLAS.LOGIN_POR_IP),
    esperaRestante(claveCuenta, REGLAS.LOGIN_POR_CUENTA),
  );
  if (espera > 0) {
    return { error: mensajeDeEspera(espera) };
  }

  // Se consume antes de verificar, sin await de por medio: si no, una ráfaga
  // simultánea pasaría entera el control anterior. Se devuelve al acertar.
  registrarIntento(claveIp, REGLAS.LOGIN_POR_IP);
  registrarIntento(claveCuenta, REGLAS.LOGIN_POR_CUENTA);

  try {
    // redirect: false es importante para manejar errores manualmente aquí
    await signIn("credentials", {
      email: validated.data.email,
      password: validated.data.password,
      redirect: false,
    });

    limpiarIntentos(claveCuenta);
    limpiarIntentos(claveIp);
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Credenciales incorrectas" };
        default:
          return { error: "Error de autenticación" };
      }
    }
    // Auth.js lanza un error para redirigir, hay que relanzarlo si no es de auth
    throw error;
  }
};

export const registerAction = async (prevState: ActionState, formData: FormData): Promise<ActionState> => {

  const data = Object.fromEntries(formData);
  const validated = registerSchema.safeParse(data);

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Datos inválidos. Revisa los campos." };
  }

  const clave = `registro:ip:${await ipDelCliente()}`;
  const espera = esperaRestante(clave, REGLAS.REGISTRO_POR_IP);
  if (espera > 0) {
    return { error: mensajeDeEspera(espera) };
  }
  registrarIntento(clave, REGLAS.REGISTRO_POR_IP);

  const { email, password, name } = validated.data;

  try {
    // Verificar conexión
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "El usuario ya existe" };
    }

    const hashedPassword = await bcrypt.hash(password, RONDAS_BCRYPT);

    await prisma.user.create({
      data: { email, name, password: hashedPassword, role: "USER" },
    });

    return { success: true };

  } catch (error) {
    // Nunca devolver error.message: trae host, tabla y restricción violada.
    registrarError("registerAction", error);
    return { error: "No se pudo completar el registro." };
  }
};

export const googleLoginAction = async () => {
  await signIn("google", { redirectTo: "/dashboard" });
};
