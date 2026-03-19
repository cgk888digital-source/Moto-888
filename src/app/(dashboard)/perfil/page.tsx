import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getProfile, getMisMotos } from '@/features/motos/queries'
import { PerfilForm } from '@/features/auth/components/PerfilForm'
import { signOut } from '@/features/auth/actions'
import Link from 'next/link'

const PLAN_CONFIG = {
  free: {
    label: 'Free',
    color: 'text-text-muted',
    bg: 'bg-surface border-border',
    features: ['Registro de moto', 'Historial de mantenimientos', '3 diagnósticos IA / mes'],
  },
  pro: {
    label: 'Pro',
    color: 'text-accent',
    bg: 'bg-accent/10 border-accent/30',
    features: ['Todo lo de Free', 'Chat IA ilimitado', 'Fotos ilimitadas', 'Alertas de mantenimiento'],
  },
  fleet: {
    label: 'Fleet',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10 border-purple-400/30',
    features: ['Todo lo de Pro', 'Múltiples motos', 'Panel de flota', 'Acceso a talleres'],
  },
}

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profile, motos] = await Promise.all([getProfile(), getMisMotos()])
  const plan = (profile?.plan ?? 'free') as keyof typeof PLAN_CONFIG
  const planCfg = PLAN_CONFIG[plan]

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors font-body uppercase tracking-wider mb-4"
        >
          ← Dashboard
        </Link>
        <h1 className="font-display text-3xl font-bold text-text-base uppercase tracking-wide">
          Mi perfil
        </h1>
      </div>

      {/* Plan actual */}
      <section className={`border rounded-2xl p-6 ${planCfg.bg}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-text-muted font-body uppercase tracking-wider">Plan actual</p>
            <p className={`font-display text-2xl font-bold uppercase tracking-wide mt-1 ${planCfg.color}`}>
              {planCfg.label}
            </p>
          </div>
          {plan === 'free' && (
            <Link href="/checkout" className="btn-primary text-xs px-4 py-2">
              Actualizar a Pro
            </Link>
          )}
        </div>
        <ul className="space-y-1">
          {planCfg.features.map(f => (
            <li key={f} className="flex items-center gap-2 text-sm font-body text-text-muted">
              <span className={`text-xs ${planCfg.color}`}>✓</span>
              {f}
            </li>
          ))}
        </ul>
      </section>

      {/* Stats rápidos */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface border border-border rounded-xl px-4 py-4">
          <p className="text-xs text-text-muted font-body uppercase tracking-wider">Motos</p>
          <p className="font-display text-2xl font-bold text-text-base mt-1">{motos.length}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl px-4 py-4">
          <p className="text-xs text-text-muted font-body uppercase tracking-wider">Miembro desde</p>
          <p className="font-display text-sm font-bold text-text-base mt-1">
            {new Date(profile?.created_at ?? user.created_at).toLocaleDateString('es-ES', {
              month: 'short', year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Datos personales */}
      <section className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="font-display font-bold text-sm uppercase tracking-wide text-text-base mb-6">
          Datos personales
        </h2>
        <PerfilForm
          userId={user.id}
          initialNombre={profile?.nombre ?? ''}
          email={user.email ?? ''}
        />
      </section>

      {/* Cerrar sesión */}
      <section className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="font-display font-bold text-sm uppercase tracking-wide text-text-base mb-4">
          Sesión
        </h2>
        <form action={signOut}>
          <button
            type="submit"
            className="btn-ghost text-red-400 border-red-400/30 hover:border-red-400 hover:text-red-300"
          >
            Cerrar sesión
          </button>
        </form>
      </section>
    </div>
  )
}
