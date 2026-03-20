import { createClient } from '@/lib/supabase/server'

export async function getRutas({ userId }: { userId?: string } = {}) {
  const supabase = await createClient()
  let query = supabase
    .from('rutas')
    .select('id, titulo, descripcion, distancia_km, dificultad, tipo_terreno, estado_region, likes_count, created_at, user_id')
    .order('created_at', { ascending: false })
    .limit(30)

  if (userId) query = query.eq('user_id', userId)
  const { data } = await query
  return data ?? []
}

export async function getRuta(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('rutas')
    .select('*')
    .eq('id', id)
    .single()
  return data
}

export async function getRutaMedia(rutaId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('rutas_media')
    .select('*')
    .eq('ruta_id', rutaId)
    .order('orden', { ascending: true })
  return data ?? []
}

export async function getRutaComentarios(rutaId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('rutas_comentarios')
    .select('id, contenido, created_at, user_id')
    .eq('ruta_id', rutaId)
    .order('created_at', { ascending: true })
  return data ?? []
}

export async function getTelemetriaByRuta(rutaId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('telemetria_rutas')
    .select('*')
    .eq('ruta_id', rutaId)
    .order('created_at', { ascending: false })
  return data ?? []
}
