import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getRutas } from '@/features/rutas/queries'
import Link from 'next/link'

const DIFICULTAD_COLOR: Record<string, string> = {
  facil: 'text-green-400 bg-green-400/10 border-green-400/20',
  media: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  dificil: 'text-red-400 bg-red-400/10 border-red-400/20',
}

export default async function RutasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const rutas = await getRutas()

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-text-base uppercase tracking-wide">Rutas</h1>
          <p className="text-text-muted text-sm font-body mt-1">Descubre y comparte rutas de la comunidad</p>
        </div>
        <div className="flex gap-2">
          <Link href="/rutas/grabar" className="btn-primary text-sm px-4 py-2">
            🎙 Grabar ruta
          </Link>
          <Link href="/rutas/nueva" className="btn-ghost text-sm px-4 py-2">
            + Nueva
          </Link>
        </div>
      </div>

      {rutas.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-border rounded-2xl">
          <p className="text-5xl mb-4">🗺️</p>
          <p className="font-display text-xl font-bold text-text-base uppercase tracking-wide mb-2">Sin rutas aún</p>
          <p className="text-text-muted font-body text-sm mb-6">Sé el primero en publicar una ruta</p>
          <Link href="/rutas/nueva" className="btn-primary">Publicar ruta</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rutas.map(ruta => (
            <Link key={ruta.id} href={`/rutas/${ruta.id}`}
              className="bg-surface border border-border rounded-xl p-5 hover:border-accent transition-colors group">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-display font-bold text-text-base text-lg uppercase tracking-wide group-hover:text-accent transition-colors line-clamp-1">
                  {ruta.titulo}
                </h3>
                {ruta.dificultad && (
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-body shrink-0 ml-2 ${DIFICULTAD_COLOR[ruta.dificultad] ?? 'text-text-muted border-border'}`}>
                    {ruta.dificultad}
                  </span>
                )}
              </div>
              {ruta.descripcion && (
                <p className="text-text-muted text-sm font-body line-clamp-2 mb-3">{ruta.descripcion}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-text-muted font-body">
                {ruta.distancia_km && <span>📍 {ruta.distancia_km} km</span>}
                {ruta.tipo_terreno && <span>🏔️ {ruta.tipo_terreno}</span>}
                {ruta.estado_region && <span>📌 {ruta.estado_region}</span>}
                <span className="ml-auto">❤️ {ruta.likes_count ?? 0}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
