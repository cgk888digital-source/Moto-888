'use client'

import React from 'react'
import { ComponenteSalud } from '../salud'

interface Props {
  componentes: ComponenteSalud[]
}

export function MaintenanceAlertBanner({ componentes }: Props) {
  // Encontrar el más urgente (vencido primero, luego cercano)
  const urgente = componentes.find(c => c.estado === 'vencido') || 
                  componentes.find(c => c.estado === 'cercano')

  if (!urgente) return null

  const isVencido = urgente.estado === 'vencido'
  const kmRestantes = urgente.kmRestantes ?? 0
  
  const bgColor = isVencido ? 'bg-neon-red/20' : 'bg-neon-orange/20'
  const borderColor = isVencido ? 'border-neon-red/50' : 'border-neon-orange/50'
  const textColor = isVencido ? 'text-neon-red' : 'text-neon-orange'
  const icon = isVencido ? '🚨' : '⚠️'

  return (
    <div className={`mb-6 p-4 rounded-xl border ${bgColor} ${borderColor} ${textColor} animate-fade-in backdrop-blur-md shadow-lg`}>
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <div className="flex-1">
          <p className="text-[10px] font-display font-black uppercase tracking-widest opacity-70">
            {isVencido ? 'Mantenimiento Vencido' : 'Próximo Mantenimiento'}
          </p>
          <p className="text-sm font-bold leading-tight">
            {isVencido 
              ? `Tu ${urgente.nombre} está vencido desde hace ${Math.abs(kmRestantes).toLocaleString('es-ES')} km`
              : `Te faltan ${kmRestantes.toLocaleString('es-ES')} km para el mantenimiento de ${urgente.nombre}`
            }
          </p>
        </div>
      </div>
    </div>
  )
}
