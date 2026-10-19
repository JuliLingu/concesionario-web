/**
 * Marcas y modelos para autocompletar la tasación, y la forma de escribirlos.
 *
 * Con un campo de texto libre a la bandeja llegaban "vw", "VOLKSWAGEN",
 * "Volkswagen" y "Wolsvagen" para el mismo auto, y ni filtrar ni contar por
 * marca servía. Las sugerencias evitan la mayoría; `canonizarMarca` arregla lo
 * que se escribe igual a mano, en el navegador al salir del campo y otra vez
 * en el esquema, que es el que manda.
 *
 * El listado es el del mercado argentino de usados. No pretende ser completo:
 * una marca que no está se guarda tal cual se escribió.
 */

export const MODELOS_COMUNES: Record<string, string[]> = {
  "Alfa Romeo": ["Giulietta", "MiTo", "Stelvio"],
  Audi: ["A1", "A3", "A4", "A5", "Q2", "Q3", "Q5", "Q7"],
  BAIC: ["X25", "X35", "X55"],
  BMW: ["Serie 1", "Serie 3", "Serie 5", "X1", "X3", "X5"],
  BYD: ["Dolphin", "Dolphin Mini", "Song Pro", "Yuan Pro"],
  Chery: ["QQ", "Tiggo 2", "Tiggo 3", "Tiggo 4", "Tiggo 7"],
  Chevrolet: [
    "Agile", "Aveo", "Celta", "Classic", "Corsa", "Cruze", "Equinox", "Montana",
    "Onix", "Prisma", "S10", "Spin", "Tracker", "Trailblazer",
  ],
  Chrysler: ["300", "Town & Country"],
  Citroën: [
    "Berlingo", "C3", "C3 Aircross", "C4", "C4 Cactus", "C4 Lounge",
    "C5 Aircross", "Jumper",
  ],
  Dodge: ["Journey"],
  DS: ["DS3", "DS7"],
  Fiat: [
    "500", "Argo", "Cronos", "Fastback", "Fiorino", "Idea", "Mobi", "Palio",
    "Pulse", "Punto", "Siena", "Strada", "Toro", "Uno",
  ],
  Ford: [
    "Bronco Sport", "EcoSport", "Fiesta", "Focus", "Ka", "Kuga", "Maverick",
    "Mondeo", "Ranger", "Territory", "Transit",
  ],
  "Great Wall": ["Poer", "Wingle"],
  Haval: ["H6", "Jolion"],
  Honda: ["City", "Civic", "CR-V", "Fit", "HR-V", "WR-V"],
  Hyundai: ["Creta", "Elantra", "HB20", "i10", "Santa Fe", "Tucson"],
  Isuzu: ["D-Max"],
  Iveco: ["Daily"],
  JAC: ["S2", "T6", "T8"],
  Jeep: ["Commander", "Compass", "Grand Cherokee", "Renegade", "Wrangler"],
  Kia: ["Cerato", "Picanto", "Rio", "Seltos", "Sorento", "Sportage"],
  "Land Rover": ["Defender", "Discovery", "Evoque"],
  Lexus: ["NX", "RX"],
  "Mercedes-Benz": ["Clase A", "Clase C", "Clase E", "GLA", "GLC", "Sprinter", "Vito"],
  Mini: ["Cooper", "Countryman"],
  Mitsubishi: ["ASX", "L200", "Outlander"],
  Nissan: ["Frontier", "Kicks", "March", "Note", "Sentra", "Tiida", "Versa", "X-Trail"],
  Peugeot: ["206", "207", "208", "2008", "308", "3008", "408", "5008", "Expert", "Partner"],
  Porsche: ["Cayenne", "Macan"],
  RAM: ["1500", "2500", "Rampage"],
  Renault: [
    "Alaskan", "Captur", "Clio", "Duster", "Fluence", "Kangoo", "Koleos", "Kwid",
    "Logan", "Mégane", "Oroch", "Sandero", "Stepway", "Symbol",
  ],
  Subaru: ["Forester", "Outback", "XV"],
  Suzuki: ["Grand Vitara", "Jimny", "Swift", "Vitara"],
  Toyota: [
    "Camry", "Corolla", "Corolla Cross", "Etios", "Hiace", "Hilux", "RAV4", "SW4",
    "Yaris",
  ],
  Volkswagen: [
    "Amarok", "Bora", "Fox", "Gol", "Gol Trend", "Golf", "Nivus", "Polo",
    "Saveiro", "Suran", "T-Cross", "Taos", "Tiguan", "Up!", "Vento", "Virtus",
  ],
  Volvo: ["XC40", "XC60", "XC90"],
};

