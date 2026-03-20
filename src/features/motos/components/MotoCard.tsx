import Link from 'next/link'
import { Suspense } from 'react'
import { Tables } from '@/types/database.types'
import { SaludGrid } from './SaludGrid'

const ACEITE_LABEL: Record<string, string> = {
  mineral: 'Mineral',
  'semi-sintetico': 'Semi-sintético',
  sintetico: 'Sintético',
}

const KIT_LABEL: Record<string, string> = {
  digital: 'Digital 📱',
  sticker: 'Sticker NFC 🏷️',
  llavero: 'Llavero NFC 🔑',
}

export function MotoCard({ moto }: { moto: Tables<'motos'> }) {
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-surface-2 px-6 py-5 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-2xl font-bold text-text-base uppercase tracking-wide">
              {moto.marca} {moto.modelo}
            </h3>
            <p className="text-text-muted font-body text-sm mt-1">
              {moto.ano} · {moto.km_actuales.toLocaleString('es-ES')} km
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/moto/${moto.id}/editar`}
              className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-sm text-text-muted hover:text-accent hover:border-accent transition-colors"
              title="Editar datos de la moto"
            >
              ✏️
            </Link>
            <div className={`px-3 py-1 rounded-full text-xs font-display uppercase tracking-wide ${
              moto.nfc_activado
                ? 'bg-green-950/50 text-green-400 border border-green-800/40'
                : 'bg-surface border border-border text-text-muted'
            }`}>
              {moto.nfc_activado ? 'NFC activo' : 'Sin NFC'}
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 divide-x divide-y divide-border">
        <Stat label="Aceite" value={ACEITE_LABEL[moto.tipo_aceite] ?? moto.tipo_aceite} />
        <Stat label="Kit" value={KIT_LABEL[moto.kit_tipo ?? 'digital'] ?? '—'} />
        <Stat
          label="Estado"
          value={moto.es_nueva ? 'Nueva' : 'Segunda mano'}
          className={moto.es_nueva ? 'text-accent' : 'text-text-base'}
        />
        <Stat
          label="Taller"
          value={moto.taller_acceso ? 'Con acceso' : 'Sin acceso'}
        />
      </div>

      {/* Salud visual */}
      <Suspense fallback={<SaludSkeleton />}>
        <SaludGrid
          motoId={moto.id}
          kmActuales={moto.km_actuales}
          tipoAceite={moto.tipo_aceite}
        />
      </Suspense>

      {/* Actions */}
      <div className="px-6 py-4 flex gap-3 border-t border-border">
        <Link
          href={`/chat/${moto.id}`}
          className="btn-primary flex-1 text-center"
        >
          💬 Chat IA
        </Link>
        <Link
          href={`/mantenimiento/${moto.id}`}
          className="btn-ghost px-4 py-3"
        >
          🔧 Mantenimiento
        </Link>
      </div>
    </div>
  )
}

function SaludSkeleton() {
  return (
    <div className="px-6 py-4 border-t border-border">
      <div className="h-3 w-24 bg-zinc-800 rounded mb-3 animate-pulse" />
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 rounded-lg bg-zinc-800/40 animate-pulse" />
        ))}
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  className = 'text-text-base',
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className="px-6 py-4">
      <p className="text-xs text-text-muted uppercase tracking-wider font-body mb-1">{label}</p>
      <p className={`font-body font-medium text-sm ${className}`}>{value}</p>
    </div>
  )
}
