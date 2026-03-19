'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const contenido = formData.get('contenido') as string
  if (!contenido?.trim()) return { error: 'El post no puede estar vacío' }

  const { error } = await supabase.from('posts').insert({
    user_id: user.id,
    tipo: 'general',
    contenido: contenido.trim(),
  })

  if (error) return { error: error.message }
  revalidatePath('/feed')
  return { success: true }
}

export async function toggleLike(postId: string, liked: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  if (liked) {
    await supabase.from('post_likes').delete().match({ post_id: postId, user_id: user.id })
    await supabase.rpc('decrement_likes', { post_id: postId })
  } else {
    await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id })
    await supabase.rpc('increment_likes', { post_id: postId })
  }
  revalidatePath('/feed')
}

export async function addComentario(postId: string, contenido: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !contenido.trim()) return { error: 'Inválido' }

  const { error } = await supabase.from('post_comentarios').insert({
    post_id: postId,
    user_id: user.id,
    contenido: contenido.trim(),
  })
  if (error) return { error: error.message }

  await supabase.rpc('increment_comentarios', { post_id: postId })
  revalidatePath('/feed')
  return { success: true }
}
