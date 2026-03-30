import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RoadGuardianClient } from './RoadGuardianClient'

export default async function RoadGuardianPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: contactos }, { data: alertas }] = await Promise.all([
    supabase.from('roadguardian_contactos').select('*').eq('user_id', user.id).order('orden'),
    supabase.from('roadguardian_alertas').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
  ])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-start gap-3">
        <div className="h-7 w-1 rounded-full bg-secondary mt-1" />
        <div>
          <h1 className="font-display text-2xl font-bold text-text-base tracking-wide uppercase">
            Road<span className="text-secondary">Guardian</span>
          </h1>
          <p className="text-sm text-text-muted font-body mt-1">
            Detección de caída automática. Si caés, tus contactos de emergencia reciben tu ubicación GPS.
          </p>
        </div>
      </div>
      <RoadGuardianClient contactos={contactos ?? []} alertas={alertas ?? []} userId={user.id} />
    </div>
  )
}
