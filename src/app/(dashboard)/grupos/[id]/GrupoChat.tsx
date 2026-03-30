'use client'
import { useState, useEffect, useRef, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendGrupoMensaje } from '@/features/grupos/actions'

interface Mensaje {
  id: string
  contenido: string
  user_id: string
  created_at: string | null
  user?: { nombre: string; email: string }
}

interface Props {
  grupoId: string
  userId: string
  esMiembro: boolean
  grupoNombre: string
}

export function GrupoChat({ grupoId, userId, esMiembro, grupoNombre }: Props) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [texto, setTexto] = useState('')
  const [isPending, start] = useTransition()
  const bottomRef = useRef<HTMLDivElement>(null)
  
  // Realtime
  useEffect(() => {
    if (!esMiembro) return

    const supabase = createClient()
    
    // Initial fetch
    supabase
      .from('grupo_mensajes' as any)
      .select('id, contenido, user_id, created_at, user:users(nombre, email)')
      .eq('grupo_id', grupoId)
      .order('created_at', { ascending: true })
      .limit(50)
      .then(({ data }) => {
        if (data) setMensajes(data as any)
      })

    const channel = supabase
      .channel(`grupo-${grupoId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'grupo_mensajes',
          filter: `grupo_id=eq.${grupoId}`,
        },
        async (payload) => {
          const msg = payload.new as any
          // Fetch user info for the new message
          const { data: user } = await supabase.from('users').select('nombre, email').eq('id', msg.user_id).single()
          setMensajes(prev => {
            if (prev.find(m => m.id === msg.id)) return prev
            return [...prev, { ...msg, user }]
          })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [grupoId, esMiembro])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!texto.trim()) return
    const t = texto
    setTexto('')
    start(async () => {
      await sendGrupoMensaje(grupoId, t)
    })
  }

  if (!esMiembro) return null

  return (
    <div className="bg-surface border border-border rounded-xl flex flex-col h-[500px] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-surface-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <h3 className="font-display font-bold text-sm text-text-base">Chat en vivo: {grupoNombre}</h3>
        </div>
        <span className="text-[10px] text-text-muted font-body uppercase tracking-widest">{mensajes.length} mensajes</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
        {mensajes.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <p className="text-xs text-text-muted font-body max-w-[180px]">Iniciá el chat con el resto de riders del grupo 🏍️</p>
          </div>
        ) : (
          mensajes.map(m => {
            const isOwn = m.user_id === userId
            const nombre = m.user?.nombre ?? m.user?.email?.split('@')[0] ?? 'Rider'
            return (
              <div key={m.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] space-y-0.5`}>
                   {!isOwn && <p className="text-[10px] text-secondary font-bold ml-2">{nombre}</p>}
                   <div className={`px-3 py-2 rounded-2xl text-sm font-body shadow-sm ${
                     isOwn 
                      ? 'bg-accent text-bg rounded-tr-none' 
                      : 'bg-bg border border-border text-text-base rounded-tl-none'
                   }`}>
                     {m.contenido}
                   </div>
                   <p className={`text-[9px] text-text-muted font-body ${isOwn ? 'text-right mr-1' : 'text-left ml-1'}`}>
                     {m.created_at ? new Date(m.created_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) : ''}
                   </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 bg-surface border-t border-border flex gap-2">
        <input 
          value={texto}
          onChange={e => setTexto(e.target.value)}
          placeholder="Escribe a la comunidad..."
          className="flex-1 bg-bg border border-border rounded-xl px-4 py-2 text-sm text-text-base focus:border-secondary outline-none font-body"
        />
        <button 
          disabled={isPending || !texto.trim()}
          className="bg-accent text-bg p-2.5 rounded-xl hover:bg-amber-400 transition-all disabled:opacity-50"
        >
          🚀
        </button>
      </form>
    </div>
  )
}
