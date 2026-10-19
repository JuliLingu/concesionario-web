"use client";

import { useEffect, useRef, useState } from "react";
import { useWatch, type FieldValues, type Path, type PathValue, type UseFormReturn } from "react-hook-form";

/**
 * Borrador de un formulario en `localStorage`, para que lo escrito no se
 * pierda si el visitante sale a buscar un dato (el kilometraje, la versión) y
 * vuelve, o se le cierra la pestaña.
 *
 * Qué se guarda y qué no, a propósito:
 *  - Solo los campos de `campos`. Los datos de contacto quedan afuera: no hace
 *    falta guardarlos —el autocompletado del navegador los repone— y en un
 *    equipo compartido no deberían quedar escritos.
 *  - Con fecha: pasado `diasDeVida` el borrador se descarta solo.
 *  - Se borra al enviar el formulario (`descartar`).
 *
 * Lo que se lee se trata como dato no confiable: puede haberlo editado
 * cualquiera desde las herramientas del navegador. Se toman solo las claves
 * conocidas, solo si son texto y con un tope de largo; el esquema vuelve a
 * validar todo al enviar, y el servidor una vez más.
 *
 * `localStorage` puede no estar (modo privado, almacenamiento bloqueado): todo
 * va en try/catch y el formulario funciona igual, sin borrador.
 */

const LARGO_MAXIMO = 2000;

interface Guardado {
  guardadoEn: number;
  paso: number;
  valores: Record<string, string>;
}

export function useBorrador<T extends FieldValues, R extends FieldValues>({
  clave,
  form,
  campos,
  paso,
  alRecuperar,
  diasDeVida = 7,
}: {
  clave: string;
  form: UseFormReturn<T, unknown, R>;
  campos: readonly Path<T>[];
  /** Paso en el que iba, para volver a dejarlo ahí. */
  paso: number;
  /** Se llama con el paso guardado cuando se recupera un borrador. */
  alRecuperar?: (paso: number) => void;
  diasDeVida?: number;
}): {
  /** Si se recuperó un borrador, para avisarle al visitante. */
  recuperado: boolean;
  descartar: (opciones?: { dejarDeGuardar?: boolean }) => void;
} {
  const [recuperado, setRecuperado] = useState(false);
  const alRecuperarRef = useRef(alRecuperar);
  // No se escribe nada hasta haber intentado leer: si no, el primer render
  // pisaría el borrador con el formulario vacío antes de restaurarlo.
  const listo = useRef(false);
  const camposRef = useRef(campos);
  const inicialesRef = useRef(form.formState.defaultValues);

  // Lectura, una sola vez y ya en el navegador (en el servidor no hay
  // `localStorage`, y leerlo durante el render desfasaría la hidratación).
  useEffect(() => {
    try {
      const crudo = window.localStorage.getItem(clave);
      if (!crudo) return;
      const guardado = JSON.parse(crudo) as Partial<Guardado>;

      const vencido =
        typeof guardado.guardadoEn !== "number" ||
        Date.now() - guardado.guardadoEn > diasDeVida * 86_400_000;
      if (vencido || !guardado.valores || typeof guardado.valores !== "object") {
        window.localStorage.removeItem(clave);
        return;
      }

      let alguno = false;
      for (const campo of camposRef.current) {
        const valor = (guardado.valores as Record<string, unknown>)[campo];
        if (typeof valor !== "string" || valor === "") continue;
        // Si el campo ya trae algo (p. ej. la unidad que vino en la URL), gana
        // lo que pidió esta visita y no lo de la anterior.
        if (form.getValues(campo)) continue;
        form.setValue(campo, valor.slice(0, LARGO_MAXIMO) as PathValue<T, Path<T>>);
        alguno = true;
      }
      if (alguno) {
        setRecuperado(true);
        alRecuperarRef.current?.(typeof guardado.paso === "number" ? guardado.paso : 0);
      }
    } catch {
      // JSON roto o almacenamiento bloqueado: se sigue sin borrador.
    } finally {
      listo.current = true;
    }
    // Solo al montar: después, el formulario es la fuente de verdad.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Escritura, con una pausa para no serializar en cada tecla.
  const valores = useWatch({ control: form.control }) as Partial<T>;
  const serializado = JSON.stringify(
    Object.fromEntries(camposRef.current.map((c) => [c, String(valores[c] ?? "")])),
  );

  useEffect(() => {
    if (!listo.current) return;
    const temporizador = window.setTimeout(() => {
      if (!listo.current) return;
      try {
        const datos = JSON.parse(serializado) as Record<string, string>;
        // Lo que vino de fábrica (la moneda en USD, por ejemplo) no es un
        // borrador: si no se escribió nada propio, no se guarda nada.
        const iniciales = (inicialesRef.current ?? {}) as Record<string, unknown>;
        const escribioAlgo = Object.entries(datos).some(
          ([campo, valor]) => valor && valor !== String(iniciales[campo] ?? ""),
        );
        if (!escribioAlgo) {
          window.localStorage.removeItem(clave);
          return;
        }
        const guardado: Guardado = { guardadoEn: Date.now(), paso, valores: datos };
        window.localStorage.setItem(clave, JSON.stringify(guardado));
      } catch {
        // Cuota llena o almacenamiento bloqueado: sin borrador, nada más.
      }
    }, 400);
    return () => window.clearTimeout(temporizador);
  }, [clave, serializado, paso]);

  const descartar = ({ dejarDeGuardar = false } = {}) => {
    // Después de enviar no se vuelve a guardar: los valores siguen en el
    // formulario y un guardado pendiente reviviría lo que ya se mandó.
    if (dejarDeGuardar) listo.current = false;
    try {
      window.localStorage.removeItem(clave);
    } catch {
      // Nada que hacer.
    }
    setRecuperado(false);
  };

  return { recuperado, descartar };
}
