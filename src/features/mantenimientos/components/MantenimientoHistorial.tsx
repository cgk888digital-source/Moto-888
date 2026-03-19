'use client'

import { useState } from 'react'
import { Mantenimiento } from '../types'
import { FotoViewer } from './FotoViewer'

interface Props {
  mantenimientos: Mantenimiento[]
}

export function MantenimientoHistorial({ mantenimientos }: Props) {
  if (mantenimientos.length === 0) {
    return (
      <p className="text-sm text-text-muted font-body text-center py-8">
        Aún no hay servicios registrados para esta moto.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {mantenimientos.map(m => (
        <MantenimientoItem key={m.id} m={m} />
      ))}
    </div>
  )
}

function MantenimientoItem({ m }: { m: Mantenimiento }) {
  const [abierto, setAbierto] = useState(false)

  const fecha = new Date(m.fecha + 'T12:00:00').toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

  return (
    <div className={`bg-surface border rounded-xl overflow-hidden transition-colors ${
      abierto ? 'border-accent/40' : 'border-border'
    }`}>

      {/* Fila clickeable — siempre visible */}
      <button
        onClick={() => setAbierto(v => !v)}
        className="w-full px-4 py-4 flex items-center justify-between gap-3 text-left hover:bg-surface-2 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-sm uppercase tracking-wide text-text-base truncate">
            {m.tipo_servicio}
          </p>
          <p className="text-xs text-text-muted font-body mt-0.5">
            {fecha} · {m.km_al_servicio.toLocaleString('es-ES')} km
            {m.taller ? ` · ${m.taller}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {m.costo != null && (
            <span className="text-accent font-display font-bold text-sm">
              ${Number(m.costo).toLocaleString('es-ES')}
            </span>
          )}
          {/* Chevron */}
          <svg
            className={`h-4 w-4 text-text-muted transition-transform duration-200 ${abierto ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Detalle expandible */}
      {abierto && (
        <div className="border-t border-border px-4 pb-4 pt-4 space-y-3">

          {/* Grid de datos */}
          <div className="grid grid-cols-2 gap-3">
            <DetalleItem label="Fecha" value={fecha} />
            <DetalleItem label="KM al servicio" value={`${m.km_al_servicio.toLocaleString('es-ES')} km`} />
            {m.taller && <DetalleItem label="Taller" value={m.taller} />}
            {m.costo != null && (
              <DetalleItem label="Costo" value={`$${Number(m.costo).toLocaleString('es-ES')}`} accent />
            )}
            {m.proximo_km != null && (
              <DetalleItem label="Próximo servicio" value={`${m.proximo_km.toLocaleString('es-ES')} km`} />
            )}
          </div>

          {/* Notas */}
          {m.notas && (
            <div className="rounded-lg bg-surface-2 px-3 py-2.5">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1 font-body">Notas</p>
              <p className="text-sm text-text-base font-body leading-relaxed">{m.notas}</p>
            </div>
          )}

          {/* Foto */}
          {m.foto_url && (
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-2 font-body">Foto del servicio</p>
              <FotoViewer path={m.foto_url} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DetalleItem({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-xs text-text-muted uppercase tracking-wider font-body mb-0.5">{label}</p>
      <p className={`text-sm font-medium font-body ${accent ? 'text-accent' : 'text-text-base'}`}>{value}</p>
    </div>
  )
}
