import { createClient } from '@/lib/supabase/server'
import { calcularSalud, type ComponenteSalud, type EstadoSalud } from '../salud'

interface Props {
  motoId: string
  kmActuales: number
  tipoAceite: string
}

export async function SaludGrid({ motoId, kmActuales, tipoAceite }: Props) {
  const supabase = await createClient()

  const { data: mantenimientos } = await supabase
    .from('mantenimientos')
    .select('tipo_servicio, km_al_servicio, proximo_km, fecha')
    .eq('moto_id', motoId)
    .order('km_al_servicio', { ascending: false })

  const componentes = calcularSalud(mantenimientos ?? [], kmActuales, tipoAceite)

  const vencidos = componentes.filter((c) => c.estado === 'vencido').length
  const proximos = componentes.filter((c) => c.estado === 'proximo').length

  return (
    <div className="px-6 py-4 border-t border-border">
      {/* Resumen */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-display uppercase tracking-wider text-text-muted">
          Salud de la moto
        </p>
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

      {/* Grid de componentes */}
      <div className="grid grid-cols-3 gap-2">
        {componentes.map((comp) => (
          <ComponenteCard key={comp.id} comp={comp} />
        ))}
      </div>
    </div>
  )
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

function ComponenteCard({ comp }: { comp: ComponenteSalud }) {
  const cfg = ESTADO_CONFIG[comp.estado]

  return (
    <div className={`rounded-lg border p-2.5 ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-base leading-none">{comp.icono}</span>
        <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      </div>
      <p className="text-xs font-medium text-text-base truncate">{comp.nombre}</p>
      <p className={`text-xs mt-0.5 ${cfg.textColor}`}>
        {comp.estado === 'sin-datos'
          ? 'Sin registro'
          : comp.estado === 'vencido'
          ? `${Math.abs(comp.kmRestantes ?? 0).toLocaleString()} km`
          : comp.estado === 'proximo'
          ? `${(comp.kmRestantes ?? 0).toLocaleString()} km`
          : cfg.label}
      </p>
    </div>
  )
}
