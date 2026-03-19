import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MapaClient } from './MapaClient'

export default async function MapaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: pois } = await supabase
    .from('pois')
    .select('id, nombre, tipo, lat, lng, direccion, telefono, verificado, rating')
    .order('verificado', { ascending: false })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-text-base tracking-wide uppercase">
          Mapa <span className="text-accent">POI</span>
        </h1>
        <span className="text-xs text-text-muted font-body">{pois?.length ?? 0} puntos registrados</span>
      </div>
      <MapaClient pois={pois ?? []} userId={user.id} />
    </div>
  )
}
