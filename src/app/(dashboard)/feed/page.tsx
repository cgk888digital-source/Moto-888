import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getFeedPosts } from '@/features/feed/queries'
import { PostForm } from '@/features/feed/components/PostForm'
import { PostCard } from '@/features/feed/components/PostCard'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const posts = await getFeedPosts(user.id)

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="font-display text-2xl font-bold text-text-base tracking-wide uppercase">
        Feed <span className="text-accent">Comunidad</span>
      </h1>

      <PostForm />

      {posts.length === 0 ? (
        <div className="text-center py-16 text-text-muted font-body">
          <p className="text-4xl mb-3">📡</p>
          <p className="text-sm">No hay publicaciones aún. ¡Sé el primero en compartir!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => <PostCard key={post.id} post={post} />)}
        </div>
      )}
    </div>
  )
}
