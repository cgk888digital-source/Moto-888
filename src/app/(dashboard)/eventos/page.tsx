import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getEventos } from '@/features/eventos/queries'
import { EventoCard } from '@/features/eventos/components/EventoCard'
import { EventoForm } from '@/features/eventos/components/EventoForm'

export default async function EventosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const eventos = await getEventos()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="font-display text-2xl font-bold text-text-base tracking-wide uppercase">
        Rodadas <span className="text-accent">& Eventos</span>
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <EventoForm />
        </div>

        <div className="md:col-span-2 space-y-3">
          {eventos.length === 0 ? (
            <div className="text-center py-16 text-text-muted font-body">
              <p className="text-4xl mb-3">🗺️</p>
              <p className="text-sm">No hay rodadas programadas. ¡Organiza la primera!</p>
            </div>
          ) : (
            eventos.map((e: any) => <EventoCard key={e.id} evento={e} />)
          )}
        </div>
      </div>
    </div>
  )
}
