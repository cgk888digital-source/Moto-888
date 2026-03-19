import { createClient } from '@/lib/supabase/server'
import { Diagnostico } from './types'

export async function getDiagnosticosByMoto(moto_id: string): Promise<Diagnostico[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('diagnosticos')
    .select('*')
    .eq('moto_id', moto_id)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) return []
  return data ?? []
}
