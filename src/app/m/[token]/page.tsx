import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import RegistroTallerForm from './RegistroTallerForm'

interface Props {
  params: Promise<{ token: string }>
}

export default async function PortalNFCPage({ params }: Props) {
  const { token } = await params
  const supabase = createServiceClient()

  // Fetch moto + último mantenimiento en paralelo (react-best-practices: Promise.all)
  const { data: moto } = await supabase
    .from('motos')
    .select('id, marca, modelo, ano, km_actuales, nfc_activado, taller_acceso, kit_tipo')
    .eq('nfc_token', token)
    .single()

  if (!moto) notFound()

  const { data: ultimoServicio } = await supabase
    .from('mantenimientos')
    .select('tipo_servicio, fecha, km_al_servicio, taller')
    .eq('moto_id', moto.id)
    .order('fecha', { ascending: false })
    .limit(1)
    .maybeSingle()

  const motoLabel = `${moto.marca} ${moto.modelo} ${moto.ano}`

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-8">
      <div className="mx-auto max-w-md space-y-6">

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10">
            <svg className="h-7 w-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="font-display text-xl font-bold text-white">Portal Mecánico</h1>
          <p className="text-sm text-zinc-500">MotoVerse NFC</p>
        </div>

        {/* Moto card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
              <svg className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-lg font-bold text-white">{motoLabel}</h2>
              <p className="text-sm text-zinc-400">{moto.km_actuales.toLocaleString()} km registrados</p>
            </div>
          </div>

          {ultimoServicio && (
            <div className="mt-4 rounded-lg bg-zinc-800/60 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Último servicio</p>
              <p className="mt-1 text-sm font-medium text-zinc-200">{ultimoServicio.tipo_servicio}</p>
              <p className="text-xs text-zinc-500">
                {new Date(ultimoServicio.fecha).toLocaleDateString('es-VE', { day: 'numeric', month: 'long', year: 'numeric' })}
                {ultimoServicio.km_al_servicio && ` · ${ultimoServicio.km_al_servicio.toLocaleString()} km`}
                {ultimoServicio.taller && ` · ${ultimoServicio.taller}`}
              </p>
            </div>
          )}

          {!ultimoServicio && (
            <div className="mt-4 rounded-lg bg-zinc-800/60 p-3">
              <p className="text-xs text-zinc-500">Sin servicios registrados aún</p>
            </div>
          )}
        </div>

        {/* Sección de registro */}
        {!moto.nfc_activado && (
          <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5 text-center">
            <p className="text-sm text-zinc-400">Este NFC aún no ha sido activado por el dueño.</p>
          </div>
        )}

        {moto.nfc_activado && !moto.taller_acceso && (
          <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5 text-center">
            <p className="text-sm font-medium text-zinc-300">Acceso no habilitado</p>
            <p className="mt-1 text-sm text-zinc-500">El dueño no ha habilitado el registro por taller. Pedile que lo active desde la app.</p>
          </div>
        )}

        {moto.nfc_activado && moto.taller_acceso && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <h3 className="mb-4 font-semibold text-white">Registrar servicio</h3>
            <RegistroTallerForm
              token={token}
              motoLabel={motoLabel}
              kmActuales={moto.km_actuales}
            />
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-zinc-600">
          MotoVerse · El mundo completo de tu moto
        </p>
      </div>
    </div>
  )
}
