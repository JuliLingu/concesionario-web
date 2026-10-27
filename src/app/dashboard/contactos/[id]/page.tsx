import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/sesion";
import { tiposActivos } from "@/lib/bandeja";
import { formatFechaLarga } from "@/lib/formato";
import { getConfiguracion } from "@/services/configuracion.service";
import { getContacto } from "@/services/contactos.service";
import { Contacto as EnlaceContacto, SinResultados, TablaPanel, TelefonoCliente } from "@/components/dashboard/PanelListado";
import { EncabezadoPedidos, FilaPedido } from "@/components/dashboard/FilaPedido";
import { NotaForm } from "@/components/dashboard/NotaForm";

interface ContactoPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Todo lo de una persona en un lugar: lo que mandó —consultas, tasaciones,
 * solicitudes— y lo que el equipo anotó de ella.
 */
export default async function ContactoPage({ params }: ContactoPageProps) {
  await requireAdmin();

  const [{ id }, configuracion] = await Promise.all([params, getConfiguracion()]);
  const contacto = await getContacto(id, tiposActivos(configuracion));
  if (!contacto) notFound();

  const pendientes = contacto.pedidos.filter((p) => p.estado === "PENDIENTE").length;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] pt-header pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <Link
          href="/dashboard/bandeja"
          className="inline-flex items-center gap-2 mb-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] text-sm font-medium transition"
        >
          <ArrowLeft size={16} /> Volver a la bandeja
        </Link>

        <div className="mb-6">
          <div className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--primary))] mb-1">
            Contacto
          </div>
          <h1 className="text-[2.5rem] font-bold tracking-tight mb-1 text-[hsl(var(--foreground))] break-words">
            {contacto.nombre}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <EnlaceContacto href={`mailto:${contacto.email}`} texto={contacto.email} />
            <TelefonoCliente telefono={contacto.telefono} />
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium mt-2">
            Primer contacto el {formatFechaLarga(contacto.createdAt)} · {contacto.pedidos.length} pedido
            {contacto.pedidos.length !== 1 ? "s" : ""}
            {pendientes > 0 && ` · ${pendientes} pendiente${pendientes !== 1 ? "s" : ""}`}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <section className="lg:col-span-2" aria-labelledby="pedidos">
            <h2 id="pedidos" className="text-lg font-bold uppercase tracking-tight text-[hsl(var(--foreground))] mb-3">
              Pedidos
            </h2>
            {contacto.pedidos.length === 0 ? (
              <SinResultados texto="No hay pedidos para mostrar." />
            ) : (
              <TablaPanel>
                <EncabezadoPedidos conCliente={false} />
                <tbody>
                  {contacto.pedidos.map((pedido) => (
                    <FilaPedido key={`${pedido.tipo}-${pedido.id}`} pedido={pedido} conCliente={false} />
                  ))}
                </tbody>
              </TablaPanel>
            )}
          </section>

          <section aria-labelledby="notas">
            <h2 id="notas" className="text-lg font-bold uppercase tracking-tight text-[hsl(var(--foreground))] mb-3">
              Notas internas
            </h2>
            <div className="bg-white rounded p-4 shadow-[0_20px_40px_rgba(26,28,30,0.06)]">
              <NotaForm contactoId={contacto.id} />
              {contacto.notas.length === 0 ? (
                <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium mt-4">
                  Todavía no hay notas. Solo las ve el equipo.
                </p>
              ) : (
                <ol className="mt-4 flex flex-col gap-3">
                  {contacto.notas.map((nota) => (
                    <li key={nota.id} className="border-t border-[#e5e7eb] pt-3">
                      <p className="text-sm text-[hsl(var(--foreground))] whitespace-pre-line break-words">{nota.texto}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))] mt-1">
                        {nota.autor ?? "Sin autor"} · {formatFechaLarga(nota.createdAt)}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
