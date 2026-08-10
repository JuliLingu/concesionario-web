"use server";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { registerSchema, loginSchema } from "@/lib/zod"; // Asegúrate de importar loginSchema
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signOut } from "@/auth";

export async function handleSignOut() {
  await signOut({ redirectTo: "/" });
}

// Definimos el tipo de respuesta para mantener consistencia
export type ActionState = {
  error?: string;
  success?: boolean;
};

export const loginAction = async (prevState: ActionState, formData: FormData): Promise<ActionState> => {
  // Extraemos los datos directamente del FormData aquí en el servidor
  const data = Object.fromEntries(formData);
  
  // Validamos con Zod antes de procesar
  const validated = loginSchema.safeParse(data);
  if (!validated.success) {
    return { error: "Datos inválidos" };
  }

  try {
    // redirect: false es importante para manejar errores manualmente aquí
    await signIn("credentials", { 
      email: validated.data.email, 
      password: validated.data.password, 
      redirect: false 
    });
    
    // Si no lanza error, el login fue exitoso. 
    // Nota: Normalmente signIn redirige, pero si usas redirect: false:
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
    return { error: "Datos inválidos. Revisa los campos." };
  }

  const { email, password, name } = validated.data;

  try {
    // Verificar conexión
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "El usuario ya existe" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: { email, name, password: hashedPassword, role: "USER" },
    });

    return { success: true };

  } catch (error: any) {
    return { error: "Error interno: " + error.message };
  }
};

export const googleLoginAction = async () => {
  await signIn("google", { redirectTo: "/dashboard" });
};