export const MARCAS_COMUNES = Object.keys(MODELOS_COMUNES);

/** Abreviaturas y apodos que la distancia de edición no alcanza a resolver. */
const ALIAS: Record<string, string> = {
  vw: "Volkswagen",
  volks: "Volkswagen",
  chevy: "Chevrolet",
  chevrolet: "Chevrolet",
  mercedes: "Mercedes-Benz",
  mb: "Mercedes-Benz",
  benz: "Mercedes-Benz",
  alfa: "Alfa Romeo",
  landrover: "Land Rover",
  greatwall: "Great Wall",
  gwm: "Great Wall",
  dodgeram: "RAM",
};

/** Clave de comparación: minúsculas, sin tildes ni nada que no sea letra o número. */
export function claveDeTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function distancia(a: string, b: string): number {
  const fila = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = fila[0];
    fila[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const arriba = fila[j];
      fila[j] = Math.min(
        fila[j] + 1,
        fila[j - 1] + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      diagonal = arriba;
    }
  }
  return fila[b.length];
}

/**
 * Errores de tipeo que se toleran según el largo. Las marcas cortas no se
 * corrigen por aproximación: "Kia" a una letra de distancia es "Mia" o "Ka", y
 * cambiarle la marca a alguien es peor que dejarla mal escrita.
 */
function toleranciaPara(largo: number): number {
  if (largo <= 4) return 0;
  if (largo <= 6) return 1;
  if (largo <= 8) return 2;
  return 3;
}

const CLAVES_DE_MARCAS = MARCAS_COMUNES.map((marca) => ({ marca, clave: claveDeTexto(marca) }));

/**
 * Forma correcta de una marca conocida: "vw" → "Volkswagen",
 * "wolsvagen" → "Volkswagen", "CITROEN" → "Citroën". Una marca que no está en
 * el listado, o que queda a la misma distancia de dos, vuelve como se escribió
 * (sin espacios de más).
 */
export function canonizarMarca(texto: string): string {
  const limpio = texto.trim().replace(/\s+/g, " ");
  const clave = claveDeTexto(limpio);
  if (!clave) return limpio;

  if (ALIAS[clave]) return ALIAS[clave];

  let mejor: string | null = null;
  let mejorDistancia = Infinity;
  let empate = false;
  for (const { marca, clave: claveMarca } of CLAVES_DE_MARCAS) {
    const d = distancia(clave, claveMarca);
    if (d < mejorDistancia) {
      mejor = marca;
      mejorDistancia = d;
      empate = false;
    } else if (d === mejorDistancia) {
      empate = true;
    }
  }

  if (mejor && !empate && mejorDistancia <= toleranciaPara(clave.length)) return mejor;
  return limpio;
}

/**
 * Forma correcta de un modelo conocido de esa marca, solo por coincidencia
 * exacta de la clave ("hilux", "HILUX" → "Hilux"; "tcross" → "T-Cross"). Los
 * modelos no se corrigen por aproximación: hay demasiados parecidos entre sí
 * ("208" y "2008", "C3" y "C4").
 */
export function canonizarModelo(marca: string, texto: string): string {
  const limpio = texto.trim().replace(/\s+/g, " ");
  const clave = claveDeTexto(limpio);
  const conocido = MODELOS_COMUNES[canonizarMarca(marca)]?.find(
    (modelo) => claveDeTexto(modelo) === clave,
  );
  return conocido ?? limpio;
}

export interface MarcaYModelo {
  marca: string;
  modelo: string;
}

/**
 * Sugerencias para el formulario: lo que hay en stock primero —es lo que el
 * concesionario conoce y suele tomar— y después el listado común, sin repetir.
 */
export function armarSugerencias(stock: MarcaYModelo[]): Record<string, string[]> {
  const resultado: Record<string, string[]> = {};
  const agregar = (marca: string, modelo: string) => {
    const lista = (resultado[marca] ??= []);
    const clave = claveDeTexto(modelo);
    if (clave && !lista.some((m) => claveDeTexto(m) === clave)) lista.push(modelo);
  };

  for (const { marca, modelo } of stock) {
    const canonica = canonizarMarca(marca);
    if (canonica) agregar(canonica, canonizarModelo(canonica, modelo));
  }
  for (const [marca, modelos] of Object.entries(MODELOS_COMUNES)) {
    resultado[marca] ??= [];
    for (const modelo of modelos) agregar(marca, modelo);
  }
  return resultado;
}
