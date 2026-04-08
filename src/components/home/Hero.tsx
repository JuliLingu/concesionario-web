import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative bg-gray-900 py-24 px-6 text-center text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
          Encuentra el vehículo que <span className="text-blue-500">define tu estilo</span>
        </h1>
        <p className="text-xl text-gray-400 mb-10 font-medium">
          Más de 20 años brindando confianza, calidad y la mejor financiación del mercado.
        </p>
        <Link href="/catalog" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg inline-flex items-center gap-2 transition-all">
          Ver catálogo completo <ArrowRight size={20} />
        </Link>
      </div>
    </section>
  );
}