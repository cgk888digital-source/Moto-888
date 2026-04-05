import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/features/auth/actions'
import { getProfile } from '@/features/motos/queries'
import { DashboardNavigation } from '@/components/DashboardNavigation'
import Link from 'next/link'
import Image from 'next/image'

// Navigation moved to DashboardNavigation.tsx

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getProfile()

  return (
    <div className="min-h-dvh bg-bg">
      {/* Top header */}
      <header className="border-b border-border bg-surface sticky top-0 z-20 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 h-24 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Bikevzla 888" width={280} height={205} className="h-16 w-auto object-contain" priority />
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/perfil" className="text-text-muted hover:text-[#00e5ff] text-[10px] font-display font-black uppercase tracking-wider hidden sm:block transition-colors truncate max-w-[140px]">
              {profile?.nombre ?? user.email}
            </Link>
            <form action={signOut}>
              <button type="submit" className="text-[10px] text-text-muted hover:text-white border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-md transition-colors font-display font-black uppercase tracking-[0.2em] min-h-[44px] flex items-center justify-center">
                SALIR
              </button>
            </form>
          </div>
        </div>

        <DashboardNavigation />
      </header>

      {/* Main — extra bottom padding on mobile for bottom nav */}
      <main className="max-w-5xl mx-auto px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>
    </div>
  )
}
