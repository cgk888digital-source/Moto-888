import { createClient } from '@/lib/supabase/server'

export async function getGrupos() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('grupos')
    .select('id, nombre, descripcion, tipo, categoria, foto_url, miembros_count, created_at, admin_id')
    .eq('tipo', 'publico')
    .order('miembros_count', { ascending: false })
  return data ?? []
}

export async function getGrupo(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('grupos')
    .select('*, admin:users!grupos_admin_id_fkey(nombre)')
    .eq('id', id)
    .single()
  return data
}

export async function getMisGrupos(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('grupo_miembros')
    .select('grupo:grupos(id, nombre, foto_url, miembros_count)')
    .eq('user_id', userId)
  return data?.map((d: any) => d.grupo) ?? []
}

export async function isMiembro(grupoId: string, userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('grupo_miembros')
    .select('user_id')
    .match({ grupo_id: grupoId, user_id: userId })
    .single()
  return !!data
}
