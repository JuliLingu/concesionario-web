// Configuración del CLI de Prisma. `dotenv` es la que pone `DATABASE_URL` a
// disposición de los comandos que sí necesitan conectarse (`migrate`); en la
// aplicación no hace falta, porque Next carga el `.env` por su cuenta.
import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * El esquema se versiona con `prisma migrate`: cada cambio deja un archivo SQL
 * en `prisma/migrations` que se commitea junto al cambio del esquema.
 *
 * Esto reemplaza al `db push` que se usaba mientras el proyecto era uno solo.
 * `db push` compara el esquema contra la base y la lleva a esa forma como
 * puede, sin dejar rastro de qué hizo ni de en qué estado quedó cada base. Con
 * instalaciones de clientes distintas, cada una con datos reales adentro, eso
 * no sirve: hace falta saber qué migraciones corrió cada base y poder aplicar
 * solo las que faltan, que es exactamente lo que hace `migrate deploy`.
 *
 * No hay seed: las categorías las da de alta el administrador desde
 * /dashboard/categorias, así que no hay datos iniciales que sembrar.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
