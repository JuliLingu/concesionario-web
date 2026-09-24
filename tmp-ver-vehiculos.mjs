import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "./generated/prisma/index.js";

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT ?? 4000),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    ssl: { rejectUnauthorized: true },
    connectionLimit: 1,
  }),
});

const filas = await prisma.vehiculo.findMany({
  where: { createdAt: { gte: new Date(Date.now() - 6 * 3600e3) } },
  orderBy: { createdAt: "asc" },
  select: { marca: true, modelo: true, anio: true, precio: true, moneda: true, kilometraje: true, combustible: true, transmision: true, estado: true, publicacion: true, categoria: { select: { nombre: true } } },
});
console.table(filas.map((f) => ({ ...f, precio: String(f.precio), categoria: f.categoria.nombre })));
await prisma.$disconnect();
