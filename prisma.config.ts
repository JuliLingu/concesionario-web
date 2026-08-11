// Configuración del CLI de Prisma. `dotenv` es la que pone `DATABASE_URL` a
// disposición de los comandos que sí necesitan conectarse (`db push`); en la
// aplicación no hace falta, porque Next carga el `.env` por su cuenta.
import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * El esquema se sincroniza con `prisma db push`: no hay directorio de
 * migraciones ni seed. Las categorías las da de alta el administrador desde
 * /dashboard/categorias, así que no hay datos iniciales que sembrar.
 *
 * Si el proyecto pasa a tener bases de clientes con datos reales, esto cambia:
 * ahí hace falta historial versionado de migraciones para poder evolucionar el
 * esquema sin arriesgar los datos, porque `db push` no sabe conservarlos.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
