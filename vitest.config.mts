import { defineConfig } from "vitest/config";

/**
 * Las pruebas corren sobre las server actions, no sobre componentes: entorno
 * `node`, sin jsdom ni el plugin de React. Eso las deja rápidas y sin más
 * dependencias que mantener.
 *
 * El alias `@/` sale de tsconfig.json. Vite lo resuelve de forma nativa con
 * `resolve.tsconfigPaths`, así que no hace falta el plugin que antes se usaba
 * para esto.
 */
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["__tests__/**/*.test.ts"],
    /**
     * `next-auth` se carga de verdad en las pruebas del login, porque la acción
     * discrimina el error con `instanceof AuthError`. Por dentro importa
     * `next/server` sin extensión, y el paquete de Next no declara `exports`,
     * así que Node por sí solo no lo resuelve. Pasándolo por el pipeline de
     * Vite, que sí resuelve sin extensión, deja de ser un problema.
     */
    server: {
      deps: {
        inline: ["next-auth"],
      },
    },
    // Cada prueba arranca con los mocks en blanco. `clearMocks` es el que
    // importa: sin él, las llamadas registradas se acumulan de una prueba a la
    // otra y cualquier `toHaveBeenCalledTimes` cuenta también las de antes.
    clearMocks: true,
    restoreMocks: true,
  },
});
