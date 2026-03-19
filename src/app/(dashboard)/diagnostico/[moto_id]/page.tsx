import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getDiagnosticosByMoto } from '@/features/diagnosticos/queries'
import { DiagnosticoPageClient } from '@/features/diagnosticos/components/DiagnosticoPageClient'
import { getProfile } from '@/features/motos/queries'
import Link from 'next/link'

interface Props {
  params: Promise<{ moto_id: string }>
}

export default async function DiagnosticoPage({ params }: Props) {
  const { moto_id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: moto } = await supabase
    .from('motos')
    .select('id, marca, modelo, ano, km_actuales')
    .eq('id', moto_id)
    .eq('user_id', user.id)
    .single()

  if (!moto) notFound()

  const [diagnosticos, profile] = await Promise.all([
    getDiagnosticosByMoto(moto_id),
    getProfile(),
  ])

  const motoNombre = `${moto.marca} ${moto.modelo} ${moto.ano}`
  const plan = profile?.plan ?? 'free'

  if (plan === 'free') {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-5xl mb-6">🔒</div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-text-base mb-3">
          Diagnóstico IA — Plan Pro
        </h1>
        <p className="text-text-muted font-body text-sm max-w-sm mb-8 leading-relaxed">
          El diagnóstico avanzado con IA está disponible en el plan Pro. Actualizá tu plan para obtener soluciones técnicas precisas para tu {motoNombre}.
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
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors font-body uppercase tracking-wider mb-4"
        >
          ← Dashboard
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-text-base uppercase tracking-wide">
              Diagnóstico IA
            </h1>
            <p className="text-text-muted font-body text-sm mt-1">
              {motoNombre} · {moto.km_actuales.toLocaleString()} km
            </p>
          </div>
          <div className="shrink-0 p-2 bg-accent/10 border border-accent/30 rounded-xl">
            <span className="text-2xl">⚡</span>
          </div>
        </div>
      </div>

      <DiagnosticoPageClient
        moto_id={moto_id}
        motoNombre={motoNombre}
        initialDiagnosticos={diagnosticos}
      />
    </div>
  )
}
