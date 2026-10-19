"use client";

import { useLayoutEffect, useRef } from "react";
import { formatNumeroAr } from "@/lib/precio";

/**
 * Entero con separador de miles mientras se escribe: "85000" se ve "85.000".
 *
 * El valor que entra y sale son solo los dígitos ("85000"): el esquema lo lee
 * tal cual, y el punto es únicamente de la vista. Por eso no es `type="number"`,
 * que no admite el punto, y sí `inputMode="numeric"`, que en el celular abre el
 * teclado de números igual.
 *
 * Al reformatear, el cursor se iría al final; se lo vuelve a ubicar después de
 * la misma cantidad de dígitos que tenía antes, para poder corregir uno del
 * medio sin que salte.
 */
export const InputNumero = ({
  value,
  onChange,
  onBlur,
  name,
  className,
  disabled,
  placeholder,
  maxDigitos = 9,
  inputRef,
}: {
  value: string | number | null | undefined;
  onChange: (digitos: string) => void;
  onBlur?: () => void;
  name?: string;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  maxDigitos?: number;
  inputRef?: (el: HTMLInputElement | null) => void;
}) => {
  const ref = useRef<HTMLInputElement | null>(null);
  const digitosAntesDelCursor = useRef<number | null>(null);

  const digitos = String(value ?? "").replace(/\D/g, "");
  const texto = digitos ? formatNumeroAr(Number(digitos)) : "";

  useLayoutEffect(() => {
    const el = ref.current;
    const objetivo = digitosAntesDelCursor.current;
    if (!el || objetivo === null || document.activeElement !== el) return;
    digitosAntesDelCursor.current = null;

    let posicion = 0;
    let vistos = 0;
    while (posicion < texto.length && vistos < objetivo) {
      if (/\d/.test(texto[posicion])) vistos++;
      posicion++;
    }
    el.setSelectionRange(posicion, posicion);
  }, [texto]);

  return (
    <input
      ref={(el) => {
        ref.current = el;
        inputRef?.(el);
      }}
      name={name}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={texto}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      onBlur={onBlur}
      onChange={(e) => {
        const cursor = e.target.selectionStart ?? e.target.value.length;
        digitosAntesDelCursor.current = e.target.value.slice(0, cursor).replace(/\D/g, "").length;
        // Los ceros a la izquierda no son parte de un número.
        onChange(e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, maxDigitos));
      }}
    />
  );
};
