import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getRuta, getRutaMedia, getRutaComentarios, getTelemetriaByRuta } from '@/features/rutas/queries'
import { addComentarioRuta } from '@/features/rutas/actions'
import Link from 'next/link'

const DIFICULTAD_COLOR: Record<string, string> = {
  facil: 'text-green-400 bg-green-400/10 border-green-400/20',
  media: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  dificil: 'text-red-400 bg-red-400/10 border-red-400/20',
}

function formatDuracion(seg: number) {
  const h = Math.floor(seg / 3600)
  const m = Math.floor((seg % 3600) / 60)
  return h > 0 ? `${h}h ${m}min` : `${m}min`
}

export default async function RutaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [ruta, media, comentarios, telemetria] = await Promise.all([
    getRuta(id),
    getRutaMedia(id),
    getRutaComentarios(id),
    getTelemetriaByRuta(id),
  ])

  if (!ruta) notFound()

  const esMia = ruta.user_id === user.id

  async function handleComentario(formData: FormData) {
    'use server'
    const contenido = formData.get('contenido') as string
    if (!contenido?.trim()) return
    await addComentarioRuta(id, contenido.trim())
  }

  return (
    <div className="animate-fade-in space-y-6 max-w-2xl mx-auto">
      {/* Back */}
      <Link href="/rutas" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors font-body uppercase tracking-wider">
        ← Rutas
      </Link>

      {/* Header */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h1 className="font-display text-2xl font-bold text-text-base uppercase tracking-wide">
            {ruta.titulo}
          </h1>
          {esMia && (
            <Link href={`/rutas/${id}/editar`} className="text-text-muted hover:text-accent transition-colors text-lg shrink-0" title="Editar ruta">
              ✏️
            </Link>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {ruta.dificultad && (
            <span className={`text-xs px-2 py-0.5 rounded-full border font-body ${DIFICULTAD_COLOR[ruta.dificultad] ?? 'text-text-muted border-border'}`}>
              {ruta.dificultad}
            </span>
          )}
          {ruta.tipo_terreno && (
            <span className="text-xs px-2 py-0.5 rounded-full border border-border text-text-muted font-body">
              🏔️ {ruta.tipo_terreno}
            </span>
          )}
          {ruta.estado_region && (
            <span className="text-xs px-2 py-0.5 rounded-full border border-border text-text-muted font-body">
              📌 {ruta.estado_region}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-bg border border-border rounded-lg px-3 py-3 text-center">
            <p className="font-display text-lg font-bold text-accent">{ruta.distancia_km ?? '—'}</p>
            <p className="text-xs text-text-muted font-body">km</p>
          </div>
          <div className="bg-bg border border-border rounded-lg px-3 py-3 text-center">
            <p className="font-display text-lg font-bold text-text-base">❤️ {ruta.likes_count ?? 0}</p>
            <p className="text-xs text-text-muted font-body">likes</p>
          </div>
          <div className="bg-bg border border-border rounded-lg px-3 py-3 text-center">
            <p className="font-display text-lg font-bold text-text-base">{comentarios.length}</p>
            <p className="text-xs text-text-muted font-body">comentarios</p>
          </div>
        </div>

        {ruta.descripcion && (
          <p className="text-text-muted font-body text-sm leading-relaxed">{ruta.descripcion}</p>
        )}

        {ruta.gpx_url && (
          <a href={ruta.gpx_url} download className="mt-4 inline-flex items-center gap-2 text-xs text-accent hover:underline font-body">
            ⬇️ Descargar GPX
          </a>
        )}
      </div>

      {/* Fotos */}
      {media.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-5">
          <h2 className="font-display font-bold text-text-base uppercase tracking-wide mb-4">Fotos</h2>
          <div className="grid grid-cols-3 gap-2">
            {media.map(m => (
              <img key={m.id} src={m.url} alt="" className="w-full aspect-square object-cover rounded-lg" />
            ))}
          </div>
        </div>
      )}

      {/* Telemetría */}
      {telemetria.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
          <h2 className="font-display font-bold text-text-base uppercase tracking-wide">Telemetría</h2>
          {telemetria.map(t => (
            <div key={t.id} className="bg-bg border border-border rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="text-center">
                <p className="font-display text-xl font-bold text-accent">{t.distancia_km?.toFixed(1) ?? '—'}</p>
                <p className="text-xs text-text-muted font-body">km</p>
              </div>
              <div className="text-center">
                <p className="font-display text-xl font-bold text-text-base">{t.velocidad_max?.toFixed(0) ?? '—'}</p>
                <p className="text-xs text-text-muted font-body">km/h max</p>
              </div>
              <div className="text-center">
                <p className="font-display text-xl font-bold text-text-base">{t.lean_angle_max?.toFixed(0) ?? '—'}°</p>
                <p className="text-xs text-text-muted font-body">lean angle</p>
              </div>
              <div className="text-center">
                <p className="font-display text-xl font-bold text-text-base">
                  {t.duracion_seg ? formatDuracion(t.duracion_seg) : '—'}
                </p>
                <p className="text-xs text-text-muted font-body">duración</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comentarios */}
      <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
        <h2 className="font-display font-bold text-text-base uppercase tracking-wide">Comentarios</h2>

        {comentarios.length === 0 ? (
          <p className="text-text-muted text-sm font-body">Sin comentarios aún. ¡Sé el primero!</p>
        ) : (
          <div className="space-y-3">
            {comentarios.map(c => (
              <div key={c.id} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-xs shrink-0 font-display">
                  {c.user_id.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 bg-bg border border-border rounded-lg px-3 py-2">
                  <p className="text-sm font-body text-text-base">{c.contenido}</p>
                  <p className="text-xs text-text-muted font-body mt-1">
                    {c.created_at ? new Date(c.created_at).toLocaleDateString('es-VE') : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <form action={handleComentario} className="flex gap-2 mt-2">
          <input name="contenido" required placeholder="Escribe un comentario..."
            className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base placeholder-text-muted focus:outline-none focus:border-accent font-body" />
          <button type="submit" className="btn-primary text-sm px-4 py-2 shrink-0">Enviar</button>
        </form>
      </div>

      {/* Botón grabar telemetría */}
      <div className="pb-4">
        <Link href={`/rutas/grabar?ruta_id=${id}`} className="btn-primary w-full text-center block">
          🎙 Grabar telemetría en esta ruta
        </Link>
      </div>
    </div>
  )
}
