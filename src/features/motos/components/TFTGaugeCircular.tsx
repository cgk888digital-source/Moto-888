import React from 'react'
import { ComponenteSalud } from '../salud'
import { TFTIcons } from './TFTIcons'

interface Props {
  comp: ComponenteSalud
  onClick: () => void
  index?: number
}

export function TFTGaugeCircular({ comp, onClick, index = 0 }: Props) {
  const isVencido = comp.estado === 'vencido'
  const isProximo = comp.estado === 'proximo'
  const color = isVencido ? 'var(--neon-red)' : isProximo ? 'var(--neon-yellow)' : 'var(--neon-cyan)'
  const glowClass = isVencido 
    ? 'shadow-neon-red border-neon-red text-neon-red animate-pulse-red hover-premium-red' 
    : isProximo 
      ? 'shadow-neon-yellow border-[#f59e0b]/50 text-neon-yellow hover-premium'
      : 'shadow-neon-cyan border-neon-cyan text-neon-cyan hover-premium'
  
  // Staggered entrance delay
  const animationStyle = {
    animationDelay: `${index * 0.08}s`,
  }
  
  // Porcentaje de salud (100% = Nuevo, 0% = Vencido)
  const kmRestantes = comp.kmProximo ? (comp.kmProximo - comp.kmActuales) : 0
  const healthPct = Math.min(100, Math.max(0, (kmRestantes / comp.intervalo) * 100))
  
  const circumference = 2 * Math.PI * 36
  const arcTotalLength = (240 / 360) * circumference
  const strokeDashoffset = arcTotalLength - (healthPct / 100) * arcTotalLength
  
  // Needle Rotation: 150deg (Start/100% health) to 390deg (End/0% health)
  const needleRotation = 150 + (1 - healthPct / 100) * 240

  const Icon = TFTIcons[comp.id as keyof typeof TFTIcons] || TFTIcons.general

  return (
    <button
      onClick={onClick}
      style={animationStyle}
      className={`relative group flex flex-col items-center justify-center p-2 transition-all active:scale-95 animate-enter`}
    >
      <div className={`relative w-24 h-24 rounded-full bg-metal flex items-center justify-center p-2 overflow-hidden ${glowClass} border-[3px] shadow-[inset_0_2px_10px_rgba(0,0,0,0.8),0_5px_15px_rgba(0,0,0,0.5)]`}>
        {/* Internal Background Shade */}
        <div className="absolute inset-2 rounded-full bg-black/40 shadow-inner" />

        {/* Info Labels inside gauge */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
           <div className={`w-7 h-7 ${isVencido ? 'text-neon-red' : isProximo ? 'text-neon-yellow' : 'text-neon-cyan'} opacity-80 mt-1`}>
            <Icon />
          </div>
        </div>

        {/* Progress Arc & Needle */}
        <svg viewBox="0 0 80 80" className="absolute inset-0">
          {/* Background Track Arc - Grayish */}
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="4"
            strokeDasharray={`${arcTotalLength} ${circumference}`}
            strokeLinecap="round"
            transform="rotate(150 40 40)"
          />
          {/* Active Health Arc */}
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={`${arcTotalLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(150 40 40)"
            className="transition-all duration-1000 ease-out"
          />
          
          {/* Rotating Needle */}
          <g transform={`rotate(${needleRotation}, 40, 40)`} className="transition-transform duration-1000 ease-out">
            <line
              x1="40" y1="40"
              x2="40" y2="12"
              stroke={isVencido ? 'var(--neon-red)' : isProximo ? 'var(--neon-yellow)' : 'white'}
              strokeWidth="2"
              strokeLinecap="round"
              className="animate-needle-swing"
            />
            {/* Needle Center Cap */}
            <circle cx="40" cy="40" r="5" fill="#1a1a1a" stroke="#444" strokeWidth="1" />
          </g>
        </svg>

        {/* Status Labels */}
        {isVencido && (
          <div className="absolute top-1 bg-neon-red text-white text-[7px] font-black px-1.5 py-0.5 rounded-sm tracking-tighter uppercase z-10 animate-pulse shadow-glow-red">
            VENCIDO
          </div>
        )}
        {!isVencido && isProximo && (
          <div className="absolute top-1 bg-[#f59e0b] text-black text-[7px] font-black px-1.5 py-0.5 rounded-sm tracking-tighter uppercase z-10 shadow-lg">
            SERVICE
          </div>
        )}
      </div>

      {/* Footer Info */}
      <span className="mt-2 text-[10px] font-display font-black text-white/90 uppercase tracking-[0.05em] leading-tight">
        {comp.nombre}
      </span>
      <span className={`text-[8px] font-mono ${isVencido ? 'text-neon-red' : isProximo ? 'text-neon-yellow' : 'text-text-muted'} font-bold mt-0.5`}>
        {isVencido 
          ? `Expiró: ${comp.kmProximo?.toLocaleString('es-ES')}k` 
          : `Próximo: ${comp.kmProximo?.toLocaleString('es-ES')}k`}
      </span>
    </button>
  )
}
