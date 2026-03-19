import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getGrupo, isMiembro } from '@/features/grupos/queries'
import { toggleMembership } from '@/features/grupos/actions'
import { GrupoFotos } from './GrupoFotos'

export default async function GrupoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [grupo, miembro, fotosResult] = await Promise.all([
    getGrupo(id),
    isMiembro(id, user.id),
    supabase
      .from('grupo_fotos')
      .select('id, url, descripcion, user_id, created_at')
      .eq('grupo_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (!grupo) notFound()

  const esAdmin = grupo.admin_id === user.id
  const esMiembro = miembro || esAdmin
  const adminNombre = (grupo as any).admin?.nombre ?? 'Admin'
  const fotos = fotosResult.data ?? []

  async function handleToggle() {
    'use server'
    await toggleMembership(id, miembro)
    redirect(`/grupos/${id}`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-accent/10 flex items-center justify-center text-3xl flex-shrink-0">
            👥
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-2xl font-bold text-text-base tracking-wide">
                {grupo.nombre}
              </h1>
              {esAdmin && (
                <Link
                  href={`/grupos/${id}/editar`}
                  className="ml-auto p-1.5 rounded-lg text-text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                  title="Editar grupo"
                >
                  ✏️
                </Link>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full font-body ${
                grupo.tipo === 'publico'
                  ? 'bg-green-900/40 text-green-400'
                  : 'bg-border text-text-muted'
              }`}>
                {grupo.tipo === 'publico' ? '🌐 Público' : '🔒 Privado'}
              </span>
            </div>
            {grupo.categoria && (
              <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-body mt-1 inline-block">
                {grupo.categoria}
              </span>
            )}
            {grupo.descripcion && (
              <p className="text-sm text-text-muted font-body mt-2 leading-relaxed">
                {grupo.descripcion}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-border">
          <div className="text-center">
            <p className="text-xl font-display font-bold text-accent">{grupo.miembros_count ?? 0}</p>
            <p className="text-xs text-text-muted font-body">Miembros</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-body text-text-muted truncate">{adminNombre}</p>
            <p className="text-xs text-text-muted font-body">Admin</p>
          </div>
        </div>

        {/* Acción miembro */}
        {!esAdmin && (
          <form action={handleToggle} className="mt-4">
            <button
              type="submit"
              className={`w-full py-2.5 rounded-lg text-sm font-body font-semibold transition-colors ${
                miembro
                  ? 'border border-border text-text-muted hover:border-red-500 hover:text-red-400'
                  : 'bg-accent text-bg hover:bg-amber-400'
              }`}
            >
              {miembro ? 'Salir del grupo' : '+ Unirse al grupo'}
            </button>
          </form>
        )}
        {esAdmin && (
          <p className="mt-4 text-center text-xs text-accent font-body">⭐ Eres el administrador de este grupo</p>
        )}
      </div>

      {/* Galería de fotos */}
      <GrupoFotos
        grupoId={id}
        userId={user.id}
        esMiembro={esMiembro}
        initialFotos={fotos}
      />

      <Link
        href="/grupos"
        className="text-sm text-text-muted hover:text-accent font-body transition-colors inline-block"
      >
        ← Volver a grupos
      </Link>
    </div>
  )
}
