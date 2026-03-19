import { NivelUrgencia, URGENCIA_CONFIG } from '../types'

export function UrgenciaBadge({ nivel }: { nivel: NivelUrgencia }) {
  const cfg = URGENCIA_CONFIG[nivel]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-display font-bold uppercase tracking-wider ${cfg.color} ${cfg.bg}`}>
      <span>{cfg.icon}</span>
      Urgencia {cfg.label}
    </span>
  )
}
