'use client'
import { useState, useTransition } from 'react'
import type { Post } from '../types'
import { toggleLike, addComentario } from '../actions'

const TIPO_BADGE: Record<string, string> = {
  general:    '',
  ruta:       'bg-blue-900/40 text-blue-300',
  evento:     'bg-purple-900/40 text-purple-300',
  marketplace:'bg-green-900/40 text-green-300',
}
const TIPO_LABEL: Record<string, string> = {
  ruta: 'Ruta', evento: 'Evento', marketplace: 'Marketplace',
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'ahora'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

export function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(post.liked_by_me)
  const [likes, setLikes] = useState(post.likes_count)
  const [showComments, setShowComments] = useState(false)
  const [comentario, setComentario] = useState('')
  const [pending, startTransition] = useTransition()

  function handleLike() {
    setLiked(l => !l)
    setLikes(n => liked ? n - 1 : n + 1)
    startTransition(() => toggleLike(post.id, liked))
  }

  function handleComment(e: React.FormEvent) {
    e.preventDefault()
    if (!comentario.trim()) return
    startTransition(async () => {
      await addComentario(post.id, comentario)
      setComentario('')
    })
  }

  return (
    <article className="bg-surface border border-border rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent font-display font-bold text-sm">
            {(post.autor?.nombre ?? post.autor?.email ?? '?')[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-text-base font-body">
              {post.autor?.nombre ?? post.autor?.email}
            </p>
            <p className="text-xs text-text-muted font-body">{timeAgo(post.created_at)}</p>
          </div>
        </div>
        {post.tipo !== 'general' && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-body ${TIPO_BADGE[post.tipo]}`}>
            {TIPO_LABEL[post.tipo]}
          </span>
        )}
      </div>

      {/* Contenido */}
      {post.contenido && (
        <p className="text-sm text-text-base font-body leading-relaxed whitespace-pre-wrap">
          {post.contenido}
        </p>
      )}

      {/* Fotos */}
      {post.fotos && post.fotos.length > 0 && (
        <div className={`grid gap-1 ${post.fotos.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {post.fotos.map((url, i) => (
            <img key={i} src={url} alt="" className="rounded-lg w-full h-48 object-cover" />
          ))}
        </div>
      )}

      {/* Acciones */}
      <div className="flex items-center gap-4 pt-1 border-t border-border">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm font-body transition-colors ${liked ? 'text-accent' : 'text-text-muted hover:text-accent'}`}
        >
          <span>{liked ? '❤️' : '🤍'}</span>
          <span>{likes}</span>
        </button>
        <button
          onClick={() => setShowComments(s => !s)}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-accent font-body transition-colors"
        >
          <span>💬</span>
          <span>{post.comentarios_count}</span>
        </button>
      </div>

      {/* Comentarios */}
      {showComments && (
        <div className="space-y-2 pt-1">
          <form onSubmit={handleComment} className="flex gap-2">
            <input
              value={comentario}
              onChange={e => setComentario(e.target.value)}
              placeholder="Escribe un comentario..."
              className="flex-1 bg-bg border border-border rounded-lg px-3 py-1.5 text-sm text-text-base placeholder-text-muted focus:outline-none focus:border-accent font-body"
            />
            <button
              type="submit"
              disabled={pending}
              className="text-xs bg-accent text-bg px-3 py-1.5 rounded-lg font-body font-semibold hover:bg-amber-400 transition-colors disabled:opacity-50"
            >
              Enviar
            </button>
          </form>
        </div>
      )}
    </article>
  )
}
