import { prisma } from "../src/lib/prisma";

async function main() {
  const categorias = [
    { nombre: "Auto", slug: "auto" },
    { nombre: "Camioneta", slug: "camioneta" },
    { nombre: "SUV", slug: "suv" },
    { nombre: "Deportivo", slug: "deportivo" },
    { nombre: "Clásico", slug: "clasico" },
    { nombre: "Moto", slug: "moto" },
  ];

  console.log("Iniciando la carga de categorías por defecto...");

  for (const cat of categorias) {
    const categoria = await prisma.categoria.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        nombre: cat.nombre,
        slug: cat.slug,
      },
    });
    console.log(`Categoría habilitada: ${categoria.nombre}`);
  }

  console.log("Carga de categorías completada correctamente.");
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.error("Error al correr el seed:", e);
    process.exit(1);
  });