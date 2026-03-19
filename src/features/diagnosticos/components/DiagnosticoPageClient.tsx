'use client'

import { useState } from 'react'
import { Diagnostico } from '../types'
import { DiagnosticoForm } from './DiagnosticoForm'
import { DiagnosticoHistorial } from './DiagnosticoHistorial'

interface Props {
  moto_id: string
  motoNombre: string
  initialDiagnosticos: Diagnostico[]
}

export function DiagnosticoPageClient({ moto_id, motoNombre, initialDiagnosticos }: Props) {
  const [historial, setHistorial] = useState(initialDiagnosticos)

  function handleNuevoDiagnostico(d: Diagnostico) {
    setHistorial(prev => [d, ...prev])
  }

  return (
    <div className="space-y-10">
      {/* Nuevo diagnóstico */}
      <section>
        <h2 className="font-display font-bold text-lg uppercase tracking-wide text-text-base mb-4">
          Nuevo diagnóstico
        </h2>
        <DiagnosticoForm
          moto_id={moto_id}
          motoNombre={motoNombre}
          onNuevoDiagnostico={handleNuevoDiagnostico}
        />
      </section>

      {/* Historial */}
      <section>
        <h2 className="font-display font-bold text-lg uppercase tracking-wide text-text-base mb-4">
          Historial
          {historial.length > 0 && (
            <span className="ml-2 text-sm font-body text-text-muted normal-case tracking-normal">
              ({historial.length})
            </span>
          )}
        </h2>
        <DiagnosticoHistorial diagnosticos={historial} />
      </section>
    </div>
  )
}
