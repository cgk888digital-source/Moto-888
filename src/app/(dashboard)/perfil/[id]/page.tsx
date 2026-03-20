import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getPublicProfile, getFollowStats, isFollowing } from '@/features/follows/queries'
import { toggleFollow } from '@/features/follows/actions'
import { getRutas } from '@/features/rutas/queries'
import Link from 'next/link'

const PLAN_BADGE: Record<string, string> = {
  free: 'text-text-muted border-border',
  pro: 'text-accent border-accent/40',
  fleet: 'text-purple-400 border-purple-400/40',
}

export default async function PublicPerfilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Redirigir a perfil propio si es el mismo usuario
  if (id === user.id) redirect('/perfil')

  const [profile, stats, siguiendo, rutas] = await Promise.all([
    getPublicProfile(id),
    getFollowStats(id),
    isFollowing(user.id, id),
    getRutas({ userId: id }),
  ])

  if (!profile) notFound()

  async function handleToggleFollow() {
    'use server'
    await toggleFollow(id)
  }

  const plan = (profile.plan ?? 'free') as string

  return (
    <div className="animate-fade-in space-y-6 max-w-lg mx-auto">
      {/* Back */}
      <Link href="/feed" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors font-body uppercase tracking-wider">
        ← Feed
      </Link>

      {/* Perfil card */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        {/* Avatar + nombre */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center font-display font-bold text-xl text-accent">
              {(profile.nombre ?? profile.id).slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-display text-xl font-bold text-text-base uppercase tracking-wide">
                {profile.nombre ?? 'Rider'}
              </p>
              <span className={`text-xs border px-2 py-0.5 rounded-full font-body ${PLAN_BADGE[plan] ?? PLAN_BADGE.free}`}>
                {plan.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Botón seguir */}
          <form action={handleToggleFollow}>
            <button
              type="submit"
              className={`text-sm px-4 py-2 rounded-lg font-body font-semibold transition-colors min-h-[40px] ${
                siguiendo
                  ? 'bg-surface-2 border border-border text-text-muted hover:border-red-400 hover:text-red-400'
                  : 'bg-accent text-bg hover:bg-amber-400'
              }`}
            >
              {siguiendo ? 'Siguiendo ✓' : '+ Seguir'}
            </button>
          </form>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="font-display text-2xl font-bold text-text-base">{stats.seguidores}</p>
            <p className="text-xs text-text-muted font-body">seguidores</p>
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-text-base">{stats.siguiendo}</p>
            <p className="text-xs text-text-muted font-body">siguiendo</p>
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-text-base">{rutas.length}</p>
            <p className="text-xs text-text-muted font-body">rutas</p>
          </div>
        </div>

        <p className="text-xs text-text-muted font-body mt-4">
          Miembro desde {new Date(profile.created_at ?? '').toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
        </p>
      </div>

      {/* Rutas del usuario */}
      {rutas.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display font-bold text-text-base uppercase tracking-wide">Rutas publicadas</h2>
          {rutas.map(ruta => (
            <Link key={ruta.id} href={`/rutas/${ruta.id}`}
              className="flex items-center justify-between bg-surface border border-border rounded-xl px-4 py-3 hover:border-accent transition-colors">
              <div>
                <p className="font-display font-bold text-text-base text-sm uppercase tracking-wide">{ruta.titulo}</p>
                <p className="text-xs text-text-muted font-body">
                  {ruta.distancia_km ? `${ruta.distancia_km} km` : ''}{ruta.estado_region ? ` · ${ruta.estado_region}` : ''}
                </p>
              </div>
              <span className="text-text-muted text-sm">→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
