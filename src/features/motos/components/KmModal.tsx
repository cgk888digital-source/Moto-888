'use client'

import { useState, useTransition } from 'react'
import { updateMotoKm } from '../actions'
import { useRouter } from 'next/navigation'

interface Props {
  motoId: string
  currentKm: number
  onClose: () => void
}

export function KmModal({ motoId, currentKm, onClose }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [km, setKm] = useState(currentKm.toString())
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (Number(km) < 0) {
      setError('El kilometraje no puede ser negativo')
      return
    }

    startTransition(async () => {
      const result = await updateMotoKm(motoId, Number(km))
      if (result.error) {
        setError(result.error)
      } else {
        router.refresh()
        onClose()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-sm bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-8">
          <header className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 text-accent text-3xl mb-4">
              📟
            </div>
            <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-text-base">
              Actualizar KM
            </h3>
            <p className="text-sm text-text-muted font-body mt-1">Escribe el kilometraje actual de tu moto</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input 
                type="number" 
                value={km}
                onChange={e => setKm(e.target.value)}
                autoFocus
                className="w-full bg-surface-2 border-2 border-border rounded-2xl px-6 py-5 text-4xl font-display font-bold text-center text-accent focus:outline-none focus:border-accent transition-all"
                required
                placeholder="0"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl font-display font-bold text-text-muted pointer-events-none">
                KM
              </span>
            </div>

            {error && (
              <p className="text-sm text-red-400 font-body text-center">{error}</p>
            )}

            <div className="pt-2 flex flex-col gap-3">
              <button 
                type="submit" 
                disabled={isPending}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-lg"
              >
                {isPending ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                    Actualizando...
                  </>
                ) : 'Confirmar'}
              </button>
              <button 
                type="button" 
                onClick={onClose}
                className="text-sm text-text-muted hover:text-text-base font-body py-2 transition-colors uppercase tracking-widest font-bold"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
