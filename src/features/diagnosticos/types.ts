import { Tables } from '@/types/database.types'

export type Diagnostico = Tables<'diagnosticos'>

export type NivelUrgencia = 'bajo' | 'medio' | 'alto' | 'critico'

export const URGENCIA_CONFIG: Record<NivelUrgencia, { label: string; color: string; bg: string; icon: string }> = {
  bajo:    { label: 'Bajo',    color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/30',  icon: '✓' },
  medio:   { label: 'Medio',   color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30', icon: '!' },
  alto:    { label: 'Alto',    color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/30', icon: '⚠' },
  critico: { label: 'Crítico', color: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/30',       icon: '✕' },
}
