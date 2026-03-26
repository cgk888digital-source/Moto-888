import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getGrupo, getMembership } from '@/features/grupos/queries'
import { joinGroup, leaveGroup } from '@/features/grupos/actions'
import { JoinGroupFlow } from './JoinGroupFlow'
import { GrupoFotos } from './GrupoFotos'
import { GrupoChat } from './GrupoChat'

export default async function GrupoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [grupo, membership, fotosResult] = await Promise.all([
    getGrupo(id),
    getMembership(id, user.id),
    supabase
      .from('grupo_fotos')
      .select('id, url, descripcion, user_id, created_at')
      .eq('grupo_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (!grupo) notFound()

  const esAdmin = membership?.rol === 'admin'
  const esMiembro = !!membership
  const adminNombre = (grupo as any).admin?.nombre ?? 'Fundador'
  const fotos = fotosResult.data ?? []

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="bg-surface border border-border rounded-xl p-6 relative overflow-hidden">
        {/* Background gradient subtle */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent/20 via-accent to-accent/20" />
        
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-accent shadow-lg shadow-accent/20 flex items-center justify-center text-3xl flex-shrink-0 text-bg">
            {grupo.tipo === 'rodada' ? '🏍️' : '👥'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-2xl font-bold text-text-base tracking-wide">
                {grupo.nombre}
              </h1>
              {esAdmin && (
                <Link
                  href={`/grupos/${id}/editar`}
                  className="ml-auto p-2 rounded-lg bg-surface-2 text-text-muted hover:text-accent border border-border transition-all"
                  title="Ajustes de grupo"
                >
                  ⚙️
                </Link>
              )}
              <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full font-display font-bold ${
                grupo.tipo === 'publico' || grupo.tipo === 'RODADA'
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-border text-text-muted'
              }`}>
                {grupo.tipo === 'RODADA' ? '🏁 RODADA' : (grupo.tipo === 'publico' ? '🌐 Público' : '🔒 Privado')}
              </span>
            </div>
            {grupo.categoria && (
              <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-body mt-2 inline-block">
                📂 {grupo.categoria}
              </span>
            )}
            {grupo.descripcion && (
              <p className="text-sm text-text-muted font-body mt-3 leading-relaxed whitespace-pre-wrap">
                {grupo.descripcion}
              </p>
            )}
          </div>
        </div>

        {/* Info Bars */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="text-accent">👥</div>
            <div>
              <p className="text-lg font-display font-bold text-text-base leading-none">{grupo.miembros_count ?? 1}</p>
              <p className="text-[10px] uppercase tracking-wider text-text-muted font-body">Miembros</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-accent">👑</div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-text-base leading-none truncate">{adminNombre}</p>
              <p className="text-[10px] uppercase tracking-wider text-text-muted font-body">Admin</p>
            </div>
          </div>
        </div>

        {/* Status Badge / Action */}
        <div className="mt-6">
          {!esMiembro ? (
            <JoinGroupFlow grupoId={id} grupoNombre={grupo.nombre} />
          ) : (
            <div className="flex items-center justify-between p-3 bg-bg border border-border rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-xs">●</span>
                <span className="text-xs font-body text-text-base">Eres {esAdmin ? 'Administrador' : 'Miembro'}</span>
              </div>
              {!esAdmin && (
                <form action={async () => { 'use server'; await leaveGroup(id); redirect('/grupos') }}>
                  <button type="submit" className="text-xs text-red-400 hover:text-red-300 font-body px-2 py-1">Salir</button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Group Content Tabs (Simple toggle) */}
      <div className="space-y-6">
        <GrupoChat 
          grupoId={id} 
          userId={user.id} 
          esMiembro={esMiembro} 
          grupoNombre={grupo.nombre} 
        />
        
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="font-display font-bold text-text-base mb-4 flex items-center gap-2">
            📸 Galería de la Comunidad
          </h2>
          <GrupoFotos
            grupoId={id}
            userId={user.id}
            esMiembro={esMiembro}
            initialFotos={fotos}
          />
        </div>
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
