'use client'

import React, { useState, useEffect } from 'react'
import { ComponenteSalud } from '../salud'

interface Props {
  componentes: ComponenteSalud[]
  onResolver: (comp: ComponenteSalud) => void
}

const CONSECUENCIAS: Record<string, string> = {
  aceite: 'Desgaste acelerado del motor por fricción. Ignorarlo resultará en pérdida de potencia, ruidos internos y finalmente un motor fundido muy costoso.',
  cadena: 'Riesgo inminente de ruptura. Una cadena rota puede bloquear la rueda trasera causar una caída grave o destruir el cárter del motor.',
  frenos: 'Distancias de frenado peligrosamente largas y riesgo de pérdida absoluta de control. Tu capacidad de detenerte ante un obstáculo es nula.',
  'filtro-aire': 'El motor "respira" suciedad, aumentando el consumo de combustible y carbonizando las bujías, lo que reduce la vida útil total.',
  bujias: 'Combustión ineficiente que genera tirones, mayor consumo y dificultad de encendido excesivo, forzando la batería y el motor de arranque.',
  suspensiones: 'Pérdida de tracción en baches y curvas. La moto se vuelve inestable y peligrosa de manejar a altas velocidades.',
  valvulas: 'Desajuste que provoca ruidos metálicos y, en casos graves, daños permanentes en la culata. La moto perderá su suavidad original.',
  general: 'Un mantenimiento vencido reduce el valor de reventa de tu moto y compromete seriamente tu seguridad y la de tu acompañante.',
}

export function MaintenancePopup({ componentes, onResolver }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [compVencido, setCompVencido] = useState<ComponenteSalud | null>(null)

  useEffect(() => {
    // Buscar componentes vencidos
    const vencidos = componentes.filter(c => c.estado === 'vencido')
    if (vencidos.length === 0) return

    const lastSnooze = localStorage.getItem('maintenance_popup_snooze')
    const now = Date.now()
    const MS_PER_DAY = 24 * 60 * 60 * 1000

    if (!lastSnooze || (now - parseInt(lastSnooze)) > MS_PER_DAY) {
      setCompVencido(vencidos[0])
      setIsOpen(true)
    }
  }, [componentes])

  const handleSnooze = () => {
    localStorage.setItem('maintenance_popup_snooze', Date.now().toString())
    setIsOpen(false)
  }

  if (!isOpen || !compVencido) return null

  const consecuencia = CONSECUENCIAS[compVencido.id] || CONSECUENCIAS.general
  const kmVencimiento = Math.abs(compVencido.kmRestantes ?? 0)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border-2 border-neon-red/30 rounded-3xl w-full max-w-sm overflow-hidden shadow-[0_0_80px_rgba(255,0,60,0.3)]">
        {/* Header Alert - High Impact */}
        <div className="bg-neon-red px-6 py-4 flex items-center gap-3">
          <span className="text-2xl animate-pulse">📢</span>
          <h2 className="text-white font-display font-black uppercase tracking-wider text-sm">
            Mantenimiento Requerido
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-6 pb-4">
          <div className="mb-4">
            <h3 className="text-white font-display font-bold text-[10px] uppercase tracking-widest opacity-60 mb-1">
              Estado Crítico
            </h3>
            <p className="text-white font-black text-xl leading-tight">
              Tu {compVencido.nombre} está vencido desde hace <span className="text-neon-red">{kmVencimiento.toLocaleString('es-ES')} km</span>.
            </p>
          </div>
          
          <div className="p-4 bg-neon-red/10 border border-neon-red/20 rounded-xl mb-6">
            <p className="text-[9px] text-neon-red font-black uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-neon-red rounded-full animate-pulse" />
              Impacto & Riesgo Real:
            </p>
            <p className="text-sm text-white/90 font-bold leading-relaxed">
              {consecuencia}
            </p>
          </div>
          
          <p className="text-text-muted text-[10px] italic text-center font-medium opacity-50 px-4">
            Ignorar un mantenimiento puede resultar en accidentes o reparaciones de alto costo.
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-3">
          <button
            onClick={() => onResolver(compVencido)}
            className="w-full bg-neon-red hover:bg-neon-red/80 text-white font-display font-black py-4 rounded-xl uppercase tracking-widest shadow-neon-red transition-all active:scale-95"
          >
            Resolver ahora
          </button>
          <button
            onClick={handleSnooze}
            className="w-full bg-white/5 hover:bg-white/10 text-white/40 font-display font-bold py-3 rounded-xl uppercase tracking-wider text-xs transition-colors"
          >
            Recordar después
          </button>
        </div>
      </div>
    </div>
  )
}
