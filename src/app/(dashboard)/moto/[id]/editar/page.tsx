import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { EditarMotoForm } from './EditarMotoForm'

export default async function EditarMotoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: moto } = await supabase
    .from('motos')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!moto) notFound()

  return (
    <div className="animate-fade-in max-w-lg mx-auto space-y-6">
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors font-body uppercase tracking-wider mb-4">
          ← Dashboard
        </Link>
        <h1 className="font-display text-3xl font-bold text-text-base uppercase tracking-wide">
          Editar moto
        </h1>
        <p className="text-text-muted text-sm font-body mt-1">
          {moto.marca} {moto.modelo} {moto.ano}
        </p>
      </div>

      <EditarMotoForm moto={moto} />
    </div>
  )
}
