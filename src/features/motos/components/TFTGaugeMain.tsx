import React from 'react'

interface Props {
  km: number
}

export function TFTGaugeMain({ km }: Props) {
  const formattedKm = km.toLocaleString('es-ES')
  
  return (
    <div className="relative flex flex-col items-center justify-center pt-8 pb-12 overflow-hidden">
      {/* The Semicircle Arc (Tachometer style) */}
      <div className="relative w-[80vw] max-w-[400px] aspect-[2/1] flex items-center justify-center">
        <svg viewBox="0 0 200 100" className="w-full drop-shadow-[0_0_15px_rgba(0,229,255,0.4)]">
          {/* Background Arc */}
          <path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Progress Arc (Cyan Glow) */}
          <path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="url(#cyanGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="251"
            strokeDashoffset="0"
            className="animate-[dash_2s_ease-out]"
          />
          
          {/* Decorative Ticks */}
          {[...Array(13)].map((_, i) => {
            const angle = (i * 15) - 0
            const x1 = 100 + 75 * Math.cos((180 + angle) * Math.PI / 180)
            const y1 = 90 + 75 * Math.sin((180 + angle) * Math.PI / 180)
            const x2 = 100 + 85 * Math.cos((180 + angle) * Math.PI / 180)
            const y2 = 90 + 85 * Math.sin((180 + angle) * Math.PI / 180)
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i % 2 === 0 ? "#00e5ff" : "#555"} strokeWidth="1" />
            )
          })}

          <defs>
            <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00e5ff" />
              <stop offset="100%" stopColor="#00a8ff" />
            </linearGradient>
            <filter id="needleGlow">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
              <feFlood floodColor="#00e5ff" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* New Physical Needle */}
          <g transform={`rotate(${(Math.min(km, 120000) / 120000) * 180 - 0}, 100, 90)`} className="transition-transform duration-1000 ease-out">
            <line
              x1="100" y1="90"
              x2="25" y2="90"
              stroke="#00e5ff"
              strokeWidth="3"
              strokeLinecap="round"
              filter="url(#needleGlow)"
              className="animate-needle-swing"
            />
            <circle cx="100" cy="90" r="6" fill="#222" stroke="#444" strokeWidth="2" />
          </g>
        </svg>

        {/* Center Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <span className="text-[10px] font-display font-bold text-text-muted tracking-[0.2em] mb-1">
            KILOMETRAJE ACTUAL
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl font-mono font-black text-white tracking-tighter text-neon-cyan leading-none">
              {formattedKm}
            </span>
            <span className="text-sm font-display font-bold text-text-muted">KM</span>
          </div>
        </div>
      </div>

      {/* Decorative Bezel Base */}
      <div className="w-[90%] h-4 bg-metal rounded-b-3xl -mt-2 opacity-80" />
      <div className="w-[70%] h-1 bg-neon-cyan/20 blur-sm -mt-0.5" />
    </div>
  )
}
