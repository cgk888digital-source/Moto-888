import { Suspense } from 'react'
import type { Tables } from '@/types/database.types'
import { SaludGrid } from './SaludGrid'
import { MotoHeader } from './MotoHeader'
import { TFTGaugeMain } from './TFTGaugeMain'
import Link from 'next/link'

interface Props {
  moto: Tables<'motos'>
}

export function MotoCard({ moto }: Props) {
  return (
    <article className="bg-carbon border border-white/5 rounded-3xl overflow-hidden shadow-2xl pb-6" aria-label={`Moto: ${moto.marca} ${moto.modelo}`}>
      <MotoHeader moto={moto} />

      {/* Main Gauge Section */}
      <TFTGaugeMain km={moto.km_actuales} />

      <Suspense fallback={<SaludSkeleton />}>
        <SaludGrid
          motoId={moto.id}
          kmActuales={moto.km_actuales}
          tipoAceite={moto.tipo_aceite}
        />
      </Suspense>

      <nav className="px-6 py-4 flex gap-4" aria-label="Acciones de moto">
        <Link
          href={`/chat/${moto.id}`}
          className="flex-1 bg-white/5 hover:bg-white/10 text-[#00e5ff] font-display font-black tracking-widest px-6 py-4 rounded-xl border border-[#00e5ff]/20 text-center uppercase text-xs transition-colors"
          aria-label={`Iniciar chat IA con ${moto.marca} ${moto.modelo}`}
        >
          💬 Chat IA
        </Link>
        <Link
          href={`/mantenimiento/${moto.id}`}
          className="px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted transition-colors border border-white/5"
          aria-label={`Ver mantenimiento de ${moto.marca} ${moto.modelo}`}
        >
          🔧
        </Link>
      </nav>
    </article>
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

function SaludSkeleton() {
  return (
    <div className="px-6 py-4 border-t border-border" aria-hidden="true">
      <div className="h-3 w-24 bg-zinc-800 rounded mb-3 animate-pulse" />
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-20 rounded-lg bg-zinc-800/40 animate-pulse" />
        ))}
      </div>
    </div>
  )
}
