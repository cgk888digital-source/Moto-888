'use client'

import { useState } from 'react'
import { Diagnostico, NivelUrgencia } from '../types'
import { UrgenciaBadge } from './UrgenciaBadge'

interface Props {
  moto_id: string
  motoNombre: string
  onNuevoDiagnostico: (d: Diagnostico) => void
}

export function DiagnosticoForm({ moto_id, motoNombre, onNuevoDiagnostico }: Props) {
  const [sintoma, setSintoma] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<Diagnostico | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!sintoma.trim() || loading) return

    setLoading(true)
    setError(null)
    setResultado(null)

    try {
      const res = await fetch('/api/diagnostico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sintoma: sintoma.trim(), moto_id }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Error al procesar el diagnóstico')
        return
      }

      setResultado(data.diagnostico)
      onNuevoDiagnostico(data.diagnostico)
      setSintoma('')
    } catch {
      setError('No se pudo conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-display font-semibold uppercase tracking-wider text-text-muted mb-2">
            Describe el síntoma o problema
          </label>
          <textarea
            value={sintoma}
            onChange={e => setSintoma(e.target.value)}
            placeholder={`Ej: Mi ${motoNombre} hace un ruido metálico al frenar en la rueda delantera, especialmente cuando freno fuerte...`}
            rows={4}
            disabled={loading}
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-base font-body text-sm placeholder:text-text-muted focus:outline-none focus:border-accent resize-none disabled:opacity-50 transition-colors"
          />
          <p className="text-xs text-text-muted mt-1.5 font-body">
            Cuanto más detallado, mejor diagnóstico. Incluye cuándo ocurre, desde cuándo, con qué intensidad.
          </p>
        </div>

        <button
          type="submit"
          disabled={!sintoma.trim() || loading}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
              Analizando con IA...
            </>
          ) : (
            <>
              <span>⚡</span>
              Diagnosticar ahora
            </>
          )}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-400/10 border border-red-400/30 rounded-xl text-red-400 text-sm font-body">
          {error}
        </div>
      )}

      {/* Resultado */}
      {resultado && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold uppercase tracking-wide text-sm text-text-muted">
              Resultado del diagnóstico
            </h3>
            <UrgenciaBadge nivel={resultado.nivel_urgencia as NivelUrgencia} />
          </div>

          {resultado.pregunta_enriquecida && (
            <div className="p-3 bg-surface border border-border rounded-lg">
              <p className="text-xs text-text-muted font-body uppercase tracking-wider mb-1">Análisis del síntoma</p>
              <p className="text-sm text-text-base font-body italic">{resultado.pregunta_enriquecida}</p>
            </div>
          )}

          <div className="p-4 bg-surface border border-accent/30 rounded-xl">
            <p className="text-xs text-accent font-display font-semibold uppercase tracking-wider mb-2">Diagnóstico IA</p>
            <div className="text-sm text-text-base font-body whitespace-pre-wrap leading-relaxed">
              {resultado.respuesta_ai}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
