import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getGrupos, getMisGrupos } from '@/features/grupos/queries'
import { GrupoCard } from '@/features/grupos/components/GrupoCard'
import { GrupoForm } from '@/features/grupos/components/GrupoForm'

export default async function GruposPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [grupos, misGrupos] = await Promise.all([
    getGrupos(),
    getMisGrupos(user.id),
  ])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-7 w-1 rounded-full bg-secondary" />
        <h1 className="font-display text-2xl font-bold text-text-base tracking-wide uppercase">
          Grupos <span className="text-secondary">Riders</span>
        </h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Sidebar — mis grupos + crear */}
        <div className="space-y-4">
          <GrupoForm />

          {misGrupos.length > 0 && (
            <div className="bg-surface border border-border rounded-xl p-4">
              <h3 className="font-display font-bold text-sm text-text-muted uppercase tracking-wider mb-3">Mis grupos</h3>
              <ul className="space-y-2">
                {misGrupos.map((g: any) => (
                  <li key={g.id}>
                    <a href={`/grupos/${g.id}`} className="text-sm text-text-base hover:text-secondary font-body transition-colors">
                      {g.nombre}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Lista de grupos */}
        <div className="md:col-span-2 space-y-3">
          {grupos.length === 0 ? (
            <div className="text-center py-16 text-text-muted font-body">
              <p className="text-4xl mb-3">👥</p>
              <p className="text-sm">No hay grupos aún. ¡Crea el primero!</p>
            </div>
          ) : (
            grupos.map((g: any) => <GrupoCard key={g.id} grupo={g} />)
          )}
        </div>
      </div>
    </div>
  )
}
