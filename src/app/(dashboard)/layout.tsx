import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/features/auth/actions'
import { getProfile } from '@/features/motos/queries'
import Link from 'next/link'

const NAV = [
  { href: '/dashboard',    label: 'Mi Moto',     icon: '🏍️' },
  { href: '/feed',         label: 'Feed',        icon: '📡' },
  { href: '/marketplace',  label: 'Marketplace', icon: '🛒' },
  { href: '/grupos',       label: 'Grupos',      icon: '👥' },
  { href: '/eventos',      label: 'Eventos',     icon: '🗺️' },
  { href: '/mapa',         label: 'Mapa',        icon: '📍' },
  { href: '/roadguardian', label: 'Guard',       icon: '🛡️' },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getProfile()

  return (
    <div className="min-h-screen bg-bg">
      {/* Top nav */}
      <header className="border-b border-border bg-surface sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="font-display text-xl font-bold tracking-widest text-accent uppercase">
            Biker<span className="text-text-base">Brain</span>
            <span className="text-xs text-text-muted font-body normal-case tracking-normal ml-1">888</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/perfil" className="text-text-muted hover:text-accent text-sm font-body hidden sm:block transition-colors">
              {profile?.nombre ?? user.email}
            </Link>
            <form action={signOut}>
              <button type="submit" className="text-xs text-text-muted hover:text-accent transition-colors font-body uppercase tracking-wider">
                Salir
              </button>
            </form>
          </div>
        </div>

        {/* Bottom nav tabs */}
        <div className="max-w-5xl mx-auto px-4 flex gap-1 overflow-x-auto scrollbar-none pb-0">
          {NAV.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-body text-text-muted hover:text-accent whitespace-nowrap border-b-2 border-transparent hover:border-accent transition-colors"
            >
              <span>{icon}</span>
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
