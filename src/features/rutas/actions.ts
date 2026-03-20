'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createRuta(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const titulo = formData.get('titulo') as string
  const descripcion = (formData.get('descripcion') as string) || null
  const distancia_km = formData.get('distancia_km') ? Number(formData.get('distancia_km')) : null
  const dificultad = (formData.get('dificultad') as string) || null
  const tipo_terreno = (formData.get('tipo_terreno') as string) || null
  const estado_region = (formData.get('estado_region') as string) || null

  const { data, error } = await supabase
    .from('rutas')
    .insert({ user_id: user.id, titulo, descripcion, distancia_km, dificultad, tipo_terreno, estado_region })
    .select('id')
    .single()

  if (error || !data) return { error: error?.message ?? 'Error al crear la ruta' }
  redirect(`/rutas/${data.id}`)
}

export async function guardarTelemetria(payload: {
  ruta_id: string | null
  distancia_km: number
  duracion_seg: number
  velocidad_max: number
  velocidad_prom: number
  lean_angle_max: number
  gpx_url: string | null
  roadguardian_activo: boolean
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('telemetria_rutas').insert({ user_id: user.id, ...payload })
  if (error) return { error: error.message }
  return { ok: true }
}

export async function addComentarioRuta(rutaId: string, contenido: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  await supabase.from('rutas_comentarios').insert({ ruta_id: rutaId, user_id: user.id, contenido })
  revalidatePath(`/rutas/${rutaId}`)
}
