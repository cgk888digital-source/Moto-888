'use client'

import { useEffect, useRef, useState } from 'react'
import { ChatMessage } from '../types'
import { ChatBubble } from './ChatBubble'
import { ChatInput } from './ChatInput'
import { NivelUrgencia, URGENCIA_CONFIG } from '@/features/diagnosticos/types'
import { createClient } from '@/lib/supabase/client'

interface Props {
  moto_id: string
  motoNombre: string
}

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: '¡Hola! Soy MotoSafe AI. Contame qué problema o síntoma notaste en tu moto. Cuanto más detallado, mejor diagnóstico puedo darte.',
  timestamp: new Date(),
}

export function ChatPageClient({ moto_id, motoNombre }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [loading, setLoading] = useState(false)
  const [pendingDiag, setPendingDiag] = useState<{ nivel_urgencia: NivelUrgencia; resumen: string; sintoma: string } | null>(null)
  const [saved, setSaved] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Scroll al fondo cuando llegan mensajes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function handleSend(text: string) {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    // Construir historial (sin el welcome estático)
    const history = [...messages, userMsg]
      .filter(m => m.id !== 'welcome')
      .map(m => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moto_id, messages: history }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Error: ${data.error ?? 'No se pudo conectar'}`,
          timestamp: new Date(),
        }])
        return
      }

      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.reply,
        diagnostico: data.diagnostico,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, aiMsg])

      // Si hay diagnóstico, guardarlo como pendiente para que el usuario confirme
      if (data.diagnostico) {
        // Tomar el primer mensaje del usuario como síntoma original
        const primerMensajeUsuario = [...messages, userMsg].find(m => m.role === 'user')
        setPendingDiag({
          ...data.diagnostico,
          sintoma: primerMensajeUsuario?.content ?? text,
        })
      }
    } catch {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'No se pudo conectar con el servidor. Intentá de nuevo.',
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  async function handleGuardarDiagnostico() {
    if (!pendingDiag) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Construir respuesta completa del chat
    const resumenChat = messages
      .filter(m => m.id !== 'welcome')
      .map(m => `${m.role === 'user' ? 'Usuario' : 'MotoSafe AI'}: ${m.content}`)
      .join('\n\n')

    await supabase.from('diagnosticos').insert({
      user_id: user.id,
      moto_id,
      sintoma_original: pendingDiag.sintoma,
      pregunta_enriquecida: pendingDiag.resumen,
      respuesta_ai: resumenChat,
      nivel_urgencia: pendingDiag.nivel_urgencia,
    })

    setSaved(true)
    setPendingDiag(null)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div>
          <p className="text-xs text-text-muted font-body uppercase tracking-wider">Chat IA</p>
          <p className="text-sm font-display font-bold text-text-base uppercase tracking-wide">{motoNombre}</p>
        </div>
        <button
          onClick={() => {
            setMessages([WELCOME])
            setPendingDiag(null)
            setSaved(false)
          }}
          className="text-xs text-text-muted hover:text-accent font-body transition-colors"
        >
          Nueva consulta
        </button>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map(msg => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start gap-2">
            <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-sm">⚡</div>
            <div className="bg-surface border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {/* Banner guardar diagnóstico */}
        {pendingDiag && !saved && (
          <div className={`rounded-xl border p-4 space-y-3 ${URGENCIA_CONFIG[pendingDiag.nivel_urgencia].bg}`}>
            <p className={`text-xs font-display font-bold uppercase tracking-wider ${URGENCIA_CONFIG[pendingDiag.nivel_urgencia].color}`}>
              {URGENCIA_CONFIG[pendingDiag.nivel_urgencia].icon} Diagnóstico listo — urgencia {URGENCIA_CONFIG[pendingDiag.nivel_urgencia].label}
            </p>
            <p className="text-xs text-text-muted font-body">{pendingDiag.resumen}</p>
            <button
              onClick={handleGuardarDiagnostico}
              className="btn-primary w-full text-center text-xs py-2"
            >
              Guardar en historial de diagnósticos
            </button>
          </div>
        )}

        {saved && (
          <div className="text-center">
            <p className="text-xs text-green-400 font-body">✓ Diagnóstico guardado en tu historial</p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0">
        <ChatInput onSend={handleSend} disabled={loading} />
      </div>
    </div>
  )
}
