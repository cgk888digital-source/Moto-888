'use client'

import { useState, useTransition } from 'react'
import { createMantenimiento } from '../../mantenimientos/actions'
import { ComponenteSalud } from '../salud'
import { useRouter } from 'next/navigation'

interface Props {
  motoId: string
  comp: ComponenteSalud | null
  onClose: () => void
}

export function SaludModal({ motoId, comp, onClose }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  const today = new Date().toISOString().split('T')[0]
  // Iniciar con valores por defecto y actualizar si comp existe
  const [km, setKm] = useState(comp?.kmActuales.toString() ?? '0')
  const [fecha, setFecha] = useState(today)

  if (!comp) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!comp) return // Extra safety for lint
    setError(null)

    startTransition(async () => {
      // Usamos el primer tipo del componente como servicio por defecto
      // o el nombre del componente si no hay tipos (fallback)
      const serviceType = comp.tipos && comp.tipos.length > 0 ? comp.tipos[0] : comp.nombre

      const result = await createMantenimiento({
        moto_id: motoId,
        tipo_servicio: serviceType as any,
        km_al_servicio: Number(km),
        fecha: fecha,
        notas: `Registro rápido desde Salud: ${comp.nombre}`,
      })

      if (result.error) {
        setError(result.error)
      } else {
        router.refresh()
        onClose()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-surface border-t sm:border border-border rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-6 sm:py-8">
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl leading-none">{comp.icono}</span>
              <div>
                <h3 className="font-display text-xl font-bold uppercase tracking-wide text-text-base">
                  {comp.nombre}
                </h3>
                <p className="text-xs text-text-muted font-body">Registro de mantenimiento</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-text-muted hover:text-text-base transition-colors"
            >
              ✕
            </button>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="label-field">Kilometraje</label>
                <input 
                  type="number" 
                  value={km}
                  onChange={e => setKm(e.target.value)}
                  className="input-field"
                  required
                  placeholder="Ej: 50000"
                />
              </div>
              <div className="space-y-2">
                <label className="label-field">Fecha</label>
                <input 
                  type="date" 
                  value={fecha}
                  onChange={e => setFecha(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </div>

            {comp.ultimaFecha && (
              <div className="p-4 bg-surface-2 rounded-2xl border border-border">
                <p className="text-[10px] uppercase tracking-wider font-bold text-text-muted mb-1">Último registro</p>
                <p className="text-sm font-body text-text-base">
                   {new Date(comp.ultimaFecha + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} · {comp.kmProximo ? (comp.kmProximo - comp.intervalo).toLocaleString() : '—'} km
                </p>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-400 font-body text-center">{error}</p>
            )}

            <div className="pt-4 flex flex-col gap-3">
              <button 
                type="submit" 
                disabled={isPending}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                    Guardando...
                  </>
                ) : 'Guardar mantenimiento'}
              </button>
              <button 
                type="button" 
                onClick={onClose}
                className="text-sm text-text-muted hover:text-text-base font-body py-2 transition-colors"
              >
                Tal vez luego
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
