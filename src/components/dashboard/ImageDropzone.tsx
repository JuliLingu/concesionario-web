"use client";

import { useRef, useState } from "react";
import { AlertCircle, ImagePlus, Loader2, X } from "lucide-react";
import { firmarSubida } from "@/actions/upload";

const TAMANIO_MAXIMO_MB = 10;

interface Subida {
  id: number;
  nombre: string;
  progreso: number;
  error?: string;
}

/**
 * Sube un archivo a Cloudinary con una firma pedida al servidor.
 *
 * La firma se emite por archivo y solo si la sesión es de administrador, así
 * que ya no hay credenciales de subida en el bundle del navegador. El destino
 * (`public_id`) y las extensiones admitidas van dentro de la firma: el
 * navegador no puede cambiarlos sin invalidarla.
 *
 * Se usa XMLHttpRequest y no fetch porque es la única forma de leer el
 * progreso real de la subida y poder mostrar la barra.
 */
async function subirArchivo(archivo: File, onProgreso: (porcentaje: number) => void) {
  const firma = await firmarSubida();
  if (!firma.ok) throw new Error(firma.error);

  const { cloudName, apiKey, timestamp, publicId, allowedFormats, signature } =
    firma.credenciales;

  return new Promise<string>((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", archivo);
    formData.append("api_key", apiKey);
    formData.append("timestamp", String(timestamp));
    formData.append("public_id", publicId);
    formData.append("allowed_formats", allowedFormats);
    formData.append("signature", signature);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

    xhr.upload.addEventListener("progress", (evento) => {
      if (evento.lengthComputable) {
        onProgreso(Math.round((evento.loaded / evento.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      let cuerpo: any = null;
      try {
        cuerpo = JSON.parse(xhr.responseText);
      } catch {
        // Respuesta no interpretable: se maneja abajo como error genérico.
      }

      if (xhr.status >= 200 && xhr.status < 300 && cuerpo?.secure_url) {
        resolve(cuerpo.secure_url as string);
      } else {
        reject(new Error(cuerpo?.error?.message || "No se pudo subir la imagen"));
      }
    });

    xhr.addEventListener("error", () =>
      reject(new Error("No se pudo conectar con el servidor de imágenes")),
    );
    xhr.addEventListener("abort", () => reject(new Error("Subida cancelada")));

    xhr.send(formData);
  });
}

function validar(archivo: File, extensiones: string[]): string | null {
  const extension = archivo.name.split(".").pop()?.toLowerCase() ?? "";

  if (!extensiones.includes(extension)) {
    return `"${archivo.name}": formato no admitido. Se aceptan ${extensiones.join(", ")}.`;
  }

  if (archivo.size > TAMANIO_MAXIMO_MB * 1024 * 1024) {
    return `"${archivo.name}": supera los ${TAMANIO_MAXIMO_MB} MB.`;
  }

  return null;
}

interface ImageDropzoneProps {
  /** Recibe las URLs de las imágenes que terminaron de subirse. */
  onUpload: (urls: string[]) => void;
  extensiones?: string[];
  multiple?: boolean;
  /** Cuántos archivos más admite el formulario. `undefined` es sin límite. */
  cupoDisponible?: number;
  disabled?: boolean;
  titulo?: string;
  ayuda?: string;
  /** Versión reducida, para cuando la zona convive con una vista previa. */
  compact?: boolean;
}

export function ImageDropzone({
  onUpload,
  extensiones = ["png", "jpg", "jpeg", "webp"],
  multiple = false,
  cupoDisponible,
  disabled = false,
  titulo,
  ayuda,
  compact = false,
}: ImageDropzoneProps) {
  const [arrastrando, setArrastrando] = useState(false);
  const [subidas, setSubidas] = useState<Subida[]>([]);
  const [avisos, setAvisos] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  // dragenter/dragleave también se disparan al pasar sobre los hijos, así que
  // se lleva la cuenta de entradas y salidas en lugar de un simple booleano.
  const contadorArrastre = useRef(0);
  const proximoId = useRef(0);

  const sinCupo = cupoDisponible !== undefined && cupoDisponible <= 0;
  const bloqueado = disabled || sinCupo;
  const subiendo = subidas.some((s) => !s.error);

  const actualizarSubida = (id: number, cambios: Partial<Subida>) => {
    setSubidas((previas) =>
      previas.map((subida) => (subida.id === id ? { ...subida, ...cambios } : subida)),
    );
  };

  const procesarArchivos = async (lista: FileList | null) => {
    if (bloqueado || !lista?.length) return;

    setAvisos([]);
    let archivos = Array.from(lista);
    const nuevosAvisos: string[] = [];

    if (!multiple) {
      archivos = archivos.slice(0, 1);
    }

    if (cupoDisponible !== undefined && archivos.length > cupoDisponible) {
      nuevosAvisos.push(
        `Solo quedan ${cupoDisponible} lugar(es) disponible(s). Se tomaron los primeros ${cupoDisponible} archivos.`,
      );
      archivos = archivos.slice(0, cupoDisponible);
    }

    const validos: File[] = [];
    for (const archivo of archivos) {
      const problema = validar(archivo, extensiones);
      if (problema) {
        nuevosAvisos.push(problema);
      } else {
        validos.push(archivo);
      }
    }

    if (nuevosAvisos.length) setAvisos(nuevosAvisos);
    if (!validos.length) return;

    const enCurso = validos.map((archivo) => ({
      id: proximoId.current++,
      nombre: archivo.name,
      progreso: 0,
    }));
    setSubidas((previas) => [...previas, ...enCurso]);

    // Se mantiene el orden en que el usuario eligió los archivos.
    const resultados = await Promise.all(
      validos.map(async (archivo, indice) => {
        const { id } = enCurso[indice];
        try {
          const url = await subirArchivo(archivo, (progreso) =>
            actualizarSubida(id, { progreso }),
          );
          setSubidas((previas) => previas.filter((subida) => subida.id !== id));
          return url;
        } catch (error) {
          actualizarSubida(id, {
            error: error instanceof Error ? error.message : "Error desconocido",
          });
          return null;
        }
      }),
    );

    const urls = resultados.filter((url): url is string => Boolean(url));
    if (urls.length) onUpload(urls);
  };

  const alSoltar = (evento: React.DragEvent) => {
    evento.preventDefault();
    contadorArrastre.current = 0;
    setArrastrando(false);
    procesarArchivos(evento.dataTransfer.files);
  };

  // Si faltan credenciales en el entorno ya no se detecta acá: lo comprueba el
  // servidor al pedir la firma y el aviso aparece junto al archivo que falló.
  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={extensiones.map((extension) => `.${extension}`).join(",")}
        className="hidden"
        onChange={(evento) => {
          procesarArchivos(evento.target.files);
          // Permite volver a elegir el mismo archivo después de quitarlo.
          evento.target.value = "";
        }}
      />

      <button
        type="button"
        disabled={bloqueado}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(evento) => {
          evento.preventDefault();
          if (bloqueado) return;
          contadorArrastre.current += 1;
          setArrastrando(true);
        }}
        onDragOver={(evento) => evento.preventDefault()}
        onDragLeave={(evento) => {
          evento.preventDefault();
          contadorArrastre.current -= 1;
          if (contadorArrastre.current <= 0) setArrastrando(false);
        }}
        onDrop={alSoltar}
        className={`flex w-full flex-col items-center justify-center gap-2 rounded border-2 border-dashed transition-colors ${
          compact ? "px-4 py-5" : "px-6 py-10"
        } ${
          bloqueado
            ? "cursor-not-allowed border-black/10 bg-[hsl(var(--surface-low))] text-[hsl(var(--muted-foreground))] opacity-60"
            : arrastrando
              ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5 text-[hsl(var(--primary))]"
              : "cursor-pointer border-black/10 bg-[hsl(var(--surface-low))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/5 hover:text-[hsl(var(--primary))]"
        }`}
      >
        {subiendo ? (
          <Loader2 size={compact ? 20 : 28} className="animate-spin" />
        ) : (
          <ImagePlus size={compact ? 20 : 28} />
        )}

        <span className="text-[10px] font-black uppercase tracking-[0.1em]">
          {sinCupo
            ? "Alcanzaste el máximo de imágenes"
            : arrastrando
              ? "Soltá las imágenes acá"
              : (titulo ?? (multiple ? "Arrastrá las imágenes o hacé clic" : "Arrastrá la imagen o hacé clic"))}
        </span>

        {!sinCupo && (
          <span className="text-[10px] font-medium normal-case tracking-normal opacity-70">
            {ayuda ??
              `${extensiones.join(", ").toUpperCase()} · hasta ${TAMANIO_MAXIMO_MB} MB${
                cupoDisponible !== undefined ? ` · quedan ${cupoDisponible}` : ""
              }`}
          </span>
        )}
      </button>

      {/* Progreso por archivo */}
      {subidas.length > 0 && (
        <ul className="flex flex-col gap-2">
          {subidas.map((subida) => (
            <li
              key={subida.id}
              className="rounded bg-[hsl(var(--surface-low))] px-3 py-2 text-xs"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="truncate font-medium text-[hsl(var(--foreground))]">
                  {subida.nombre}
                </span>
                {subida.error ? (
                  <button
                    type="button"
                    onClick={() =>
                      setSubidas((previas) =>
                        previas.filter((item) => item.id !== subida.id),
                      )
                    }
                    className="shrink-0 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]"
                    aria-label="Descartar"
                  >
                    <X size={14} />
                  </button>
                ) : (
                  <span className="shrink-0 tabular-nums text-[hsl(var(--muted-foreground))]">
                    {subida.progreso}%
                  </span>
                )}
              </div>

              {subida.error ? (
                <p className="mt-1 font-medium text-red-600">{subida.error}</p>
              ) : (
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded bg-black/10">
                  <div
                    className="h-full bg-[hsl(var(--primary))] transition-all duration-200"
                    style={{ width: `${subida.progreso}%` }}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Archivos rechazados antes de intentar subirlos */}
      {avisos.length > 0 && (
        <ul className="flex flex-col gap-1">
          {avisos.map((aviso) => (
            <li
              key={aviso}
              className="flex items-start gap-2 text-xs font-medium text-red-600"
            >
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              {aviso}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
