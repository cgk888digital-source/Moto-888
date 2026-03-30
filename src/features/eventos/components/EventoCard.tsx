import Link from 'next/link'

interface EventoCardProps {
  evento: {
    id: string
    titulo: string
    descripcion: string | null
    fecha_hora: string
    punto_partida: string | null
    voy_count: number
    cupos_max: number | null
    creador: { nombre: string | null } | null
  }
}

export function EventoCard({ evento }: EventoCardProps) {
  const fecha = new Date(evento.fecha_hora)
  const dia = fecha.toLocaleDateString('es-VE', { weekday: 'short', day: 'numeric', month: 'short' })
  const hora = fecha.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })

  return (
    <Link href={`/eventos/${evento.id}`} className="block bg-surface border border-border rounded-xl p-4 hover:border-secondary transition-colors group">
      <div className="flex gap-4">
        {/* Fecha badge */}
        <div className="flex-shrink-0 w-14 bg-secondary-muted rounded-lg flex flex-col items-center justify-center py-2 text-center">
          <span className="text-xs text-text-muted font-body uppercase">{dia.split(' ')[0]}</span>
          <span className="text-xl font-display font-bold text-secondary leading-none">{dia.split(' ')[1]}</span>
          <span className="text-xs text-text-muted font-body">{dia.split(' ').slice(2).join(' ')}</span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-text-base group-hover:text-secondary transition-colors truncate">
            {evento.titulo}
          </h3>
          {evento.descripcion && (
            <p className="text-xs text-text-muted font-body mt-0.5 line-clamp-2">{evento.descripcion}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="text-xs text-text-muted font-body">🕐 {hora}</span>
            {evento.punto_partida && (
              <span className="text-xs text-text-muted font-body">📍 {evento.punto_partida}</span>
            )}
            <span className="text-xs text-secondary font-body font-semibold">
              ✅ {evento.voy_count} van
              {evento.cupos_max ? ` / ${evento.cupos_max} cupos` : ''}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
