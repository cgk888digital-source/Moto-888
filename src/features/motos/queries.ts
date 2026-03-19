import { createClient } from '@/lib/supabase/server'
import { Tables } from '@/types/database.types'

export async function getMisMotos(): Promise<Tables<'motos'>[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('motos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return []
  return data ?? []
}

export async function getProfile(): Promise<Tables<'users'> | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return data
}
