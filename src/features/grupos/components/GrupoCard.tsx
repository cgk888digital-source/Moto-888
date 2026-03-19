import Link from 'next/link'

interface GrupoCardProps {
  grupo: {
    id: string
    nombre: string
    descripcion: string | null
    tipo: string
    categoria: string | null
    miembros_count: number
  }
}

export function GrupoCard({ grupo }: GrupoCardProps) {
  return (
    <Link href={`/grupos/${grupo.id}`} className="block bg-surface border border-border rounded-xl p-4 hover:border-accent transition-colors group">
      <div className="flex items-start justify-between gap-3">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-2xl flex-shrink-0">
          👥
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-text-base group-hover:text-accent transition-colors truncate">
            {grupo.nombre}
          </h3>
          {grupo.descripcion && (
            <p className="text-xs text-text-muted font-body mt-0.5 line-clamp-2">{grupo.descripcion}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-text-muted font-body">👤 {grupo.miembros_count} miembros</span>
            {grupo.categoria && (
              <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-body">{grupo.categoria}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
