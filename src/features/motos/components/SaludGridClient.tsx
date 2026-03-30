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

const ORDEN_ESTADO: Record<EstadoSalud, number> = {
  vencido: 0,
  proximo: 1,
  ok: 2,
  'sin-datos': 3,
}

const BADGE: Record<EstadoSalud, { label: string; cls: string }> = {
  vencido:    { label: 'VENCIDO',      cls: 'bg-red-500/20 text-red-400 border border-red-700/40' },
  proximo:    { label: 'PRÓXIMO',      cls: 'bg-amber-500/20 text-amber-400 border border-amber-700/40' },
  ok:         { label: 'SALUD OK',     cls: 'bg-teal-500/20 text-teal-400 border border-teal-700/40' },
  'sin-datos':{ label: 'SIN REGISTRO', cls: 'bg-zinc-700/40 text-zinc-400 border border-zinc-600/40' },
}

const CARD_BORDER: Record<EstadoSalud, string> = {
  vencido:     'border-red-700/50',
  proximo:     'border-amber-700/50',
  ok:          'border-border',
  'sin-datos': 'border-border',
}

const ICON_BG: Record<EstadoSalud, string> = {
  vencido:     'bg-red-500/10',
  proximo:     'bg-amber-500/10',
  ok:          'bg-teal-500/10',
  'sin-datos': 'bg-zinc-700/30',
}

const ACCION: Record<string, string> = {
  aceite: 'Cambio', cadena: 'Limpieza', frenos: 'Revisión',
  'filtro-aire': 'Limpieza', bujias: 'Revisión', general: 'Revisión',
  rodamientos: 'Engrase', suspensiones: 'Revisión', embrague: 'Revisión',
  valvulas: 'Ajuste', 'kit-arrastre': 'Cambio', guayas: 'Lubricación',
  bateria: 'Revisión', luces: 'Revisión', 'sistema-carga': 'Revisión',
  inyectores: 'Limpieza', 'liquido-frenos': 'Cambio',
}

function getSubtexto(comp: ComponenteSalud): string {
  if (comp.estado === 'sin-datos') return 'Chequeo pendiente'
  if (comp.estado === 'vencido') {
    return comp.kmProximo ? `Venció a los ${comp.kmProximo.toLocaleString('es-ES')} km` : 'Mantenimiento vencido'
  }
  if (!comp.kmProximo) return '—'
  const accion = ACCION[comp.id] ?? 'Próximo'
  return `${accion}: ${comp.kmProximo.toLocaleString('es-ES')} km`
}

export function SaludGridClient({ motoId, componentes, vencidos, proximos }: Props) {
  const [selectedComp, setSelectedComp] = useState<ComponenteSalud | null>(null)

  const ordenados = [...componentes].sort(
    (a, b) => ORDEN_ESTADO[a.estado] - ORDEN_ESTADO[b.estado]
  )

  return (
    <>
      {/* Resumen */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-display uppercase tracking-wider text-text-muted">
          Salud de la moto
        </p>
        {vencidos > 0 && (
          <span className="text-xs font-medium text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-700/30">
            {vencidos} vencido{vencidos > 1 ? 's' : ''}
          </span>
        )}
        {vencidos === 0 && proximos > 0 && (
          <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-700/30">
            {proximos} próximo{proximos > 1 ? 's' : ''}
          </span>
        )}
        {vencidos === 0 && proximos === 0 && (
          <span className="text-xs font-medium text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-700/30">
            Todo al día
          </span>
        )}
      </div>

      {/* Grid 2 columnas */}
      <div className="grid grid-cols-2 gap-3">
        {ordenados.map((comp) => {
          const badge = BADGE[comp.estado]
          return (
            <button
              key={comp.id}
              onClick={() => setSelectedComp(comp)}
              className={`rounded-xl border bg-surface-2 p-3.5 flex flex-col gap-2.5 text-left transition-all active:scale-95 hover:brightness-110 ${CARD_BORDER[comp.estado]}`}
            >
              {/* Icono + Badge */}
              <div className="flex items-start justify-between gap-1">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xl ${ICON_BG[comp.estado]}`}>
                  {comp.icono}
                </div>
                <span className={`text-[9px] font-display font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md leading-tight ${badge.cls}`}>
                  {badge.label}
                </span>
              </div>

              {/* Nombre + subtexto */}
              <div>
                <p className="font-display font-bold text-sm text-text-base uppercase tracking-wide leading-tight">
                  {comp.nombre}
                </p>
                <p className="text-xs text-text-muted font-body mt-0.5 leading-snug">
                  {getSubtexto(comp)}
                </p>
              </div>
            </button>
          )
        })}
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
