import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { LoginSchema } from "@/schemas/auth";
import { registrarError } from "@/lib/log";
import bcrypt from "bcryptjs";

/**
 * Cada cuánto se vuelve a leer el rol desde la base, en milisegundos.
 *
 * El rol viaja dentro del JWT, así que sin esto un ADMIN degradado conservaría
 * sus permisos hasta que venciera el token. Releerlo en cada request sería una
 * consulta por navegación; cinco minutos acota la ventana sin ese coste.
 */
const REVALIDAR_ROL_CADA = 5 * 60 * 1000;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // El `as any` salva la incompatibilidad de tipos entre el cliente de Prisma 7
  // y @auth/prisma-adapter, que todavía espera la forma de Prisma 5. Es un
  // parche, no una decisión: al actualizar el adaptador hay que quitarlo y
  // comprobar que los tipos cierran, porque acá es donde se escriben cuentas y
  // sesiones y es justo donde no conviene tener el chequeo apagado.
  adapter: PrismaAdapter(prisma as any),
  // 8 horas de vida, renovadas mientras se use el panel. Antes eran los 30
  // días por defecto, que es mucho para una sesión con permisos de administrar
  // el sitio entero.
  session: { strategy: "jwt", maxAge: 8 * 60 * 60, updateAge: 15 * 60 },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      // Sin allowDangerousEmailAccountLinking: vincular automáticamente por
      // coincidencia de correo permite entrar a una cuenta existente sin
      // conocer su contraseña. El enlace se autoriza en el callback signIn,
      // que exige que Google haya verificado la dirección.
    }),
    Credentials({
      authorize: async (credentials) => {
        const { email, password } = await LoginSchema.parseAsync(credentials);

        const user = await prisma.user.findUnique({ where: { email } });
        // Verificamos si tiene password (si entró con Google antes, no tendrá password)
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,

    /** Solo se acepta el alta por Google si la dirección viene verificada. */
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        return Boolean((profile as { email_verified?: boolean } | undefined)?.email_verified);
      }
      return true;
    },

    async jwt({ token, user }) {
      // En el login el rol llega del proveedor y no hace falta consultar nada.
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.telefono = (user as any).telefono;
        token.image = (user as any).image;
        token.rolVerificadoEn = Date.now();
        return token;
      }

      // Un token sin identidad no se puede contrastar contra nada, así que no
      // debe dar acceso: sin esto la consulta de abajo fallaría y el catch lo
      // daría por bueno, dejando el rol sin revalidar para siempre.
      if (typeof token.id !== "string" || token.id.length === 0) return null;

      const verificadoEn = (token.rolVerificadoEn as number | undefined) ?? 0;
      if (Date.now() - verificadoEn < REVALIDAR_ROL_CADA) return token;

      try {
        const actual = await prisma.user.findUnique({
          where: { id: token.id },
          select: { role: true },
        });

        // Cuenta eliminada: se invalida la sesión.
        if (!actual) return null;

        token.role = actual.role;
        token.rolVerificadoEn = Date.now();
      } catch (error) {
        // Si la base no responde se conserva el token vigente: cerrar la sesión
        // de todo el mundo no haría más seguro un sitio que, sin base, ya no
        // puede administrarse. Se reintenta en la request siguiente.
        registrarError("jwt: no se pudo revalidar el rol", error);
      }

      return token;
    },
  },
});
