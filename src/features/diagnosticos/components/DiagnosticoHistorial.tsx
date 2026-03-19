'use client'

import { useState } from 'react'
import { Diagnostico, NivelUrgencia } from '../types'
import { UrgenciaBadge } from './UrgenciaBadge'

interface Props {
  diagnosticos: Diagnostico[]
}

export function DiagnosticoHistorial({ diagnosticos: initial }: Props) {
  const [items, setItems] = useState(initial)

  // Exponer setter para que DiagnosticoForm pueda agregar al historial
  // (se pasa onNuevoDiagnostico desde la página)
  if (items.length === 0) {
    return (
      <p className="text-sm text-text-muted font-body text-center py-8">
        Aún no hay diagnósticos para esta moto.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {items.map(d => (
        <DiagnosticoItem key={d.id} diagnostico={d} />
      ))}
    </div>
  )
}

function DiagnosticoItem({ diagnostico: d }: { diagnostico: Diagnostico }) {
  const [expanded, setExpanded] = useState(false)
  const fecha = new Date(d.created_at).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-border/20 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <UrgenciaBadge nivel={d.nivel_urgencia as NivelUrgencia} />
          <p className="text-sm text-text-base font-body truncate">{d.sintoma_original}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-text-muted font-body">{fecha}</span>
          <span className={`text-text-muted transition-transform ${expanded ? 'rotate-180' : ''}`}>▾</span>
        </div>
      </button>

      {expanded && d.respuesta_ai && (
        <div className="px-4 pb-4 pt-0 border-t border-border space-y-3 animate-fade-in">
          {d.pregunta_enriquecida && (
            <p className="text-xs text-text-muted font-body italic pt-3">{d.pregunta_enriquecida}</p>
          )}
          <div className="text-sm text-text-base font-body whitespace-pre-wrap leading-relaxed">
            {d.respuesta_ai}
          </div>
        </div>
      )}
    </div>
  )
}
