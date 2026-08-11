import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const sslStatus =
  process.env.DATABASE_HOST === "localhost" ||
  process.env.DATABASE_HOST === "127.0.0.1"
    ? false
    : true;

/**
 * Puerto de la base. TiDB Cloud escucha en 4000; una instalación local de
 * MySQL o MariaDB, en 3306. Antes no se pasaba y el conector caía siempre en
 * su valor por defecto (3306), así que `DATABASE_PORT` estaba declarado en el
 * entorno pero no lo leía nadie: funcionaba de casualidad porque la pasarela
 * de TiDB también acepta 3306.
 */
const puerto = process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 3306;

/**
 * Conexiones simultáneas por instancia del proceso.
 *
 * El valor por defecto está pensado para serverless (Vercel), donde cada
 * función que arranca abre su propio pool y el total contra la base es este
 * número multiplicado por la cantidad de instancias vivas. Un pool grande ahí
 * no acelera nada y agota el cupo de conexiones de la base.
 *
 * En un despliegue con proceso persistente —un contenedor en un VPS— conviene
 * subirlo con `DATABASE_POOL_MAX`, porque ahí sí hay un único pool que se
 * reutiliza entre requests.
 */
const maximoDeConexiones = process.env.DATABASE_POOL_MAX
  ? Number(process.env.DATABASE_POOL_MAX)
  : 2;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaMariaDb({
      host: process.env.DATABASE_HOST,
      port: puerto,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      ssl: sslStatus ? { rejectUnauthorized: true } : false,
      connectionLimit: maximoDeConexiones,
      connectTimeout: 10000,
    }),
    log: ["error", "warn"],
  });

/**
 * El cliente se guarda en el global también en producción. En desarrollo evita
 * que cada recarga del hot reload deje atrás un pool huérfano; en serverless
 * cubre el caso de que el módulo se evalúe más de una vez dentro de la misma
 * instancia, que abriría un segundo pool contra la misma base sin que nadie lo
 * cierre. El global es por instancia, así que no comparte nada entre funciones.
 */
globalForPrisma.prisma = prisma;
