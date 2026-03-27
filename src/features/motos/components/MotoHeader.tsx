'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Tables } from '@/types/database.types'
import { KmModal } from './KmModal'

interface Props {
  moto: Tables<'motos'>
}

export function MotoHeader({ moto }: Props) {
  const [showKmModal, setShowKmModal] = useState(false)

  return (
    <header className="bg-surface-2 px-6 py-5 border-b border-border">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-2xl font-bold text-text-base uppercase tracking-wide truncate">
            {moto.marca} {moto.modelo}
          </h3>
          <p className="text-text-muted font-body text-sm mt-0.5">
            Año {moto.ano}
          </p>
          
          {/* Botón de KM - Grande y fácil de tocar */}
          <button 
            onClick={() => setShowKmModal(true)}
            className="mt-4 group flex flex-col items-start bg-surface border border-border rounded-2xl px-5 py-4 transition-all active:scale-95 hover:border-accent shadow-lg shadow-black/20"
          >
            <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted mb-1 group-hover:text-accent transition-colors">
              Kilometraje Actual
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-bold text-accent">
                {moto.km_actuales.toLocaleString('es-ES')}
              </span>
              <span className="text-sm font-display font-bold text-text-muted">KM</span>
              <span className="ml-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">✏️</span>
            </div>
          </button>
        </div>

        <div className="flex flex-col items-end gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Link
              href={`/moto/${moto.id}/editar`}
              className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-base text-text-muted hover:text-accent hover:border-accent transition-all active:scale-90"
              aria-label={`Editar datos de ${moto.marca} ${moto.modelo}`}
            >
              ✏️
            </Link>
            <span 
              className={`px-3 py-1.5 rounded-full text-[10px] font-display font-bold uppercase tracking-wider ${
                moto.nfc_activado
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-surface border border-border text-text-muted'
              }`}
            >
              {moto.nfc_activado ? 'NFC activo' : 'Sin NFC'}
            </span>
          </div>
        </div>
      </div>

      {showKmModal && (
        <KmModal 
          motoId={moto.id} 
          currentKm={moto.km_actuales} 
          onClose={() => setShowKmModal(null as any)} // Use false or null
        />
      )}
    </header>
  )
}
