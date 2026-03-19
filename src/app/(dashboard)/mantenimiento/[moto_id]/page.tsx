import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getMantenimientosByMoto } from '@/features/mantenimientos/queries'
import { MantenimientoPageClient } from '@/features/mantenimientos/components/MantenimientoPageClient'
import Link from 'next/link'

interface Props {
  params: Promise<{ moto_id: string }>
}

export default async function MantenimientoPage({ params }: Props) {
  const { moto_id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: moto } = await supabase
    .from('motos')
    .select('id, marca, modelo, ano, km_actuales')
    .eq('id', moto_id)
    .eq('user_id', user.id)
    .single()

  if (!moto) notFound()

  const mantenimientos = await getMantenimientosByMoto(moto_id)
  const motoNombre = `${moto.marca} ${moto.modelo} ${moto.ano}`

  // Calcular km del último servicio para el badge
  const ultimoServicio = mantenimientos[0] ?? null

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors font-body uppercase tracking-wider mb-4"
        >
          ← Dashboard
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-text-base uppercase tracking-wide">
              Mantenimiento
            </h1>
            <p className="text-text-muted font-body text-sm mt-1">
              {motoNombre} · {moto.km_actuales.toLocaleString()} km
            </p>
          </div>
          <div className="shrink-0 p-2 bg-surface border border-border rounded-xl">
            <span className="text-2xl">🔧</span>
          </div>
        </div>

        {/* Último servicio + próximo */}
        {ultimoServicio && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-surface border border-border rounded-xl px-4 py-3">
              <p className="text-xs text-text-muted font-body uppercase tracking-wider">Último servicio</p>
              <p className="text-sm font-body font-medium text-text-base mt-1">{ultimoServicio.tipo_servicio}</p>
              <p className="text-xs text-text-muted font-body">{ultimoServicio.km_al_servicio.toLocaleString()} km</p>
            </div>
            {ultimoServicio.proximo_km != null && (
              <div className={`border rounded-xl px-4 py-3 ${
                moto.km_actuales >= ultimoServicio.proximo_km
                  ? 'bg-red-400/10 border-red-400/30'
                  : 'bg-surface border-border'
              }`}>
                <p className="text-xs text-text-muted font-body uppercase tracking-wider">Próximo servicio</p>
                <p className="text-sm font-body font-medium text-text-base mt-1">
                  {ultimoServicio.proximo_km.toLocaleString()} km
                </p>
                <p className={`text-xs font-body ${
                  moto.km_actuales >= ultimoServicio.proximo_km ? 'text-red-400' : 'text-text-muted'
                }`}>
                  {moto.km_actuales >= ultimoServicio.proximo_km
                    ? '⚠ Vencido'
                    : `Faltan ${(ultimoServicio.proximo_km - moto.km_actuales).toLocaleString()} km`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <MantenimientoPageClient
        moto_id={moto_id}
        userId={user.id}
        kmActuales={moto.km_actuales}
        initialMantenimientos={mantenimientos}
      />
    </div>
  )
}
