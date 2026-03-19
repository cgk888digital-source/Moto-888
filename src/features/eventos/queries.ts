import { createClient } from '@/lib/supabase/server'

export async function getEventos() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('eventos')
    .select(`
      id, titulo, descripcion, fecha_hora, punto_partida,
      cupos_max, voy_count, estado, ruta_gpx_url, created_at,
      creador:users!eventos_creador_id_fkey(nombre)
    `)
    .eq('estado', 'activo')
    .gte('fecha_hora', new Date().toISOString())
    .order('fecha_hora', { ascending: true })
  return data ?? []
}

export async function getEvento(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('eventos')
    .select(`
      *, creador:users!eventos_creador_id_fkey(nombre, email)
    `)
    .eq('id', id)
    .single()
  return data
}

export async function getAsistencia(eventoId: string, userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('evento_asistentes')
    .select('respuesta')
    .match({ evento_id: eventoId, user_id: userId })
    .single()
  return data?.respuesta ?? null
}
