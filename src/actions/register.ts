"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { RegisterSchema } from "@/schemas/auth";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Campos inválidos" };
  }

  const { email, password, name } = validatedFields.data;
  
  // Encriptar la contraseña (asegúrate de que el campo password en el schema.prisma sea String?)
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Verificar si el correo ya está registrado
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "El email ya está en uso" };
    }

    // Crear el usuario en la base de datos
    await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    return { success: "¡Usuario creado correctamente!" };
  } catch (error) {
    return { error: "Ocurrió un error al registrar el usuario" };
  }
};