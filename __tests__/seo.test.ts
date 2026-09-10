/**
 * Lo que el sitio le declara a un buscador.
 *
 * Estas pruebas cuidan dos cosas que no se ven en pantalla y que, si se
 * rompen, nadie nota hasta que el catálogo desaparece de Google.
 *
 * La primera es la coherencia entre el precio que muestra la ficha y el que
 * declara el JSON-LD: publicar un importe distinto del visible es una
 * violación de las políticas de datos estructurados, y cuesta el resultado
 * enriquecido de todo el dominio. La segunda es el caso de la concesionaria
 * que oculta los precios — ahí el bloque no puede filtrar por detrás lo que la
 * página se cuidó de no mostrar.
 */
import { beforeAll, describe, expect, it } from "vitest";
import {
  Combustible,
  EstadoPublicacion,
  EstadoVehiculo,
  Moneda,
  Transmision,
} from "../generated/prisma";
import {
  aJsonSeguro,
  descripcionVehiculo,
  jsonLdVehiculo,
  precioPublicado,
  tituloVehiculo,
  type ContextoSeo,
  type VehiculoSeo,
} from "@/lib/seo";

const SITIO = "https://autos-del-sur.com.ar";

beforeAll(() => {
  process.env.SITE_URL = SITIO;
});

const concesionaria = {
  nombreConcesionaria: "Autos del Sur",
  telefono: "+54 9 11 5555-5555",
  email: "ventas@autos-del-sur.com.ar",
  direccion: "Av. Siempreviva 742",
  facebookUrl: "",
  instagramUrl: "",
  logoUrl: "",
};

const vehiculo: VehiculoSeo = {
  id: "clx123",
  marca: "Toyota",
  modelo: "Hilux",
  anio: 2022,
  version: "SRX 4x4",
  estado: EstadoVehiculo.USADO,
  publicacion: EstadoPublicacion.PUBLICADO,
  precio: 30000,
  moneda: Moneda.USD,
  kilometraje: 45000,
  color: "Blanco",
  motor: "2.8 TDI",
  transmision: Transmision.AUTOMATICA,
  combustible: Combustible.DIESEL,
  puertas: 4,
  potencia: 204,
  descripcion: null,
  categoria: { nombre: "Pick-up" },
  imagenes: [{ url: "https://res.cloudinary.com/demo/image/upload/v1/hilux.jpg" }],
};

/** Con cotización cargada y precios a la vista: el caso habitual. */
const contexto: ContextoSeo = {
  concesionaria,
  mostrarPrecios: true,
  cotizacionDolar: 1200,
};

describe("título de la ficha", () => {
  it("incluye la versión, que es lo que distingue dos unidades del mismo modelo", () => {
    expect(tituloVehiculo(vehiculo)).toBe("Toyota Hilux SRX 4x4 2022");
  });

  it("se arregla sin versión en lugar de dejar un espacio doble", () => {
    expect(tituloVehiculo({ ...vehiculo, version: null })).toBe("Toyota Hilux 2022");
    expect(tituloVehiculo({ ...vehiculo, version: "   " })).toBe("Toyota Hilux 2022");
  });
});

describe("precio publicado", () => {
  it("convierte a pesos con la cotización cargada, igual que la ficha", () => {
    expect(precioPublicado(vehiculo, contexto)).toEqual({
      importe: 36_000_000,
      moneda: "ARS",
    });
  });

  it("se queda en dólares si no hay cotización, que es lo que muestra la ficha", () => {
    expect(precioPublicado(vehiculo, { ...contexto, cotizacionDolar: null })).toEqual({
      importe: 30000,
      moneda: "USD",
    });
  });

  it("no declara importe si la concesionaria oculta los precios", () => {
    expect(precioPublicado(vehiculo, { ...contexto, mostrarPrecios: false })).toBeNull();
  });
});

