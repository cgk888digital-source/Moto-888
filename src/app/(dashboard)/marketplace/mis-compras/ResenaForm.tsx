'use client'

import { useState, useTransition } from 'react'
import { createResena } from '@/features/marketplace/actions'

interface Props {
  transaccionId: string
  vendedorId: string
}

export function ResenaForm({ transaccionId, vendedorId }: Props) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [comentario, setComentario] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await createResena(transaccionId, vendedorId, rating, comentario)
      if (result?.error) {
        setError(result.error)
      } else {
        setEnviado(true)
      }
    })
  }

  if (enviado) {
    return (
      <p className="text-xs text-green-400 font-body">✓ ¡Gracias por tu reseña!</p>
    )
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-accent hover:underline font-body"
      >
        ⭐ Dejar reseña al vendedor
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-bg border border-border rounded-xl p-4">
      <p className="text-xs font-display font-bold uppercase tracking-wider text-text-base">Tu reseña</p>

      {/* Estrellas */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={`text-2xl transition-transform hover:scale-110 ${n <= rating ? 'text-accent' : 'text-border'}`}
          >
            ★
          </button>
        ))}
        <span className="ml-2 text-xs text-text-muted font-body self-center">{rating}/5</span>
      </div>

      <textarea
        value={comentario}
        onChange={e => setComentario(e.target.value)}
        placeholder="Cuéntanos tu experiencia con el vendedor (opcional)"
        rows={2}
        className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-base placeholder-text-muted focus:outline-none focus:border-accent font-body resize-none"
      />

      {error && <p className="text-xs text-red-400 font-body">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn-primary text-xs px-4 py-2">
          {pending ? 'Enviando...' : 'Enviar reseña'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost text-xs px-4 py-2">
          Cancelar
        </button>
      </div>
    </form>
  )
}
