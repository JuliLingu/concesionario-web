"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Search, Sparkles, X } from "lucide-react";
import {
  LARGO_MAXIMO_BUSQUEDA,
  LARGO_MAXIMO_BUSQUEDA_IA,
  textoDeBusqueda,
  textoDeBusquedaIa,
} from "@/lib/busqueda";

/**
 * Cuadro de búsqueda del catálogo.
 *
 * La búsqueda vive en la URL como el resto de los filtros, así que se
 * comparte, se marca y vuelve con el botón de atrás. Se navega con `replace` y
 * no con `push` para no dejar una entrada en el historial por cada tecla: quien
 * escribe "amarok" y aprieta atrás quiere volver de donde vino, no ver "amaro",
 * "amar", "ama".
 *
 * Tiene dos modos, que escriben en parámetros distintos y se excluyen:
 * - Texto (`?q=`): busca solo al dejar de escribir, contra marca, modelo y año.
 * - Inteligente (`?ia=`): una frase en lenguaje natural que interpreta un
 *   modelo. Busca solo con Enter o el botón, nunca con el temporizador: cada
 *   búsqueda se paga, y una frase a medio escribir no significa nada.
 *
 * El input no es controlado a propósito. La fuente de verdad es la URL, y entre
 * que alguien escribe y que el servidor responde hay un rato en el que las
 * props todavía dicen lo de antes; con un `value` atado a ellas, cada respuesta
 * llegaría a destiempo a pisar lo que se está tipeando. Así el DOM manda
 * mientras se escribe y solo se lo corrige cuando la URL cambia por fuera de
 * este cuadro —el botón de atrás, o el enlace que limpia la búsqueda desde la
 * grilla vacía—.
 */

/**
 * Milisegundos de quietud antes de disparar la consulta. Cada navegación es un
 * viaje al servidor y una consulta a la base; a 350 ms una palabra escrita de
 * corrido produce una sola.
 */
const ESPERA_MS = 350;

type Modo = "texto" | "ia";

const PARAMETRO: Record<Modo, string> = { texto: "q", ia: "ia" };
const NORMALIZAR: Record<Modo, (valor: string) => string> = {
  texto: textoDeBusqueda,
  ia: textoDeBusquedaIa,
};

/** Clave de lo que hay en la URL: mismo texto en otro modo es otra búsqueda. */
const clave = (modo: Modo, texto: string) => `${modo}:${texto}`;

export const CatalogSearch = ({
  busqueda,
  busquedaIa,
  iaDisponible,
}: {
  busqueda: string;
  busquedaIa: string;
  /** Sin servicio configurado el cuadro es el de siempre, sin el botón de modo. */
  iaDisponible: boolean;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const modoEnUrl: Modo = busquedaIa ? "ia" : "texto";
  const textoEnUrl = busquedaIa || busqueda;
  const claveEnUrl = clave(modoEnUrl, textoEnUrl);

  /**
   * El modo lo impone la URL cuando trae una búsqueda. El botón de modo lo
   * cambia sin navegar, así que la elección se anota junto con la URL en la que
   * se hizo: vale mientras la URL siga igual (o quede sin búsqueda), y una
   * búsqueda que llega de afuera —el botón de atrás— vuelve a mandar.
   */
  const [eleccion, setEleccion] = useState<{ modo: Modo; claveEnUrl: string } | null>(null);
  const modo: Modo =
    eleccion && (eleccion.claveEnUrl === claveEnUrl || !textoEnUrl)
      ? eleccion.modo
      : textoEnUrl
        ? modoEnUrl
        : "texto";

  const input = useRef<HTMLInputElement>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Lo último que pusimos nosotros en la URL; distingue nuestros cambios de los de afuera. */
  const enviado = useRef(claveEnUrl);

  const buscar = (modoDeBusqueda: Modo, valor: string) => {
    if (temporizador.current) clearTimeout(temporizador.current);

    // Se normaliza con la misma función que usa el servidor: así lo que vuelve
    // por las props coincide con lo anotado en `enviado` y la sincronización
    // de abajo no confunde nuestra propia navegación con una externa.
    const normalizado = NORMALIZAR[modoDeBusqueda](valor);
    const nueva = clave(modoDeBusqueda, normalizado);
    if (nueva === enviado.current) return;
    enviado.current = nueva;

    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("ia");
    if (normalizado) params.set(PARAMETRO[modoDeBusqueda], normalizado);
    // La página 4 de otra búsqueda no significa nada en esta: se vuelve a la 1.
    params.delete("page");

    const qs = params.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname));
  };

  /** En modo texto busca sola al dejar de escribir; no hace falta apretar nada. */
  const programarBusqueda = (valor: string) => {
    if (modo !== "texto") return;
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => buscar("texto", valor), ESPERA_MS);
  };

  const cambiarModo = () => {
    const nuevo: Modo = modo === "ia" ? "texto" : "ia";
    setEleccion({ modo: nuevo, claveEnUrl });
    // Al volver a texto se busca lo escrito, como si se hubiera tipeado. Al
    // pasar a inteligente no: se espera el Enter, que es lo que se cobra.
    if (nuevo === "texto") buscar("texto", input.current?.value ?? "");
    input.current?.focus();
  };

  // La URL cambió por fuera del cuadro: el input se pone al día. El efecto solo
  // corre cuando la búsqueda de la URL cambia de valor, así que la navegación
  // propia —que todavía la deja en lo de antes mientras está en curso— no lo
  // despierta.
  useEffect(() => {
    if (claveEnUrl !== enviado.current) {
      enviado.current = claveEnUrl;
      if (input.current) input.current.value = textoEnUrl;
    }
  }, [claveEnUrl, textoEnUrl]);

  // Un temporizador pendiente al desmontar dispararía una navegación sobre una
  // pantalla que ya no está.
  useEffect(() => () => {
    if (temporizador.current) clearTimeout(temporizador.current);
  }, []);

  const esIa = modo === "ia";

  return (
    <form
      role="search"
      // Enter no espera el temporizador. `preventDefault` evita además la
      // recarga completa que haría el navegador con un form sin action.
      onSubmit={(e) => {
        e.preventDefault();
        buscar(modo, input.current?.value ?? "");
      }}
      className={`flex items-center gap-2 bg-[hsl(var(--card))] border rounded px-3 py-1.5 w-full transition-[opacity,width] duration-200 ${
        esIa ? "md:w-[26rem] border-[hsl(var(--primary)/0.4)]" : "md:w-80 border-black/5"
      } ${isPending ? "opacity-60" : "opacity-100"}`}
    >
      {esIa ? (
        <Sparkles size={14} className="text-[hsl(var(--primary))] shrink-0" aria-hidden="true" />
      ) : (
        <Search size={14} className="text-[hsl(var(--primary))] shrink-0" aria-hidden="true" />
      )}
      <input
        ref={input}
        type="search"
        name={PARAMETRO[modo]}
        defaultValue={textoEnUrl}
        onChange={(e) => programarBusqueda(e.target.value)}
        maxLength={esIa ? LARGO_MAXIMO_BUSQUEDA_IA : LARGO_MAXIMO_BUSQUEDA}
        aria-label={esIa ? "Describí el vehículo que buscás" : "Buscar en el catálogo"}
        placeholder={esIa ? "Ej.: SUV automática familiar hasta 45 millones" : "Marca, modelo, versión o año"}
        autoComplete="off"
        enterKeyHint="search"
        // La cruz nativa de `type="search"` duplicaría el botón de al lado.
        className="peer bg-transparent text-[13px] font-medium text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] placeholder:font-normal outline-none w-full [&::-webkit-search-cancel-button]:appearance-none"
      />
      <button
        type="button"
        aria-label="Limpiar búsqueda"
        onClick={() => {
          if (input.current) input.current.value = "";
          buscar(modo, "");
          input.current?.focus();
        }}
        // Con el campo vacío está el placeholder a la vista y no hay nada que
        // limpiar. Se oculta por CSS y no por estado para no volver a atar el
        // input a un `value` de React. `invisible` y no `hidden`: así el ancho
        // del campo no salta al escribir la primera letra.
        className="peer-placeholder-shown:invisible shrink-0 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors p-0.5"
      >
        <X size={13} />
      </button>
      {esIa && (
        // En modo inteligente no hay búsqueda automática: el botón deja claro
        // que hay que confirmarla, sobre todo en el celular.
        <button
          type="submit"
          className="shrink-0 text-[10px] font-black uppercase tracking-[0.1em] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded px-2 py-1 hover:opacity-90 transition"
        >
          Buscar
        </button>
      )}
      {iaDisponible && (
        <button
          type="button"
          onClick={cambiarModo}
          aria-pressed={esIa}
          title={esIa ? "Volver a la búsqueda por marca y modelo" : "Búsqueda inteligente: describí lo que buscás"}
          aria-label="Búsqueda inteligente"
          className={`shrink-0 rounded p-1 transition-colors ${
            esIa
              ? "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]"
              : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]"
          }`}
        >
          <Sparkles size={14} />
        </button>
      )}
    </form>
  );
};
