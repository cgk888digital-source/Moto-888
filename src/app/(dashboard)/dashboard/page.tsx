import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getMisMotos, getProfile } from '@/features/motos/queries'
import { MotoCard } from '@/features/motos/components/MotoCard'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [motos, profile] = await Promise.all([getMisMotos(), getProfile()])

  // Si no tiene motos, llevar al onboarding
  if (motos.length === 0) redirect('/onboarding')

  const nombre = profile?.nombre ?? user.email?.split('@')[0] ?? 'Rider'

  return (
    <div className="animate-fade-in">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-text-base uppercase tracking-wide">
          Hola, {nombre}
        </h1>
        <p className="text-text-muted font-body text-sm mt-1">
          {motos.length === 1
            ? 'Tienes 1 moto registrada'
            : `Tienes ${motos.length} motos registradas`}
        </p>
      </div>

      {/* Motos */}
      <div className="space-y-6">
        {motos.map(moto => (
          <MotoCard key={moto.id} moto={moto} />
        ))}
      </div>

      {/* Add another */}
      <div className="mt-8">
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-2 text-text-muted hover:text-accent text-sm font-body transition-colors"
        >
          <span className="text-lg">+</span>
          Añadir otra moto
        </Link>
      </div>

      {/* Plan badge */}
      <div className="mt-12 p-4 bg-surface border border-border rounded-xl flex items-center justify-between">
        <div>
          <p className="font-display font-semibold text-sm uppercase tracking-wide text-text-base">
            Plan {profile?.plan ?? 'Free'}
          </p>
          <p className="text-xs text-text-muted font-body mt-0.5">
            Diagnóstico IA y seguimiento básico incluido
          </p>
        </div>
        <button className="btn-primary text-xs px-4 py-2">
          Actualizar
        </button>
      </div>
    </div>
  )
}
