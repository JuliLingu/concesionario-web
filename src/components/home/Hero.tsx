"use client";

import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <Image
        src="/banner.png"
        alt="Concesionario Banner"
        fill
        priority
        className="object-cover opacity-60"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />

      <div className="relative h-full flex flex-col justify-center items-center text-center z-10 max-w-7xl mx-auto px-4">
        <h1 className="text-5xl md:text-7xl lg:text-[7rem] font-black uppercase tracking-[-0.02em] text-white mb-4">
          KINETIC
        </h1>
        <p className="text-gray-300 font-light italic text-xl md:text-2xl mb-10">
          Ingeniería en Movimiento.
        </p>
        <Link
          href="/catalogo"
          className="bg-racing text-white px-10 py-4 text-base font-bold tracking-[0.1em] hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(181,0,11,0.4)] transition-all duration-300"
        >
          Ver Catálogo
        </Link>
      </div>
    </section>
  );
}