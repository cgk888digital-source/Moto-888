import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getGrupo } from '@/features/grupos/queries'
import { updateGrupo } from '@/features/grupos/actions'

const CATEGORIAS = ['Deportivo', 'Adventure', 'Urbano', 'Naked', 'Scooter', 'Delivery', 'Clásico', 'Otro']

export default async function EditarGrupoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const grupo = await getGrupo(id)
  if (!grupo) notFound()
  if (grupo.admin_id !== user.id) redirect(`/grupos/${id}`)

  async function handleSubmit(formData: FormData) {
    'use server'
    await updateGrupo(id, formData)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-surface border border-border rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-text-base tracking-wide">
            ✏️ Editar Grupo
          </h1>
          <Link
            href={`/grupos/${id}`}
            className="text-sm text-text-muted hover:text-secondary font-body transition-colors"
          >
            Cancelar
          </Link>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-text-muted font-body">Nombre *</label>
            <input
              name="nombre"
              defaultValue={grupo.nombre}
              required
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base focus:outline-none focus:border-secondary font-body"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-text-muted font-body">Descripción</label>
            <textarea
              name="descripcion"
              defaultValue={grupo.descripcion ?? ''}
              rows={3}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base resize-none focus:outline-none focus:border-secondary font-body"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-text-muted font-body">Tipo</label>
              <select
                name="tipo"
                defaultValue={grupo.tipo ?? undefined}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base focus:outline-none focus:border-secondary font-body"
              >
                <option value="publico">Público</option>
                <option value="privado">Privado</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-text-muted font-body">Categoría</label>
              <select
                name="categoria"
                defaultValue={grupo.categoria ?? undefined}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base focus:outline-none focus:border-secondary font-body"
              >
                <option value="">Sin categoría</option>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
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
