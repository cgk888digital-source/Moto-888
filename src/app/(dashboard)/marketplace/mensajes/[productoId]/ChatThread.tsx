'use client'
import { useState, useEffect, useRef, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendMensaje, markLeido } from '@/features/marketplace/actions'

interface Mensaje {
  id: string
  contenido: string
  remitente_id: string
  destinatario_id: string
  leido: boolean | null
  created_at: string | null
}

interface Props {
  productoId: string
  otroUserId: string
  userId: string
  productoTitulo: string
  otroNombre: string
  initialMensajes: Mensaje[]
}

export function ChatThread({ productoId, otroUserId, userId, productoTitulo, otroNombre, initialMensajes }: Props) {
  const [mensajes, setMensajes] = useState(initialMensajes)
  const [texto, setTexto] = useState('')
  const [pending, start] = useTransition()
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`chat-${productoId}-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'marketplace_mensajes',
          filter: `producto_id=eq.${productoId}`,
        },
        (payload) => {
          const msg = payload.new as Mensaje
          // Only add if it belongs to this conversation thread
          const isRelevant =
            (msg.remitente_id === userId && msg.destinatario_id === otroUserId) ||
            (msg.remitente_id === otroUserId && msg.destinatario_id === userId)
          if (isRelevant) {
            setMensajes(prev => {
              if (prev.find(m => m.id === msg.id)) return prev
              return [...prev, msg]
            })
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [productoId, userId, otroUserId])

  // Mark as read on mount
  useEffect(() => {
    markLeido(productoId, otroUserId)
  }, [productoId, otroUserId])

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!texto.trim()) return
    const t = texto
    setTexto('')
    // Optimistic update
    setMensajes(prev => [...prev, {
      id: `opt-${Date.now()}`,
      contenido: t,
      remitente_id: userId,
      destinatario_id: otroUserId,
      leido: false,
      created_at: new Date().toISOString(),
    }])
    start(async () => {
      await sendMensaje(productoId, otroUserId, t)
    })
    inputRef.current?.focus()
  }

  function formatHora(ts: string | null) {
    if (!ts) return ''
    const d = new Date(ts)
    const hoy = new Date()
    const esHoy = d.toDateString() === hoy.toDateString()
    if (esHoy) return d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('es', { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-200px)] min-h-[400px]">
      {/* Header */}
      <div className="bg-surface border border-border rounded-t-xl px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent font-display font-bold text-sm flex-shrink-0">
          {otroNombre[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-base font-body truncate">{otroNombre}</p>
          <p className="text-xs text-text-muted font-body truncate">{productoTitulo}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-surface border-x border-border overflow-y-auto px-4 py-3 space-y-2">
        {mensajes.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-text-muted font-body text-center">
              Iniciá la conversación sobre este producto
            </p>
          </div>
        ) : (
          mensajes.map(m => {
            const isOwn = m.remitente_id === userId
            return (
              <div key={m.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[75%] space-y-0.5">
                  <div className={`px-3 py-2 rounded-2xl text-sm font-body leading-relaxed ${
                    isOwn
                      ? 'bg-accent text-bg rounded-br-sm'
                      : 'bg-bg border border-border text-text-base rounded-bl-sm'
                  }`}>
                    {m.contenido}
                  </div>
                  <p className={`text-[10px] text-text-muted font-body ${isOwn ? 'text-right' : 'text-left'}`}>
                    {formatHora(m.created_at)}
                    {isOwn && <span className="ml-1">{m.leido ? '✓✓' : '✓'}</span>}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="bg-surface border border-t-0 border-border rounded-b-xl px-4 py-3 flex gap-2">
        <input
          ref={inputRef}
          value={texto}
          onChange={e => setTexto(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-text-base placeholder-text-muted focus:outline-none focus:border-accent font-body"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={pending || !texto.trim()}
          className="bg-accent text-bg px-4 py-2.5 rounded-xl text-sm font-body font-semibold hover:bg-amber-400 transition-colors disabled:opacity-40 flex-shrink-0"
        >
          Enviar
        </button>
      </form>
    </div>
  )
}
