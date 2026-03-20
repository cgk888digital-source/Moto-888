import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GrabarRutaClient } from './GrabarRutaClient'

export default async function GrabarRutaPage({ searchParams }: { searchParams: Promise<{ ruta_id?: string }> }) {
  const { ruta_id } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="animate-fade-in">
      <GrabarRutaClient rutaId={ruta_id ?? null} userId={user.id} />
    </div>
  )
}
