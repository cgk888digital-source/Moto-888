import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getMensajesThread } from '@/features/marketplace/queries'
import { ChatThread } from './ChatThread'
import Link from 'next/link'

export default async function ChatThreadPage({
  params,
  searchParams,
}: {
  params: Promise<{ productoId: string }>
  searchParams: Promise<{ con?: string }>
}) {
  const { productoId } = await params
  const { con: otroUserId } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (!otroUserId) redirect('/marketplace/mensajes')

  const [mensajes, productoRes, otroUserRes] = await Promise.all([
    getMensajesThread(productoId, user.id, otroUserId),
    supabase.from('marketplace_productos').select('id, titulo').eq('id', productoId).single(),
    supabase.from('users').select('nombre, email').eq('id', otroUserId).single(),
  ])

  if (!productoRes.data) notFound()

  const otroNombre = otroUserRes.data?.nombre ?? otroUserRes.data?.email ?? 'Usuario'

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link href="/marketplace/mensajes" className="text-sm text-text-muted hover:text-accent font-body transition-colors">
        ← Mis mensajes
      </Link>

      <ChatThread
        productoId={productoId}
        otroUserId={otroUserId}
        userId={user.id}
        productoTitulo={productoRes.data.titulo}
        otroNombre={otroNombre}
        initialMensajes={mensajes as any}
      />
    </div>
  )
}
