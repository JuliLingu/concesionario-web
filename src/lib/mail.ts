/**
 * Envío de correo saliente.
 *
 * El sitio manda un único tipo de correo: avisos internos al concesionario
 * cuando entra una consulta o una solicitud. No hay correo al visitante, así
 * que no hace falta plantillas ni un cliente completo — se habla directo con
 * la API HTTP de Resend con `fetch`.
 *
 * Que no haya dependencia nueva es deliberado: cada paquete que entra es un
 * paquete que hay que actualizar en cada instalación durante los años que dure
 * la licencia. Un `fetch` contra una API REST estable no se rompe solo.
 *
 * Todo el módulo está pensado para fallar en silencio. Un aviso que no sale no
 * puede tumbar el formulario del visitante: la consulta ya quedó guardada en la
 * base y visible en el panel, que es la fuente de verdad. El correo es una
 * comodidad, no el registro.
 */
import { registrarError } from "@/lib/log";

const ENDPOINT = "https://api.resend.com/emails";

/**
 * Corte de espera del envío.
 *
 * En serverless el trabajo diferido se paga: mientras esta petición siga
 * abierta, la invocación sigue viva. Diez segundos alcanzan de sobra para la
 * API y evitan que un proveedor caído deje la función colgada hasta el máximo
 * de la plataforma.
 */
const TIMEOUT_MS = 10_000;

export type Mensaje = {
  asunto: string;
  /** Cuerpo en texto plano. Es el único obligatorio: el HTML es opcional. */
  texto: string;
  html?: string;
  /**
   * Dirección a la que contesta el botón "Responder" del cliente de correo.
   * Se usa para poner ahí el email de quien consultó, así el concesionario le
   * responde directo desde la bandeja sin pasar por el panel.
   */
  responderA?: string;
};

/**
 * Si el envío está configurado.
 *
 * Sin credenciales el sitio funciona igual, solo que sin avisos. Es el estado
 * por defecto de una instalación recién desplegada, no un error: quien la pone
 * en marcha carga las variables cuando da de alta el dominio en Resend.
 */
export function mailConfigurado(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM);
}

/**
 * Destinatario de los avisos internos.
 *
 * `MAIL_TO` existe para poder desviar los avisos a una casilla de prueba
 * durante la puesta en marcha sin tocar los datos que ve el público. Si no
 * está, se usa el email de contacto que el administrador cargó en el panel,
 * que es lo que hace que una instalación nueva no necesite configuración
 * extra para que los avisos lleguen a donde tienen que llegar.
 */
export function destinatarioDeAvisos(emailDeConfiguracion: string): string | null {
  const destino = process.env.MAIL_TO?.trim() || emailDeConfiguracion.trim();
  return destino || null;
}

/**
 * Manda un correo. Devuelve si salió, nunca lanza.
 *
 * Quien llama no tiene nada que hacer con el fallo salvo registrarlo, y ya se
 * registra acá.
 */
export async function enviarMail(destino: string, mensaje: Mensaje): Promise<boolean> {
  if (!mailConfigurado()) return false;

  try {
    const respuesta = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM,
        to: [destino],
        subject: mensaje.asunto,
        text: mensaje.texto,
        ...(mensaje.html ? { html: mensaje.html } : {}),
        ...(mensaje.responderA ? { reply_to: mensaje.responderA } : {}),
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!respuesta.ok) {
      // El cuerpo del error de Resend trae el motivo (dominio sin verificar,
      // clave revocada) y no incluye el contenido del mensaje, así que es
      // seguro registrarlo y es lo único que permite diagnosticar a distancia.
      const detalle = await respuesta.text().catch(() => "");
      console.error(
        `[enviarMail] la API respondió ${respuesta.status}: ${detalle.slice(0, 200)}`,
      );
      return false;
    }

    return true;
  } catch (error) {
    registrarError("enviarMail", error);
    return false;
  }
}
