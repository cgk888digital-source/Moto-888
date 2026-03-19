import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getEvento } from '@/features/eventos/queries'
import { updateEvento } from '@/features/eventos/actions'

export default async function EditarEventoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const evento = await getEvento(id)
  if (!evento) notFound()
  if ((evento as any).creador_id !== user.id) redirect(`/eventos/${id}`)

  // Format fecha_hora for datetime-local input (YYYY-MM-DDTHH:mm)
  const fechaLocal = new Date(evento.fecha_hora).toISOString().slice(0, 16)

  async function handleSubmit(formData: FormData) {
    'use server'
    await updateEvento(id, formData)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-surface border border-border rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-text-base tracking-wide">
            ✏️ Editar Rodada
          </h1>
          <Link
            href={`/eventos/${id}`}
            className="text-sm text-text-muted hover:text-accent font-body transition-colors"
          >
            Cancelar
          </Link>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-text-muted font-body">Nombre *</label>
            <input
              name="titulo"
              defaultValue={evento.titulo}
              required
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base focus:outline-none focus:border-accent font-body"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-text-muted font-body">Descripción</label>
            <textarea
              name="descripcion"
              defaultValue={evento.descripcion ?? ''}
              rows={3}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base resize-none focus:outline-none focus:border-accent font-body"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-text-muted font-body">Fecha y hora *</label>
              <input
                type="datetime-local"
                name="fecha_hora"
                defaultValue={fechaLocal}
                required
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base focus:outline-none focus:border-accent font-body"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-text-muted font-body">Cupos máximos</label>
              <input
                type="number"
                name="cupos_max"
                defaultValue={evento.cupos_max ?? ''}
                placeholder="Sin límite"
                min={2}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base placeholder-text-muted focus:outline-none focus:border-accent font-body"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-text-muted font-body">Punto de partida</label>
            <input
              name="punto_partida"
              defaultValue={evento.punto_partida ?? ''}
              placeholder="Dirección o referencia"
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base placeholder-text-muted focus:outline-none focus:border-accent font-body"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-accent text-bg py-2.5 rounded-lg text-sm font-body font-semibold tracking-wide hover:bg-amber-400 transition-colors"
          >
            Guardar cambios
          </button>
        </form>
      </div>
    </div>
  )
}
