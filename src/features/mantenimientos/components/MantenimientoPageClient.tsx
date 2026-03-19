'use client'

import { useState } from 'react'
import { Mantenimiento } from '../types'
import { MantenimientoForm } from './MantenimientoForm'
import { MantenimientoHistorial } from './MantenimientoHistorial'

interface Props {
  moto_id: string
  userId: string
  kmActuales: number
  initialMantenimientos: Mantenimiento[]
}

export function MantenimientoPageClient({ moto_id, userId, kmActuales, initialMantenimientos }: Props) {
  const [historial, setHistorial] = useState(initialMantenimientos)
  const [showForm, setShowForm] = useState(false)

  function handleNuevo(m: Mantenimiento) {
    setHistorial(prev => [m, ...prev])
    setShowForm(false)
  }

  return (
    <div className="space-y-8">
      {/* Botón o formulario */}
      {showForm ? (
        <section className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="font-display font-bold text-lg uppercase tracking-wide text-text-base mb-6">
            Nuevo servicio
          </h2>
          <MantenimientoForm
            moto_id={moto_id}
            userId={userId}
            kmActuales={kmActuales}
            onNuevoMantenimiento={handleNuevo}
            onCancel={() => setShowForm(false)}
          />
        </section>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <span className="text-lg">+</span>
          Registrar servicio
        </button>
      )}

      {/* Historial */}
      <section>
        <h2 className="font-display font-bold text-lg uppercase tracking-wide text-text-base mb-4">
          Historial
          {historial.length > 0 && (
            <span className="ml-2 text-sm font-body text-text-muted normal-case tracking-normal">
              ({historial.length} {historial.length === 1 ? 'registro' : 'registros'})
            </span>
          )}
        </h2>
        <MantenimientoHistorial mantenimientos={historial} />
      </section>
    </div>
  )
}
