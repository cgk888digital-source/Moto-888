'use client'

import React, { useState, useEffect } from 'react'
import { ComponenteSalud } from '../salud'

interface Props {
  componentes: ComponenteSalud[]
  onResolver: (comp: ComponenteSalud) => void
}

const CONSECUENCIAS: Record<string, string> = {
  aceite: 'Daño severo en el motor por fricción. Una reparación de motor cuesta 20x más que un cambio de aceite.',
  cadena: 'Riesgo inminente de ruptura en marcha y desgaste acelerado de toda la transmisión.',
  frenos: 'Pérdida crítica de capacidad de frenado. Tu seguridad y la de otros depende de tus frenos.',
  'filtro-aire': 'Aumento de consumo de combustible y pérdida de potencia. Tu motor "no respira" bien.',
  bujias: 'Fallos de encendido y combustión ineficiente que daña internamente los cilindros.',
  suspensiones: 'Inestabilidad peligrosa en curvas y frenado. Afecta directamente el control de la moto.',
  valvulas: 'Pérdida de compresión y sobrecalentamiento. Puede causar daños permanentes en la culata.',
  general: 'Un mantenimiento vencido reduce drásticamente la vida útil y el valor de reventa de tu moto.',
}

export function MaintenancePopup({ componentes, onResolver }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [compVencido, setCompVencido] = useState<ComponenteSalud | null>(null)

  useEffect(() => {
    const vencidos = componentes.filter(c => c.estado === 'vencido')
    if (vencidos.length === 0) return

    const lastSnooze = localStorage.getItem('maintenance_popup_snooze')
    const now = Date.now()
    const SNOOZE_TIME = 24 * 60 * 60 * 1000 // 24 horas

    if (!lastSnooze || (now - Number(lastSnooze)) > SNOOZE_TIME) {
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border-2 border-neon-red/30 rounded-3xl w-full max-w-sm overflow-hidden shadow-[0_0_50px_rgba(255,0,60,0.2)]">
        {/* Header Alert */}
        <div className="bg-neon-red px-6 py-4 flex items-center gap-3">
          <span className="text-2xl animate-pulse">🔧</span>
          <h2 className="text-white font-display font-black uppercase tracking-wider">
            Mantenimiento Requerido
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-6 pb-4">
          <p className="text-white font-bold text-lg mb-2 leading-tight">
            Tu {compVencido.nombre} está vencido desde hace {Math.abs(compVencido.kmRestantes ?? 0).toLocaleString('es-ES')} km.
          </p>
          <p className="text-text-muted text-sm leading-relaxed mb-6 font-medium">
            {consecuencia}
          </p>
          
          <div className="p-3 bg-neon-red/10 border border-neon-red/20 rounded-xl mb-6">
            <p className="text-[10px] text-neon-red font-black uppercase tracking-widest mb-1 italic">
              Consecuencia Real:
            </p>
            <p className="text-xs text-neon-red/90 font-bold leading-tight uppercase">
              Riesgo de falla crítica y compromiso de seguridad.
            </p>
          </div>
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
