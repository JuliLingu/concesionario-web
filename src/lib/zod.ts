/**
 * Alias históricos de los esquemas de autenticación.
 *
 * Hasta ahora este archivo definía su propio par de esquemas, con una política
 * de contraseña distinta de la de `@/schemas/auth`. Tener dos definiciones
 * significaba que endurecer una dejaba la otra como puerta blanda, así que
 * quedan apuntando a la única fuente de verdad.
 *
 * Para código nuevo, importar directamente de `@/schemas/auth`.
 */
export { LoginSchema as loginSchema, RegisterSchema as registerSchema } from "@/schemas/auth";
