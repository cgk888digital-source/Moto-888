import { createClient } from '@/lib/supabase/server'
import type { Post } from './types'

export async function getFeedPosts(userId: string): Promise<Post[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .select(`
      id, user_id, tipo, contenido, fotos, ref_id,
      likes_count, comentarios_count, created_at,
      autor:users!posts_user_id_fkey(nombre, email),
      liked:post_likes!left(user_id)
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error || !data) return []

  return data.map((p: any) => ({
    ...p,
    autor: Array.isArray(p.autor) ? p.autor[0] : p.autor,
    liked_by_me: Array.isArray(p.liked) && p.liked.some((l: any) => l.user_id === userId),
  }))
}

export async function getPostComentarios(postId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('post_comentarios')
    .select('id, contenido, created_at, autor:users!post_comentarios_user_id_fkey(nombre)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
  return data ?? []
}
