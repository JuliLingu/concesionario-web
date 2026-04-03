import Image from "next/image";
import { formatPrice } from "@/lib/utils"; // Asumiendo que crearás esta utilidad

interface VehicleCardProps {
  brand: string;
  model: string;
  year: number;
  price: number;
  image: string;
  mileage: number;
  transmission: string;
}

export const VehicleCard = ({
  brand,
  model,
  year,
  price,
  image,
  mileage,
  transmission
}: VehicleCardProps) => {
  return (
    <div className="group overflow-hidden rounded-2xl bg-white shadow-md border border-gray-100 hover:shadow-xl transition-all">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={image}
          alt={`${brand} ${model}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 leading-tight">{brand} {model}</h3>
          <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">{year}</span>
        </div>
        <p className="text-2xl font-black text-gray-900 mb-4">${price.toLocaleString()}</p>
        <div className="flex items-center gap-4 text-xs text-gray-500 font-medium uppercase tracking-wider">
          <span>{mileage.toLocaleString()} KM</span>
          <span>•</span>
          <span>{transmission}</span>
        </div>
      </div>
    </div>
  );
};