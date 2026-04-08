import { MapPin, Phone } from "lucide-react";

export function CompanyInfo() {
  return (
    <section id="contact" className="bg-white py-20 border-t">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-4xl font-black text-gray-900 mb-6 tracking-tight">Nuestra Empresa</h2>
          <p className="text-gray-600 leading-relaxed mb-6 text-lg">
            En <strong>Concesionario Web</strong>, no solo vendemos autos; construimos relaciones a largo plazo. 
            Contamos con un taller especializado propio y certificación de calidad en cada unidad que ingresa.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 rounded-lg text-blue-600"><MapPin size={24} /></div>
              <div>
                <h4 className="font-bold text-gray-900">Ubicación</h4>
                <p className="text-gray-600">Av. de los Incas 1234, CABA, Argentina</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 rounded-lg text-blue-600"><Phone size={24} /></div>
              <div>
                <h4 className="font-bold text-gray-900">Atención al cliente</h4>
                <p className="text-gray-600">+54 11 4567-8900 (Lun a Vie 9-19hs)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[400px] rounded-3xl overflow-hidden border-8 border-gray-100 shadow-2xl relative">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3285.218552991631!2d-58.4613291!3d-34.573351!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb59020000001%3A0x123456789!2sAv.%20de%20los%20Incas%201234!5e0!3m2!1ses!2sar!4v1710000000000!5m2!1ses!2sar" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy">
          </iframe>
        </div>
      </div>
    </section>
  );
}