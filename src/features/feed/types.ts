export type PostTipo = 'general' | 'ruta' | 'evento' | 'marketplace'

export interface Post {
  id: string
  user_id: string
  tipo: PostTipo
  contenido: string | null
  fotos: string[] | null
  ref_id: string | null
  likes_count: number
  comentarios_count: number
  created_at: string
  autor: { nombre: string | null; email: string }
  liked_by_me: boolean
}

export interface PostComentario {
  id: string
  post_id: string
  user_id: string
  contenido: string
  created_at: string
  autor: { nombre: string | null }
}
