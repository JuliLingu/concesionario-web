"use server";

import { createHash, randomUUID } from "crypto";
import { auth } from "@/auth";

/**
 * Credenciales de un solo uso para subir una imagen a Cloudinary.
 *
 * Antes el panel subía con un preset sin firmar cuyo nombre viajaba en el
 * bundle del navegador: cualquier visitante anónimo podía leerlo y subir lo
 * que quisiera a la cuenta. Ahora cada archivo necesita una firma que solo
 * emite el servidor, y solo si quien la pide es administrador.
 *
 * La firma cubre un `public_id` distinto por llamada, así que aunque alguien
 * interceptara una, únicamente le serviría para escribir ese destino concreto.
 */

/** Carpeta donde se agrupan las imágenes del sitio dentro de la cuenta. */
const CARPETA = "concesionario";

/** Extensiones que Cloudinary aceptará para esta subida. Va dentro de la firma. */
const FORMATOS_PERMITIDOS = "jpeg,jpg,png,webp";

export type CredencialesSubida = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  publicId: string;
  allowedFormats: string;
  signature: string;
};

/**
 * Firma al estilo Cloudinary: se toman los parámetros del cuerpo salvo `file`,
 * `cloud_name`, `resource_type` y `api_key`; se ordenan alfabéticamente como
 * `nombre=valor` unidos por `&`; se le pega el api_secret al final sin
 * separador y se hashea. SHA-1 es el algoritmo por defecto de los SDK
 * oficiales, y es el que Cloudinary valida sin configuración extra.
 */
function firmar(parametros: Record<string, string | number>, apiSecret: string) {
  const serializado = Object.keys(parametros)
    .sort()
    .map((clave) => `${clave}=${parametros[clave]}`)
    .join("&");

  return createHash("sha1").update(`${serializado}${apiSecret}`).digest("hex");
}

/**
 * Se discrimina por `ok` y no por la presencia de `error`: al cruzar el límite
 * de una server action, TypeScript no estrecha la unión por un campo opcional.
 */
export type ResultadoFirma =
  | { ok: true; credenciales: CredencialesSubida }
  | { ok: false; error: string };

export async function firmarSubida(): Promise<ResultadoFirma> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { ok: false, error: "No autorizado" };
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    // El api_secret nunca sale de acá; el cloud_name y el api_key sí, porque
    // el navegador los necesita para llamar a la API de subida.
    console.error("firmarSubida: faltan credenciales de Cloudinary en el entorno");
    return { ok: false, error: "El servicio de imágenes no está configurado" };
  }

  const timestamp = Math.round(Date.now() / 1000);
  const publicId = `${CARPETA}/${randomUUID()}`;

  const firmados = {
    allowed_formats: FORMATOS_PERMITIDOS,
    public_id: publicId,
    timestamp,
  };

  return {
    ok: true,
    credenciales: {
      cloudName,
      apiKey,
      timestamp,
      publicId,
      allowedFormats: FORMATOS_PERMITIDOS,
      signature: firmar(firmados, apiSecret),
    },
  };
}
