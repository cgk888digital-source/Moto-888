'use client'
import { useTransition } from 'react'
import { createEvento } from '../actions'

export function EventoForm() {
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => { await createEvento(fd) })
  }

  // Min date = now (datetime-local format)
  const minDate = new Date(Date.now() + 3600000).toISOString().slice(0, 16)

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-5 space-y-4">
      <h2 className="font-display font-bold text-lg text-text-base tracking-wide">Crear Rodada</h2>

      <div className="space-y-3">
        <input
          name="titulo"
          placeholder="Nombre de la rodada *"
          required
          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base placeholder-text-muted focus:outline-none focus:border-secondary font-body"
        />
        <textarea
          name="descripcion"
          placeholder="Descripción, detalles, recomendaciones..."
          rows={2}
          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base placeholder-text-muted resize-none focus:outline-none focus:border-secondary font-body"
        />
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-text-muted font-body">Fecha y hora *</label>
            <input
              type="datetime-local"
              name="fecha_hora"
              min={minDate}
              required
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base focus:outline-none focus:border-secondary font-body"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-text-muted font-body">Cupos máximos</label>
            <input
              type="number"
              name="cupos_max"
              placeholder="Sin límite"
              min={2}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base placeholder-text-muted focus:outline-none focus:border-secondary font-body"
            />
          </div>
        </div>
        <input
          name="punto_partida"
          placeholder="Punto de partida (dirección o referencia)"
          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base placeholder-text-muted focus:outline-none focus:border-secondary font-body"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-accent text-bg py-2.5 rounded-lg text-sm font-body font-semibold tracking-wide hover:bg-amber-400 transition-colors disabled:opacity-50"
      >
        {pending ? 'Creando rodada...' : '🗺️ Crear Rodada'}
      </button>
    </form>
  )
}
