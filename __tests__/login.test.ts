/**
 * Flujo crítico: el administrador inicia sesión.
 *
 * Es la única puerta al panel y el único usuario que vale la pena atacar, así
 * que lo que se protege es el limitador: que consuma cupo antes de llegar a
 * bcrypt, que el cupo por cuenta no se pueda esquivar cambiando de origen, y
 * que un inicio de sesión correcto devuelva lo consumido para que nadie se
 * bloquee a sí mismo entrando y saliendo.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthError } from "next-auth";
import { emailUnico, ipUnica, type ResultadoAccion } from "./helpers/entorno";

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  ip: "10.0.0.0",
}));

vi.mock("@/auth", () => ({ signIn: mocks.signIn }));

/**
 * `next-auth` se importa de verdad acá, porque el login discrimina con
 * `instanceof AuthError` y un doble no pasaría esa comprobación. Al cargarlo,
 * arrastra `next/server`, que fuera de un servidor de Next no resuelve. Se
 * reemplaza por lo mínimo: nada de esto se usa en el login.
 */
vi.mock("next/server", () => ({}));

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": mocks.ip }),
}));

import { login } from "@/actions/login";

/** El error que lanza Auth.js cuando la contraseña no coincide. */
class CredencialesInvalidas extends AuthError {
  type = "CredentialsSignin" as const;
}

/**
 * Lo que lanza `signIn` cuando las credenciales SON correctas: la redirección
 * de Next viaja como excepción, así que el camino feliz del login es un throw.
 */
const REDIRECCION = Object.assign(new Error("NEXT_REDIRECT"), {
  digest: "NEXT_REDIRECT;push;/dashboard;",
});

function formulario(email: string, password = "unaClaveLarga1"): FormData {
  const datos = new FormData();
  datos.set("email", email);
  datos.set("password", password);
  return datos;
}

const entrar = (datos: FormData) => login(datos) as Promise<ResultadoAccion | undefined>;

beforeEach(() => {
  mocks.ip = ipUnica();
});

describe("login", () => {
  it("rechaza campos inválidos sin llamar a Auth.js", async () => {
    const resultado = await entrar(formulario("no-es-un-email"));

    expect(resultado?.error).toBe("Campos inválidos");
    expect(mocks.signIn).not.toHaveBeenCalled();
  });

  it("traduce las credenciales inválidas a un mensaje del formulario", async () => {
    mocks.signIn.mockRejectedValue(new CredencialesInvalidas());

    const resultado = await entrar(formulario(emailUnico()));

    expect(resultado?.error).toBe("Credenciales inválidas");
  });

  it("relanza la redirección cuando las credenciales son correctas", async () => {
    mocks.signIn.mockRejectedValue(REDIRECCION);

    await expect(entrar(formulario(emailUnico()))).rejects.toThrow("NEXT_REDIRECT");
  });

  it("bloquea la cuenta al sexto intento fallido", async () => {
    mocks.signIn.mockRejectedValue(new CredencialesInvalidas());
    const email = emailUnico();

    for (let intento = 0; intento < 5; intento += 1) {
      const resultado = await entrar(formulario(email));
      expect(resultado?.error).toBe("Credenciales inválidas");
    }

    const sexto = await entrar(formulario(email));

    expect(sexto?.error).toMatch(/demasiados intentos/i);
    // Lo que importa: el sexto no llegó a ejecutar bcrypt.
    expect(mocks.signIn).toHaveBeenCalledTimes(5);
  });

  it("el cupo por cuenta no se esquiva cambiando de origen", async () => {
    mocks.signIn.mockRejectedValue(new CredencialesInvalidas());
    const email = emailUnico();

    for (let intento = 0; intento < 5; intento += 1) {
      mocks.ip = ipUnica();
      await entrar(formulario(email));
    }

    mocks.ip = ipUnica();
    const sexto = await entrar(formulario(email));

    expect(sexto?.error).toMatch(/demasiados intentos/i);
  });

  it("el cupo por cuenta no distingue mayúsculas", async () => {
    mocks.signIn.mockRejectedValue(new CredencialesInvalidas());
    const email = emailUnico();

    for (let intento = 0; intento < 5; intento += 1) {
      await entrar(formulario(email));
    }

    const conMayusculas = await entrar(formulario(email.toUpperCase()));

    expect(conMayusculas?.error).toMatch(/demasiados intentos/i);
  });

  it("un inicio de sesión correcto devuelve el cupo consumido", async () => {
    const email = emailUnico();

    mocks.signIn.mockRejectedValue(new CredencialesInvalidas());
    for (let intento = 0; intento < 4; intento += 1) {
      await entrar(formulario(email));
    }

    // Quinto intento, esta vez con la contraseña correcta.
    mocks.signIn.mockRejectedValue(REDIRECCION);
    await expect(entrar(formulario(email))).rejects.toThrow("NEXT_REDIRECT");

    // Si el historial no se hubiera limpiado, el que sigue quedaría bloqueado.
    mocks.signIn.mockRejectedValue(new CredencialesInvalidas());
    const siguiente = await entrar(formulario(email));

    expect(siguiente?.error).toBe("Credenciales inválidas");
  });
});
