import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getEvento, getAsistencia } from '@/features/eventos/queries'
import { EventoAsistencia } from './EventoAsistencia'

export default async function EventoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [evento, asistencia] = await Promise.all([
    getEvento(id),
    getAsistencia(id, user.id),
  ])

  if (!evento) notFound()

  const esCreador = (evento as any).creador_id === user.id
  const creadorNombre = (evento as any).creador?.nombre ?? 'Organizador'
  const fecha = new Date(evento.fecha_hora)
  const fechaStr = fecha.toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  const horaStr = fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  const yaFue = fecha < new Date()
  const cuposRestantes = evento.cupos_max ? evento.cupos_max - (evento.voy_count ?? 0) : null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-secondary-muted flex items-center justify-center text-3xl flex-shrink-0">
            🏍️
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-2xl font-bold text-text-base tracking-wide">
                {evento.titulo}
              </h1>
              {esCreador && (
                <Link
                  href={`/eventos/${id}/editar`}
                  className="ml-auto p-1.5 rounded-lg text-text-muted hover:text-secondary hover:bg-secondary-muted transition-colors"
                  title="Editar evento"
                >
                  ✏️
                </Link>
              )}
              {yaFue ? (
                <span className="text-xs px-2 py-0.5 rounded-full font-body bg-border text-text-muted">
                  Finalizado
                </span>
              ) : (
                <span className="text-xs px-2 py-0.5 rounded-full font-body bg-green-900/40 text-green-400">
                  Próximamente
                </span>
              )}
            </div>
            <p className="text-sm text-text-muted font-body mt-1">por {creadorNombre}</p>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-2 pt-4 border-t border-border">
          <div className="flex items-center gap-3 text-sm font-body text-text-muted">
            <span className="text-lg">📅</span>
            <span className="capitalize">{fechaStr} · {horaStr}</span>
          </div>
          {evento.punto_partida && (
            <div className="flex items-center gap-3 text-sm font-body text-text-muted">
              <span className="text-lg">📍</span>
              <span>{evento.punto_partida}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm font-body text-text-muted">
            <span className="text-lg">✅</span>
            <span>
              {evento.voy_count ?? 0} confirmados
              {cuposRestantes !== null && (
                <span className={`ml-2 ${cuposRestantes <= 3 ? 'text-red-400' : 'text-text-muted'}`}>
                  · {cuposRestantes > 0 ? `${cuposRestantes} cupos disponibles` : 'Sin cupos'}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Descripcion */}
        {evento.descripcion && (
          <p className="text-sm text-text-muted font-body leading-relaxed pt-2 border-t border-border">
            {evento.descripcion}
          </p>
        )}

        {/* GPX */}
        {evento.ruta_gpx_url && (
          <a
            href={evento.ruta_gpx_url}
            download
            className="flex items-center gap-2 text-sm text-secondary hover:underline font-body"
          >
            🗺️ Descargar ruta GPX
          </a>
        )}

        {/* Asistencia */}
        {!yaFue && !esCreador && (
          <div className="pt-4 border-t border-border">
            <EventoAsistencia eventoId={id} anterior={asistencia} />
          </div>
        )}
        {esCreador && (
          <p className="text-center text-xs text-secondary font-body pt-2 border-t border-border">
            ⭐ Tú organizas este evento
          </p>
        )}
      </div>

      <Link
        href="/eventos"
        className="text-sm text-text-muted hover:text-secondary font-body transition-colors inline-block"
      >
        ← Volver a eventos
      </Link>
    </div>
  )
}
