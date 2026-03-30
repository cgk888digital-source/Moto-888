'use client'
import { useState, useTransition } from 'react'
import type { Post } from '../types'
import { toggleLike, addComentario } from '../actions'
import { createClient } from '@/lib/supabase/client'

interface Comentario {
  id: string
  contenido: string
  created_at: string | null
  autor: { nombre: string | null } | null
}

const TIPO_BADGE: Record<string, string> = {
  general:    '',
  ruta:       'bg-secondary-muted text-secondary border border-secondary/30',
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
  const [comentarios, setComentarios] = useState<Comentario[]>([])
  const [loadingComentarios, setLoadingComentarios] = useState(false)
  const [comentariosCount, setComentariosCount] = useState(post.comentarios_count)
  const [comentario, setComentario] = useState('')
  const [pending, startTransition] = useTransition()

  function handleLike() {
    setLiked(l => !l)
    setLikes(n => liked ? n - 1 : n + 1)
    startTransition(() => toggleLike(post.id, liked))
  }

  async function handleToggleComments() {
    if (showComments) {
      setShowComments(false)
      return
    }
    setShowComments(true)
    if (comentarios.length > 0) return // ya cargados
    setLoadingComentarios(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('post_comentarios')
      .select('id, contenido, created_at, autor:users!post_comentarios_user_id_fkey(nombre)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })
    setComentarios((data ?? []) as unknown as Comentario[])
    setLoadingComentarios(false)
  }

  function handleComment(e: React.FormEvent) {
    e.preventDefault()
    if (!comentario.trim()) return
    const texto = comentario.trim()
    startTransition(async () => {
      await addComentario(post.id, texto)
      // Agregar optimisticamente
      setComentarios(prev => [...prev, {
        id: crypto.randomUUID(),
        contenido: texto,
        created_at: new Date().toISOString(),
        autor: null,
      }])
      setComentariosCount(n => (n ?? 0) + 1)
      setComentario('')
    })
  }

  return (
    <article className="bg-surface border border-border rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-secondary-muted flex items-center justify-center text-secondary font-display font-bold text-sm">
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
          onClick={handleToggleComments}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-secondary font-body transition-colors"
        >
          <span>💬</span>
          <span>{comentariosCount}</span>
        </button>
      </div>

      {/* Comentarios */}
      {showComments && (
        <div className="space-y-3 pt-1 border-t border-border">
          {/* Lista de comentarios */}
          {loadingComentarios ? (
            <p className="text-xs text-text-muted font-body">Cargando comentarios...</p>
          ) : comentarios.length > 0 ? (
            <div className="space-y-2">
              {comentarios.map(c => (
                <div key={c.id} className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-secondary-muted flex items-center justify-center text-secondary font-bold text-xs shrink-0 font-display">
                    {(c.autor?.nombre ?? '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 bg-bg border border-border rounded-lg px-3 py-2">
                    <p className="text-xs font-semibold text-text-muted font-body mb-0.5">
                      {c.autor?.nombre ?? 'Usuario'}
                    </p>
                    <p className="text-sm text-text-base font-body">{c.contenido}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-muted font-body">Sin comentarios aún. ¡Sé el primero!</p>
          )}

          {/* Formulario nuevo comentario */}
          <form onSubmit={handleComment} className="flex gap-2">
            <input
              value={comentario}
              onChange={e => setComentario(e.target.value)}
              placeholder="Escribe un comentario..."
              className="flex-1 bg-bg border border-border rounded-lg px-3 py-1.5 text-sm text-text-base placeholder-text-muted focus:outline-none focus:border-secondary font-body"
            />
            <button
              type="submit"
              disabled={pending || !comentario.trim()}
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
