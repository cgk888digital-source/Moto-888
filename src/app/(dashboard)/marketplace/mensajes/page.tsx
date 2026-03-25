import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getMisConversaciones } from '@/features/marketplace/queries'
import Link from 'next/link'

function timeAgo(ts: string | null) {
  if (!ts) return ''
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Ahora'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d`
  return new Date(ts).toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

export default async function MensajesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const conversaciones = await getMisConversaciones(user.id)

  // Get names for all other users in one query
  const otroIds = [...new Set(conversaciones.map((c: any) => c.otro_user_id))]
  const { data: otrosUsers } = otroIds.length > 0
    ? await supabase.from('users').select('id, nombre, email').in('id', otroIds)
    : { data: [] }

  const userMap = Object.fromEntries((otrosUsers ?? []).map((u: any) => [u.id, u.nombre ?? u.email ?? 'Usuario']))

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-text-base">Mensajes</h1>
        <Link href="/marketplace" className="text-sm text-text-muted hover:text-accent font-body transition-colors">
          ← Marketplace
        </Link>
      </div>

      {conversaciones.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-text-muted font-body text-sm">No tienes mensajes aún</p>
          <Link href="/marketplace" className="mt-4 inline-block text-accent text-sm font-body hover:underline">
            Explorar marketplace
          </Link>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl divide-y divide-border overflow-hidden">
          {conversaciones.map((conv: any) => {
            const otroNombre = userMap[conv.otro_user_id] ?? 'Usuario'
            const esNoLeido = !conv.leido && conv.destinatario_id === user.id
            const foto = conv.producto?.fotos?.[0]

            return (
              <Link
                key={`${conv.producto_id}:${conv.otro_user_id}`}
                href={`/marketplace/mensajes/${conv.producto_id}?con=${conv.otro_user_id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-bg transition-colors"
              >
                {/* Product thumbnail */}
                <div className="w-12 h-12 rounded-lg bg-bg border border-border flex-shrink-0 overflow-hidden">
                  {foto ? (
                    <img src={foto} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl opacity-30">🔩</div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className={`text-sm font-body truncate ${esNoLeido ? 'font-bold text-text-base' : 'text-text-base'}`}>
                      {otroNombre}
                    </p>
                    <p className="text-[11px] text-text-muted font-body flex-shrink-0">{timeAgo(conv.created_at)}</p>
                  </div>
                  <p className="text-xs text-text-muted font-body truncate">{conv.producto?.titulo ?? 'Producto'}</p>
                  <p className={`text-xs font-body truncate mt-0.5 ${esNoLeido ? 'text-text-base font-medium' : 'text-text-muted'}`}>
                    {conv.remitente_id === user.id ? 'Tú: ' : ''}{conv.contenido}
                  </p>
                </div>

                {/* Unread dot */}
                {esNoLeido && (
                  <div className="w-2.5 h-2.5 rounded-full bg-accent flex-shrink-0" />
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
