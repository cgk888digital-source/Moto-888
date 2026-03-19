import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getVendedorByUserId } from '@/features/marketplace/queries'
import { VenderForm } from './VenderForm'

export default async function VenderPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const vendedor = await getVendedorByUserId(user.id)

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="font-display text-2xl font-bold text-text-base tracking-wide uppercase">
        {vendedor ? 'Publicar' : 'Empezar a vender'}
        <span className="text-accent"> en MotoVerse</span>
      </h1>
      <VenderForm vendedor={vendedor} />
    </div>
  )
}
