import React from 'react'
import { ComponenteSalud } from '../salud'
import { TFTIcons } from './TFTIcons'

interface Props {
  comp: ComponenteSalud
  onClick: () => void
}

export function TFTGaugeCircular({ comp, onClick }: Props) {
  const isVencido = comp.estado === 'vencido'
  const isProximo = comp.estado === 'proximo'
  const color = isVencido ? 'var(--neon-red)' : isProximo ? '#f59e0b' : 'var(--neon-cyan)'
  const glowClass = isVencido ? 'shadow-neon-red border-neon-red text-neon-red animate-pulse-red' : 'shadow-neon-cyan border-neon-cyan text-neon-cyan'
  
  // Calcular porcentaje de arco para "OK"
  // Si falta mucho para el mantenimiento, el arco debe estar incompleto (ej. 60% segun prompt) INDICANDO SALUD
  // Para simplificar, si está al 100% es nuevo, si está al 0% es vencido.
  // Pero el prompt dice: "El arco debe estar incompleto (ej. al 60%) para indicar que aún falta para el mantenimiento."
  const kmRecorridos = comp.kmProximo ? (comp.intervalo - (comp.kmProximo - comp.kmActuales)) : 0
  const pct = Math.min(100, Math.max(0, (kmRecorridos / comp.intervalo) * 100))
  // El arco debe representar la "Salud", no el recorrido. Salud = 100 - pct?
  // User says: "arco incompleto (60%) para indicar que aún falta".
  // Let's usehealth percentage.
  const healthPct = isVencido ? 100 : Math.max(20, 100 - pct) // Min 20% visible
  
  const circumference = 2 * Math.PI * 36
  const strokeDashoffset = circumference - (healthPct / 100) * circumference

  const Icon = TFTIcons[comp.id as keyof typeof TFTIcons] || TFTIcons.general

  return (
    <button
      onClick={onClick}
      className={`relative group flex flex-col items-center justify-center p-2 transition-all active:scale-95`}
    >
      <div className={`relative w-24 h-24 rounded-full bg-metal flex items-center justify-center p-2 overflow-hidden ${glowClass} border-2`}>
        {/* Progress Arc */}
        <svg viewBox="0 0 80 80" className="absolute inset-0 rotate-[-90deg]">
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="4"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={isVencido ? 0 : strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          {/* Glowing Indicator Dot */}
          {!isVencido && (
            <circle
              cx={40 + 36 * Math.cos((healthPct * 3.6 - 90) * Math.PI / 180)}
              cy={40 + 36 * Math.sin((healthPct * 3.6 - 90) * Math.PI / 180)}
              r="3"
              fill="white"
              className="shadow-neon-cyan drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]"
            />
          )}
        </svg>

        {/* Floating Label */}
        {isVencido && (
          <div className="absolute top-1 bg-[#ff003c] text-white text-[7px] font-black px-1.5 py-0.5 rounded-sm tracking-tighter uppercase z-10 shadow-lg">
            VENCIDO
          </div>
        )}
        {!isVencido && isProximo && (
          <div className="absolute top-1 bg-[#f59e0b] text-black text-[7px] font-black px-1.5 py-0.5 rounded-sm tracking-tighter uppercase z-10 shadow-lg">
            SERVICE
          </div>
        )}

        {/* Central Icon */}
        <div className={`w-8 h-8 ${isVencido ? 'text-neon-red' : 'text-neon-cyan'} opacity-90`}>
          <Icon />
        </div>
      </div>

      {/* Info labels */}
      <span className="mt-2 text-[10px] font-display font-black text-white/90 uppercase tracking-[0.05em] leading-tight">
        {comp.nombre}
      </span>
      <span className={`text-[8px] font-mono ${isVencido ? 'text-neon-red' : 'text-text-muted'} font-bold mt-0.5`}>
        {isVencido 
          ? `Venció a los ${comp.kmProximo?.toLocaleString('es-ES')}k` 
          : `Cambio: ${comp.kmProximo?.toLocaleString('es-ES')}k`}
      </span>
    </button>
  )
}
