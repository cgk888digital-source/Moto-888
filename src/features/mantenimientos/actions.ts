'use server'

import { createClient } from '@/lib/supabase/server'
import { TablesInsert } from '@/types/database.types'

export async function createMantenimiento(
  data: Omit<TablesInsert<'mantenimientos'>, 'moto_id'> & { moto_id: string }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // Verificar que la moto pertenece al usuario
  const { data: moto } = await supabase
    .from('motos')
    .select('id')
    .eq('id', data.moto_id)
    .eq('user_id', user.id)
    .single()

  if (!moto) return { error: 'Moto no encontrada' }

  const { data: mantenimiento, error } = await supabase
    .from('mantenimientos')
    .insert(data)
    .select()
    .single()

  if (error) return { error: error.message }
  return { mantenimiento }
}
