'use client'
import { useTransition } from 'react'
import { createGrupo } from '../actions'

const CATEGORIAS = ['Deportivo', 'Adventure', 'Urbano', 'Naked', 'Scooter', 'Delivery', 'Clásico', 'Otro']

export function GrupoForm() {
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => { await createGrupo(fd) })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-5 space-y-4">
      <h2 className="font-display font-bold text-lg text-text-base tracking-wide">Crear Grupo</h2>

      <div className="space-y-3">
        <input
          name="nombre"
          placeholder="Nombre del grupo *"
          required
          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base placeholder-text-muted focus:outline-none focus:border-secondary font-body"
        />
        <textarea
          name="descripcion"
          placeholder="Descripción (opcional)"
          rows={2}
          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base placeholder-text-muted resize-none focus:outline-none focus:border-secondary font-body"
        />
        <div className="grid grid-cols-2 gap-3">
          <select
            name="tipo"
            className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base focus:outline-none focus:border-secondary font-body"
          >
            <option value="publico">Público</option>
            <option value="privado">Privado</option>
          </select>
          <select
            name="categoria"
            className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base focus:outline-none focus:border-secondary font-body"
          >
            <option value="">Categoría</option>
            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-accent text-bg py-2.5 rounded-lg text-sm font-body font-semibold tracking-wide hover:bg-amber-400 transition-colors disabled:opacity-50"
      >
        {pending ? 'Creando...' : 'Crear Grupo'}
      </button>
    </form>
  )
}