describe("descripción del resultado de búsqueda", () => {
  it("empieza por las especificaciones, que son lo que compara quien busca", () => {
    const descripcion = descripcionVehiculo(vehiculo, contexto);

    expect(descripcion).toContain("Toyota Hilux SRX 4x4 2022");
    expect(descripcion).toContain("45.000 km");
    expect(descripcion).toContain("Diésel");
    expect(descripcion).toContain("Automática");
  });

  it("con los precios ocultos tampoco los menciona", () => {
    const descripcion = descripcionVehiculo(vehiculo, {
      ...contexto,
      mostrarPrecios: false,
    });

    expect(descripcion).not.toContain("36.000.000");
    expect(descripcion).not.toContain("$");
  });

  it("no se pasa del largo que muestra Google ni corta una palabra al medio", () => {
    const descripcion = descripcionVehiculo(
      { ...vehiculo, descripcion: "Impecable. ".repeat(40) },
      contexto,
    );

    expect(descripcion.length).toBeLessThanOrEqual(160);
    expect(descripcion.endsWith("…")).toBe(true);
    expect(descripcion).not.toContain("Impecabl…");
  });
});

describe("datos estructurados de la unidad", () => {
  it("declara la unidad como Car con la URL absoluta de su ficha", () => {
    const datos = jsonLdVehiculo(vehiculo, contexto);

    expect(datos["@type"]).toBe("Car");
    expect(datos.url).toBe(`${SITIO}/catalogo/clx123`);
    expect(datos.brand).toEqual({ "@type": "Brand", name: "Toyota" });
    expect(datos.vehicleModelDate).toBe("2022");
    expect(datos.itemCondition).toBe("https://schema.org/UsedCondition");
  });

  it("declara el kilometraje en kilómetros y no en millas", () => {
    expect(jsonLdVehiculo(vehiculo, contexto).mileageFromOdometer).toEqual({
      "@type": "QuantitativeValue",
      value: 45000,
      unitCode: "KMT",
    });
  });

  it("publica el mismo importe y la misma moneda que muestra la ficha", () => {
    const offers = jsonLdVehiculo(vehiculo, contexto).offers as Record<string, unknown>;

    expect(offers.price).toBe(36_000_000);
    expect(offers.priceCurrency).toBe("ARS");
    expect(offers.availability).toBe("https://schema.org/InStock");
  });

  it("marca como vendida la unidad que ya se vendió", () => {
    const datos = jsonLdVehiculo(
      { ...vehiculo, publicacion: EstadoPublicacion.VENDIDO },
      contexto,
    );

    expect((datos.offers as Record<string, unknown>).availability).toBe(
      "https://schema.org/SoldOut",
    );
  });

  it("omite la oferta entera si la concesionaria oculta los precios", () => {
    const datos = jsonLdVehiculo(vehiculo, { ...contexto, mostrarPrecios: false });

    // Ni `offers` con precio en cero ni con el campo vacío: sin oferta. Una
    // oferta sin importe no es válida, y con importe filtraría el precio que
    // la ficha justamente no muestra.
    expect(datos.offers).toBeUndefined();
    expect(aJsonSeguro(datos)).not.toContain("30000");
  });

  it("no declara campos que la unidad no tiene cargados", () => {
    const datos = jsonLdVehiculo(
      { ...vehiculo, color: null, motor: null, potencia: null, puertas: null },
      contexto,
    );

    expect(datos.color).toBeUndefined();
    expect(datos.vehicleEngine).toBeUndefined();
    expect(datos.numberOfDoors).toBeUndefined();
  });
});

describe("serialización del bloque JSON-LD", () => {
  it("neutraliza una etiqueta de cierre cargada desde el panel", () => {
    const html = aJsonSeguro(
      jsonLdVehiculo(
        { ...vehiculo, descripcion: "</script><script>alert(1)</script>" },
        contexto,
      ),
    );

    // El bloque se inyecta con dangerouslySetInnerHTML: si el `<` sobreviviera,
    // el navegador cerraría el script acá y ejecutaría lo que viene después.
    expect(html).not.toContain("<");
    expect(html).toContain("\\u003c");
  });
});
