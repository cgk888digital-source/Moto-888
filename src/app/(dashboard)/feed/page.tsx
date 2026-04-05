import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getFeedPosts } from '@/features/feed/queries'
import { PostForm } from '@/features/feed/components/PostForm'
import { PostCard } from '@/features/feed/components/PostCard'
import type { Post } from '@/features/feed/types'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const posts = await getFeedPosts(user.id)

  const mockPosts: Post[] = [
    {
      id: 'mock-1',
      user_id: 'mock-user-1',
      tipo: 'ruta',
      contenido: '¡Excelente rodada hoy por El Jarillo! 🏍️💨 La neblina estuvo increíble y el clima perfecto. ¿Quién más se anima para el próximo domingo?',
      fotos: null,
      ref_id: null,
      likes_count: 12,
      comentarios_count: 3,
      created_at: new Date().toISOString(),
      autor: { nombre: 'Cesar Gonzalez', email: 'cesar@bikevzla.com' },
      liked_by_me: false,
    },
    {
      id: 'mock-2',
      user_id: 'mock-user-2',
      tipo: 'general',
      contenido: '¿Cada cuánto recomiendan cambiar el aceite semi-sintético en una V-Strom para el clima de Caracas? 🤔',
      fotos: null,
      ref_id: null,
      likes_count: 8,
      comentarios_count: 15,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      autor: { nombre: 'Andrés Morales', email: 'andres@rider.ve' },
      liked_by_me: true,
    },
    {
      id: 'mock-3',
      user_id: 'mock-user-3',
      tipo: 'marketplace',
      contenido: 'Vendo mi par de guantes Alpinestars talle L. Solo 2 meses de uso. Están como nuevos. ¡Precio de oportunidad!',
      fotos: null,
      ref_id: null,
      likes_count: 5,
      comentarios_count: 2,
      created_at: new Date(Date.now() - 7200000).toISOString(),
      autor: { nombre: 'Mariana Silva', email: 'mari@motochicas.com' },
      liked_by_me: false,
    },
    {
      id: 'mock-4',
      user_id: 'mock-user-4',
      tipo: 'evento',
      contenido: '¡Recuerden! Este sábado nos vemos en Las Mercedes para la Rodada Nocturna 888. Traigan sus equipos de seguridad.',
      fotos: null,
      ref_id: null,
      likes_count: 24,
      comentarios_count: 7,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      autor: { nombre: 'Bikevzla Official', email: 'info@bikevzla.com' },
      liked_by_me: false,
    }
  ]

  const displayPosts = posts.length > 0 ? posts : mockPosts

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-7 w-1 rounded-full bg-secondary" />
        <h1 className="font-display text-2xl font-bold text-text-base tracking-wide uppercase">
          Feed <span className="text-secondary">Comunidad</span>
        </h1>
      </div>

      <PostForm />

      <div className="space-y-3">
        {displayPosts.map(post => <PostCard key={post.id} post={post} />)}
      </div>
    </div>
  )
}
