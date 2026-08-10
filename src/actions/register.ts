"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { RegisterSchema } from "@/schemas/auth";
import { registrarError } from "@/lib/log";
import {
  REGLAS,
  esperaRestante,
  ipDelCliente,
  mensajeDeEspera,
  registrarIntento,
} from "@/lib/rate-limit";

/** Coste de bcrypt para las altas nuevas. Los hashes viejos se siguen validando. */
const RONDAS_BCRYPT = 12;

export const register = async (formData: FormData) => {
  const values = Object.fromEntries(formData.entries());
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    // El detalle importa: si no, quien se registra no sabe qué le falta a su
    // contraseña para cumplir la política.
    return { error: validatedFields.error.issues[0]?.message ?? "Campos inválidos" };
  }

  const clave = `registro:ip:${await ipDelCliente()}`;
  const espera = esperaRestante(clave, REGLAS.REGISTRO_POR_IP);
  if (espera > 0) {
    return { error: mensajeDeEspera(espera) };
  }
  registrarIntento(clave, REGLAS.REGISTRO_POR_IP);

  const { email, password, name } = validatedFields.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // Se responde con claridad que el correo ya existe. Ocultarlo protegería
    // contra la enumeración de cuentas, pero sin envío de correo no hay forma
    // de que la persona se entere de otro modo de que ya tiene una cuenta.
    // El cupo de altas por IP es lo que hace inviable el barrido masivo.
    if (existingUser) {
      return { error: "El email ya está en uso" };
    }

    const hashedPassword = await bcrypt.hash(password, RONDAS_BCRYPT);

    await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    return { success: "¡Usuario creado correctamente!" };
  } catch (error) {
    // El detalle queda en el log del servidor: el mensaje de Prisma incluye
    // host, tabla y restricción violada, que no deben llegar al navegador.
    registrarError("register", error);
    return { error: "Ocurrió un error al registrar el usuario" };
  }
};
