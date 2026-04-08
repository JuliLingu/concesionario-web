export function Footer() {
  return (
    <footer id="contacto" className="bg-gray-50 border-t py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-gray-900 mb-4">Contacto Directo</h3>
          <p className="text-gray-600 text-sm">
            📞 Teléfono: <a href="tel:+541145678900" className="hover:underline font-semibold">+54 11 4567-8900</a>
          </p>
          <p className="text-gray-600 text-sm mt-2">
            ✉️ Email: <a href="mailto:contacto@concesionarioweb.com" className="hover:underline font-semibold">contacto@concesionarioweb.com</a>
          </p>
        </div>
        <div className="text-center md:text-right md:col-start-3">
          <p className="text-gray-400 text-xs">&copy; {new Date().getFullYear()} Concesionario Web. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}