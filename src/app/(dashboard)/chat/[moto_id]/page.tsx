import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getProfile } from '@/features/motos/queries'
import { ChatPageClient } from '@/features/chat/components/ChatPageClient'
import Link from 'next/link'

interface Props {
  params: Promise<{ moto_id: string }>
}

export default async function ChatPage({ params }: Props) {
  const { moto_id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [motoResult, profile] = await Promise.all([
    supabase
      .from('motos')
      .select('id, marca, modelo, ano')
      .eq('id', moto_id)
      .eq('user_id', user.id)
      .single(),
    getProfile(),
  ])

  if (!motoResult.data) notFound()
  const moto = motoResult.data
  const motoNombre = `${moto.marca} ${moto.modelo} ${moto.ano}`

  // Gate: solo Pro y Fleet
  const plan = profile?.plan ?? 'free'
  if (plan === 'free') {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-5xl mb-6">🔒</div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-text-base mb-3">
          Chat IA — Plan Pro
        </h1>
        <p className="text-text-muted font-body text-sm max-w-sm mb-8 leading-relaxed">
          El chat con IA ilimitado está disponible en el plan Pro. Actualizá tu plan para diagnosticar tu {motoNombre} sin límites.
        </p>
        <Link href="/checkout" className="btn-primary px-8 py-3">
          Actualizar a Pro — $9/mes
        </Link>
        <Link href="/dashboard" className="mt-4 text-xs text-text-muted hover:text-accent font-body transition-colors">
          Volver al dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-fade-in flex flex-col h-full -mx-4 -my-8">
      {/* Back link */}
      <div className="px-4 pt-4 pb-2 shrink-0">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors font-body uppercase tracking-wider"
        >
          ← Dashboard
        </Link>
      </div>

      <ChatPageClient moto_id={moto_id} motoNombre={motoNombre} />
    </div>
  )
}
