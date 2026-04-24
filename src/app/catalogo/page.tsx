import { prisma } from "@/lib/prisma";
import { VehicleCard } from "@/components/catalog/VehicleCard";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import { Transmision, Prisma } from "../../../generated/prisma";
import { auth } from "@/auth";

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  // Parse searchParams
  const marcasArray = await searchParams.marca
    ? Array.isArray(searchParams.marca)
      ? searchParams.marca
      : [searchParams.marca]
    : [];

  const transmisionRaw = searchParams.transmision as string | undefined;

  // Construir clausula 'where' para Prisma
  const where: Prisma.VehiculoWhereInput = {
    // Si NO es admin, solo publicamos BORRADOR? No, si no es admin, filtramos solo PUBLICADO.
    // Si es ADMIN, a futuro podría ver todos, pero ahora mantenemos PUBLICADO para simplificar.
    publicacion: isAdmin ? undefined : "PUBLICADO",
  };

  if (marcasArray.length > 0) {
    where.marca = { in: marcasArray };
  }

  if (transmisionRaw && Object.keys(Transmision).includes(transmisionRaw)) {
    where.transmision = transmisionRaw as Transmision;
  }

  // Fetch db
  const rawVehiculos = await prisma.vehiculo.findMany({
    where,
    include: {
      imagenes: {
        orderBy: { orden: "asc" }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  const vehiculos = rawVehiculos.map((v) => ({
    ...v,
    precio: Number(v.precio),
  }));

  // Extract distinct marcas for the filters
  const dbMarcasRows = await prisma.vehiculo.findMany({
    where: { publicacion: "PUBLICADO" },
    select: { marca: true },
    distinct: ["marca"]
  });
  const marcasDisponibles = dbMarcasRows.map((r) => r.marca).sort();

  let categorias: { id: string; nombre: string }[] = [];
  if (isAdmin) {
    categorias = await prisma.categoria.findMany({
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" }
    });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pt-32 pb-16">
      
      {/* Header Catalogo */}
      <div className="max-w-7xl mx-auto px-6 w-full mb-10">
         <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4 block">
            Galería de Stock
         </span>
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-5xl font-bold tracking-tighter text-foreground font-space mb-2">
                Nuestro Stock
              </h1>
              <p className="text-foreground/50 font-medium italic">
                Mostrando {vehiculos.length} vehículos disponibles para entrega inmediata.
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-surface-lowest shadow-sm border border-foreground/[0.05] p-2">
               <select className="bg-transparent text-[11px] font-black uppercase tracking-widest text-foreground outline-none border-r border-foreground/10 pr-4 mr-2 cursor-pointer">
                 <option>Novedades</option>
                 <option>Menor Precio</option>
                 <option>Mayor Precio</option>
               </select>
               <button className="p-2 text-primary bg-primary/5 rounded-sm"><LayoutGrid size={18} /></button>
               <button className="p-2 text-foreground/40 hover:text-foreground transition-all"><List size={18} /></button>
            </div>
         </div>
      </div>

      {/* Main Grid Layout */}
      <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-4 gap-10">
         
         {/* Lado Central (Filtros) */}
         <div className="lg:col-span-1">
            <CatalogFilters marcasDisponibles={marcasDisponibles} />
         </div>

         {/* Lado Derecho (Vehículos) */}
         <div className="lg:col-span-3">
            {vehiculos.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                 {vehiculos.map((v) => (
                   <VehicleCard 
                     key={v.id} 
                     vehiculo={v} 
                     isAdmin={isAdmin} 
                     categorias={categorias} 
                   />
                 ))}
               </div>
            ) : (
               <div className="py-20 text-center flex flex-col items-center justify-center bg-surface-low/50 border border-dashed border-foreground/10">
                 <p className="text-xl font-bold text-foreground mb-2 font-space">No se encontraron vehículos.</p>
                 <p className="text-sm text-foreground/60 mb-6 max-w-md">
                   Los filtros aplicados no coinciden con ninguna unidad en stock. Intenta despejar los filtros.
                 </p>
                 <Link href="/catalogo" className="text-[10px] bg-foreground text-white px-6 py-3 font-black uppercase tracking-widest hover:bg-primary transition-all">
                   Limpiar Búsqueda
                 </Link>
               </div>
            )}

            {/* Pagination Controls */}
            {vehiculos.length > 0 && (
              <div className="flex justify-center items-center gap-2 mt-16">
                 <button className="w-10 h-10 flex items-center justify-center text-foreground/40 hover:text-foreground hover:bg-surface-lowest transition-all">{"<"}</button>
                 <button className="w-10 h-10 flex items-center justify-center bg-primary text-white font-bold shadow-lg">1</button>
                 <button className="w-10 h-10 flex items-center justify-center text-foreground font-medium hover:bg-surface-lowest transition-all">2</button>
                 <button className="w-10 h-10 flex items-center justify-center text-foreground font-medium hover:bg-surface-lowest transition-all">3</button>
                 <button className="w-10 h-10 flex items-center justify-center text-foreground/40 hover:text-foreground hover:bg-surface-lowest transition-all">{">"}</button>
              </div>
            )}
         </div>

      </div>

      {/* Banner Inferior */}
      <div className="mt-24 bg-[#0a0a0b] py-20 px-6 relative overflow-hidden group">
         {/* Fondo decorativo que se asemeja al volante en la imagen */}
         <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 opacity-20 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(181,0,11,0.2)_0%,transparent_70%)] pointer-events-none group-hover:scale-105 transition-transform duration-1000" />
         
         <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-xl">
               <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white font-space mb-4">
                 ¿No encontrás lo que buscás?
               </h2>
               <p className="text-lg text-white/50 font-medium mb-8 leading-relaxed">
                 Nuestro equipo de importación personalizada se encarga de traer el vehículo de tus sueños directo a tu puerta.
               </p>
               <div className="flex flex-col sm:flex-row gap-4">
                 <Link href="#importacion" className="bg-primary text-white px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-primary transition-all text-center">
                   Nosotros lo traemos por vos 🚀
                 </Link>
                 <Link href="#asesor" className="bg-transparent border border-white/20 text-white px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all text-center">
                   Hablar con un asesor
                 </Link>
               </div>
            </div>
            <div className="hidden md:block">
               {/* Espacio para una imagen de rueda u volante oscuro como en el diseño */}
            </div>
         </div>
      </div>
      
    </div>
  );
}
