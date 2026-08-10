import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RegisterSchema as registerSchema } from "@/schemas/auth";
import bcrypt from "bcryptjs";
import {
  REGLAS,
  esperaRestante,
  mensajeDeEspera,
  registrarIntento,
} from "@/lib/rate-limit";
import { registrarError } from "@/lib/log";

/**
 * Alta por API.
 *
 * A diferencia de una Server Action, un Route Handler no comprueba el origen
 * de la petición, así que la comprobación se hace a mano. Este endpoint
 * duplica lo que ya hace la acción de @/actions/register: si no hay un cliente
 * externo que lo necesite, lo correcto es eliminarlo.
 */
export async function POST(req: NextRequest) {
  const origen = req.headers.get("origin");
  if (origen && origen !== req.nextUrl.origin) {
    return NextResponse.json({ message: "Origen no permitido" }, { status: 403 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "ip-desconocida";
  const clave = `registro:ip:${ip}`;

  const espera = esperaRestante(clave, REGLAS.REGISTRO_POR_IP);
  if (espera > 0) {
    return NextResponse.json(
      { message: mensajeDeEspera(espera) },
      { status: 429, headers: { "Retry-After": String(espera) } },
    );
  }
  registrarIntento(clave, REGLAS.REGISTRO_POR_IP);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { message: "Ya existe una cuenta con ese email" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    return NextResponse.json({ message: "ok" }, { status: 201 });
  } catch (error) {
    registrarError("POST /api/auth/register", error);
    return NextResponse.json({ message: "No se pudo completar el registro" }, { status: 500 });
  }
}
