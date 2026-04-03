import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  // 1. Limpiar datos existentes (Opcional, cuidado en producción)
  await prisma.vehiculo.deleteMany();
  await prisma.categoria.deleteMany();

  // 2. Crear Categorías
  const catAuto = await prisma.categoria.create({
    data: { nombre: "Auto", slug: "auto" },
  });
  const catSuv = await prisma.categoria.create({
    data: { nombre: "SUV", slug: "suv" },
  });

  // 3. Crear Vehículos de prueba
  await prisma.vehiculo.create({
    data: {
      marca: "Toyota",
      modelo: "Corolla",
      anio: 2023,
      version: "XEI",
      precio: 25000,
      moneda: "USD",
      kilometraje: 0,
      estado: "NUEVO",
      transmision: "AUTOMATICA",
      combustible: "NAFTA",
      categoriaId: catAuto.id,
      publicacion: "PUBLICADO",
      descripcion: "Toyota Corolla XEI 0km, listo para entregar.",
    },
  });

  console.log("Base de datos poblada con éxito.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });