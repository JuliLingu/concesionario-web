"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";
import { Search, X } from "lucide-react";
import { LARGO_MAXIMO_BUSQUEDA, textoDeBusqueda } from "@/lib/busqueda";

/**
 * Cuadro de búsqueda del catálogo.
 *
 * La búsqueda vive en la URL (`?q=`) como el resto de los filtros, así que se
 * comparte, se marca y vuelve con el botón de atrás. Se navega con `replace` y
 * no con `push` para no dejar una entrada en el historial por cada tecla: quien
 * escribe "amarok" y aprieta atrás quiere volver de donde vino, no ver "amaro",
 * "amar", "ama".
 *
 * El input no es controlado a propósito. La fuente de verdad es la URL, y entre
 * que alguien escribe y que el servidor responde hay un rato en el que la prop
 * `busqueda` todavía dice lo de antes; con un `value` atado a ella, cada
 * respuesta llegaría a destiempo a pisar lo que se está tipeando. Así el DOM
 * manda mientras se escribe y solo se lo corrige cuando la URL cambia por
 * fuera de este cuadro —el botón de atrás, o el enlace que limpia la búsqueda
 * desde la grilla vacía—.
 */

/**
 * Milisegundos de quietud antes de disparar la consulta. Cada navegación es un
 * viaje al servidor y una consulta a la base; a 350 ms una palabra escrita de
 * corrido produce una sola.
 */
const ESPERA_MS = 350;

export const CatalogSearch = ({ busqueda }: { busqueda: string }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const input = useRef<HTMLInputElement>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Lo último que pusimos nosotros en la URL; distingue nuestros cambios de los de afuera. */
  const enviado = useRef(busqueda);

  const buscar = (valor: string) => {
    if (temporizador.current) clearTimeout(temporizador.current);

    // Se normaliza con la misma función que usa el servidor: así lo que vuelve
    // por `busqueda` coincide con lo anotado en `enviado` y la sincronización
    // de abajo no confunde nuestra propia navegación con una externa.
    const normalizado = textoDeBusqueda(valor);
    if (normalizado === enviado.current) return;
    enviado.current = normalizado;

    const params = new URLSearchParams(searchParams.toString());
    if (normalizado) params.set("q", normalizado);
    else params.delete("q");
    // La página 4 de otra búsqueda no significa nada en esta: se vuelve a la 1.
    params.delete("page");

    const qs = params.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname));
  };

  /** Busca sola al dejar de escribir; no hace falta apretar nada. */
  const programarBusqueda = (valor: string) => {
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => buscar(valor), ESPERA_MS);
  };

  // La URL cambió por fuera del cuadro: el input se pone al día. El efecto solo
  // corre cuando `busqueda` cambia de valor, así que la navegación propia —que
  // todavía la deja en lo de antes mientras está en curso— no lo despierta.
  useEffect(() => {
    if (busqueda !== enviado.current) {
      enviado.current = busqueda;
      if (input.current) input.current.value = busqueda;
    }
  }, [busqueda]);

  // Un temporizador pendiente al desmontar dispararía una navegación sobre una
  // pantalla que ya no está.
  useEffect(() => () => {
    if (temporizador.current) clearTimeout(temporizador.current);
  }, []);

  return (
    <form
      role="search"
      // Enter no espera el temporizador. `preventDefault` evita además la
      // recarga completa que haría el navegador con un form sin action.
      onSubmit={(e) => {
        e.preventDefault();
        buscar(input.current?.value ?? "");
      }}
      className={`flex items-center gap-2 bg-[hsl(var(--card))] border border-black/5 rounded px-3 py-1.5 w-full md:w-80 transition-opacity duration-200 ${
        isPending ? "opacity-60" : "opacity-100"
      }`}
    >
      <Search size={14} className="text-[hsl(var(--primary))] shrink-0" aria-hidden="true" />
      <input
        ref={input}
        type="search"
        name="q"
        defaultValue={busqueda}
        onChange={(e) => programarBusqueda(e.target.value)}
        maxLength={LARGO_MAXIMO_BUSQUEDA}
        aria-label="Buscar en el catálogo"
        placeholder="Marca, modelo, versión o año"
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
          buscar("");
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
    </form>
  );
};
