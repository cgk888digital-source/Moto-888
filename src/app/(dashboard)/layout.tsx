import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/features/auth/actions'
import { getProfile } from '@/features/motos/queries'
import Link from 'next/link'

const NAV = [
  { href: '/dashboard',    label: 'Mi Moto',  icon: '🏍️' },
  { href: '/feed',         label: 'Feed',     icon: '📡' },
  { href: '/marketplace',  label: 'Market',   icon: '🛒' },
  { href: '/grupos',       label: 'Grupos',   icon: '👥' },
  { href: '/eventos',      label: 'Eventos',  icon: '📅' },
  { href: '/rutas',        label: 'Rutas',    icon: '🗺️' },
  { href: '/roadguardian', label: 'Guard',    icon: '🛡️' },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getProfile()

  return (
    <div className="min-h-dvh bg-bg">
      {/* Top header */}
      <header className="border-b border-border bg-surface sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="font-display text-xl font-bold tracking-widest text-accent uppercase">
            Biker<span className="text-text-base">Brain</span>
            <span className="text-xs text-text-muted font-body normal-case tracking-normal ml-1">888</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/perfil" className="text-text-muted hover:text-accent text-sm font-body hidden sm:block transition-colors truncate max-w-[140px]">
              {profile?.nombre ?? user.email}
            </Link>
            <form action={signOut}>
              <button type="submit" className="text-xs text-text-muted hover:text-accent transition-colors font-body uppercase tracking-wider min-h-[44px] min-w-[44px] flex items-center justify-end">
                Salir
              </button>
            </form>
          </div>
        </div>

        {/* Desktop tab nav — hidden on mobile */}
        <div className="hidden md:flex max-w-5xl mx-auto px-4 gap-1 overflow-x-auto scrollbar-none">
          {NAV.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-body text-text-muted hover:text-accent whitespace-nowrap border-b-2 border-transparent hover:border-accent transition-colors"
            >
              <span>{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </header>

      {/* Main — extra bottom padding on mobile for bottom nav */}
      <main className="max-w-5xl mx-auto px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>

      {/* Mobile bottom nav — hidden on md+ */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-surface border-t border-border md:hidden safe-area-inset-bottom">
        <div className="flex items-stretch h-16">
          {NAV.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center flex-1 gap-0.5 text-text-muted hover:text-accent active:text-accent transition-colors min-w-0 py-1"
            >
              <span className="text-xl leading-none">{icon}</span>
              <span className="text-[9px] font-body leading-tight truncate w-full text-center px-0.5">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
