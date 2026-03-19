import { createClient } from '@/lib/supabase/server'
import { Mantenimiento } from './types'

export async function getMantenimientosByMoto(moto_id: string): Promise<Mantenimiento[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('mantenimientos')
    .select('*')
    .eq('moto_id', moto_id)
    .order('fecha', { ascending: false })

  if (error) return []
  return data ?? []
}
