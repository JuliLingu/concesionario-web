"use client";

import { useEffect } from "react";
import { avisarMetrica } from "@/lib/metricas-cliente";

/**
 * Cuenta una visita a la ficha. No pinta nada.
 *
 * Va del lado del cliente y no en el render del servidor porque la ficha puede
 * servirse desde la caché de rutas: ahí el componente de servidor no se vuelve a
 * ejecutar y la visita no se contaría. Un efecto del navegador corre siempre,
 * venga la página de la caché o no.
 */
export const RegistrarVista = ({ vehiculoId }: { vehiculoId: string }) => {
  useEffect(() => {
    avisarMetrica(vehiculoId, "vista");
  }, [vehiculoId]);

  return null;
};
