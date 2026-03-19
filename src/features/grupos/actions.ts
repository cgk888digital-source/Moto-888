'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createGrupo(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const nombre = (formData.get('nombre') as string)?.trim()
  const descripcion = (formData.get('descripcion') as string)?.trim()
  const tipo = formData.get('tipo') as string
  const categoria = (formData.get('categoria') as string)?.trim()

  if (!nombre) return { error: 'El nombre es requerido' }

  const { data, error } = await supabase.from('grupos').insert({
    admin_id: user.id,
    nombre,
    descripcion,
    tipo: tipo || 'publico',
    categoria,
  }).select('id').single()

  if (error || !data) return { error: error?.message ?? 'Error al crear grupo' }

  // Auto-unirse como admin
  await supabase.from('grupo_miembros').insert({
    grupo_id: data.id,
    user_id: user.id,
    rol: 'admin',
  })

  revalidatePath('/grupos')
  redirect(`/grupos/${data.id}`)
}

export async function updateGrupo(grupoId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const nombre = (formData.get('nombre') as string)?.trim()
  const descripcion = (formData.get('descripcion') as string)?.trim()
  const tipo = formData.get('tipo') as string
  const categoria = (formData.get('categoria') as string)?.trim()

  if (!nombre) return { error: 'El nombre es requerido' }

  const { error } = await supabase
    .from('grupos')
    .update({ nombre, descripcion, tipo: tipo || 'publico', categoria: categoria || null })
    .eq('id', grupoId)
    .eq('admin_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/grupos/${grupoId}`)
  revalidatePath('/grupos')
  redirect(`/grupos/${grupoId}`)
}

export async function toggleMembership(grupoId: string, isMiembro: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  if (isMiembro) {
    await supabase.from('grupo_miembros').delete().match({ grupo_id: grupoId, user_id: user.id })
    await supabase.rpc('decrement_miembros', { grupo_id: grupoId })
  } else {
    await supabase.from('grupo_miembros').insert({ grupo_id: grupoId, user_id: user.id, rol: 'miembro' })
    await supabase.rpc('increment_miembros', { grupo_id: grupoId })
  }
  revalidatePath(`/grupos/${grupoId}`)
  revalidatePath('/grupos')
}
