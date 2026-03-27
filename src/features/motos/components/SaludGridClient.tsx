'use client'

import { useState } from 'react'
import { ComponenteSalud, EstadoSalud } from '../salud'
import { SaludModal } from './SaludModal'

interface Props {
  motoId: string
  componentes: ComponenteSalud[]
  vencidos: number
  proximos: number
}

const ESTADO_CONFIG: Record<EstadoSalud, {
  bg: string
  border: string
  dot: string
  label: string
  textColor: string
}> = {
  ok: {
    bg: 'bg-green-500/5',
    border: 'border-green-800/30',
    dot: 'bg-green-400',
    label: 'OK',
    textColor: 'text-green-400',
  },
  proximo: {
    bg: 'bg-amber-500/5',
    border: 'border-amber-700/30',
    dot: 'bg-amber-400',
    label: 'Próximo',
    textColor: 'text-amber-400',
  },
  vencido: {
    bg: 'bg-red-500/5',
    border: 'border-red-700/30',
    dot: 'bg-red-400',
    label: 'Vencido',
    textColor: 'text-red-400',
  },
  'sin-datos': {
    bg: 'bg-zinc-800/40',
    border: 'border-zinc-700/40',
    dot: 'bg-zinc-500',
    label: 'Sin datos',
    textColor: 'text-zinc-500',
  },
}

export function SaludGridClient({ motoId, componentes, vencidos, proximos }: Props) {
  const [selectedComp, setSelectedComp] = useState<ComponenteSalud | null>(null)

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-display uppercase tracking-wider text-text-muted">
          Salud de la moto
        </p>
        <div className="flex gap-2">
          {vencidos > 0 && (
            <span className="text-xs font-medium text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
              {vencidos} vencido{vencidos > 1 ? 's' : ''}
            </span>
          )}
          {vencidos === 0 && proximos > 0 && (
            <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
              {proximos} próximo{proximos > 1 ? 's' : ''}
            </span>
          )}
          {vencidos === 0 && proximos === 0 && (
            <span className="text-xs font-medium text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
              Todo al día
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {componentes.map((comp) => (
          <ComponenteCard 
            key={comp.id} 
            comp={comp} 
            onClick={() => setSelectedComp(comp)}
          />
        ))}
      </div>

      {selectedComp && (
        <SaludModal 
          motoId={motoId} 
          comp={selectedComp} 
          onClose={() => setSelectedComp(null)} 
        />
      )}
    </>
  )
}

function ComponenteCard({ comp, onClick }: { comp: ComponenteSalud; onClick: () => void }) {
  const cfg = ESTADO_CONFIG[comp.estado]

  return (
    <button 
      onClick={onClick}
      className={`rounded-lg border p-2.5 text-left transition-all active:scale-95 hover:border-text-muted/50 ${cfg.bg} ${cfg.border}`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-lg leading-none shrink-0">{comp.icono}</span>
        <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      </div>
      <p className="text-[10px] uppercase tracking-tight font-bold text-text-base truncate mb-0.5">{comp.nombre}</p>
      
      <div className="flex flex-col gap-0.5">
        <p className={`text-[11px] font-medium leading-tight ${cfg.textColor}`}>
          {comp.estado === 'sin-datos'
            ? 'Sin registro'
            : comp.estado === 'vencido'
            ? `${Math.abs(comp.kmRestantes ?? 0).toLocaleString()} km venc.`
            : comp.estado === 'proximo'
            ? `${(comp.kmRestantes ?? 0).toLocaleString()} km rest.`
            : cfg.label}
        </p>
        <p className="text-[9px] text-text-muted font-body leading-tight">
          A los {comp.intervalo.toLocaleString()} km
        </p>
      </div>
    </button>
  )
}
