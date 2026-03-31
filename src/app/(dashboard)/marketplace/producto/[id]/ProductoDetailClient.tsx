'use client'
import { useState, useRef, useTransition, useEffect } from 'react'
import Link from 'next/link'
import type { Producto } from '@/features/marketplace/types'
import { COMISION_POR_PRECIO } from '@/features/marketplace/types'
import { toggleGuardado, sendMensaje } from '@/features/marketplace/actions'
import { createClient } from '@/lib/supabase/client'

interface Mensaje {
  id: string
  contenido: string
  remitente_id: string
  created_at: string | null
}

interface Props {
  producto: Producto
  mensajes: Mensaje[]
  userId: string
  vendedorUserId: string
  isGuardado: boolean
}

export function ProductoDetailClient({ producto, mensajes: initMensajes, userId, vendedorUserId, isGuardado: initGuardado }: Props) {
  const [guardado, setGuardado] = useState(initGuardado)
  const [mensajes, setMensajes] = useState(initMensajes)
  const [mensaje, setMensaje] = useState('')
  const [fotoIdx, setFotoIdx] = useState(0)
  const [pending, startTransition] = useTransition()
  const chatRef = useRef<HTMLDivElement>(null)

  const isOwnProduct = vendedorUserId === userId

  // Realtime subscription for the buyer thread
  useEffect(() => {
    if (isOwnProduct) return
    const supabase = createClient()
    const channel = supabase
      .channel(`prod-chat-${producto.id}-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'marketplace_mensajes', filter: `producto_id=eq.${producto.id}` },
        (payload) => {
          const msg = payload.new as any
          const isRelevant = (msg.remitente_id === userId && msg.destinatario_id === vendedorUserId) ||
                            (msg.remitente_id === vendedorUserId && msg.destinatario_id === userId)
          if (isRelevant) {
            setMensajes(prev => [...prev, msg])
          }
        }
      ).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [producto.id, userId, vendedorUserId, isOwnProduct])

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
  }, [mensajes])

  const comision = COMISION_POR_PRECIO(producto.precio)
  const totalComprador = (producto.precio * (1 + comision)).toFixed(2)
  const fotos = producto.fotos ?? []

  function handleGuardado() {
    setGuardado(g => !g)
    startTransition(() => toggleGuardado(producto.id, guardado))
  }

  async function handleMensaje(e: React.FormEvent) {
    e.preventDefault()
    if (!mensaje.trim() || !vendedorUserId || isOwnProduct) return
    const content = mensaje
    setMensaje('')
    startTransition(async () => {
      await sendMensaje(producto.id, vendedorUserId, content)
      // Optimistic update
      setMensajes(prev => [...prev, {
        id: Date.now().toString(),
        contenido: content,
        remitente_id: userId,
        created_at: new Date().toISOString(),
      }])
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/marketplace" className="text-sm text-text-muted hover:text-accent font-body transition-colors">
        ← Volver al marketplace
      </Link>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Fotos */}
        <div className="space-y-3">
          <div className="bg-surface border border-border rounded-xl h-72 flex items-center justify-center overflow-hidden">
            {fotos.length > 0 ? (
              <img src={fotos[fotoIdx]} alt={producto.titulo} className="w-full h-full object-cover" />
            ) : (
              <span className="text-6xl opacity-20">🔩</span>
            )}
          </div>
          {fotos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {fotos.map((f, i) => (
                <button key={i} onClick={() => setFotoIdx(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${fotoIdx === i ? 'border-accent' : 'border-transparent'}`}>
                  <img src={f} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-surface border border-border px-2 py-0.5 rounded font-body text-text-muted">{producto.categoria}</span>
              <span className={`text-xs px-2 py-0.5 rounded font-body ${producto.condicion === 'nuevo' ? 'bg-green-900/40 text-green-400' : 'border border-border text-text-muted'}`}>
                {producto.condicion === 'nuevo' ? 'Nuevo' : 'Usado'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <h1 className="font-display text-2xl font-bold text-text-base">{producto.titulo}</h1>
              {isOwnProduct && (
                <Link 
                  href={`/marketplace/producto/${producto.id}/editar`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body border border-accent text-accent bg-accent/5 hover:bg-accent/10 transition-colors"
                >
                  ✏️ Editar producto
                </Link>
              )}
            </div>
          </div>

          {/* Precio */}
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-3xl font-display font-bold text-accent">${producto.precio}</p>
            <p className="text-sm text-text-muted font-body mt-1">
              Precio final: <span className="text-text-base font-semibold">${totalComprador}</span>
            </p>
          </div>

          {/* Vendedor */}
          {producto.vendedor && (
            <Link href={`/marketplace/vendedor/${producto.vendedor_id}`}
              className="flex items-center gap-3 bg-surface border border-border rounded-xl p-3 hover:border-accent transition-colors">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-display font-bold">
                {producto.vendedor.nombre_tienda[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-text-base font-body flex items-center gap-1">
                  {producto.vendedor.nombre_tienda}
                  {producto.vendedor.verificado && <span className="text-green-400 text-xs">✓</span>}
                </p>
                <p className="text-xs text-text-muted font-body">
                  {producto.vendedor.tipo === 'tienda' ? '🏪 Tienda' : '👤 Particular'}
                  {producto.vendedor.ubicacion && ` · ${producto.vendedor.ubicacion}`}
                  {producto.vendedor.rating_promedio > 0 && ` · ⭐ ${producto.vendedor.rating_promedio}`}
                </p>
              </div>
            </Link>
          )}

          {/* Motos compatibles */}
          {producto.motos_compatibles && producto.motos_compatibles.length > 0 && (
            <div className="text-sm font-body text-text-muted">
              <p className="text-xs uppercase tracking-wider mb-1">Compatible con:</p>
              <p>{producto.motos_compatibles.join(', ')}</p>
            </div>
          )}

          {/* Acciones */}
          <div className="flex gap-2">
            <button onClick={handleGuardado}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-body border transition-colors ${guardado ? 'border-accent text-accent bg-accent/10' : 'border-border text-text-muted hover:border-accent hover:text-accent'}`}>
              {guardado ? '❤️ Guardado' : '🤍 Guardar'}
            </button>
            {producto.stock === 0 && (
              <span className="px-4 py-2 rounded-lg text-sm font-body bg-surface border border-border text-text-muted">Sin stock</span>
            )}
          </div>
        </div>
      </div>

      {/* Descripción */}
      {producto.descripcion && (
        <div className="bg-surface border border-border rounded-xl p-5">
          <h2 className="font-display font-bold text-text-base mb-2">Descripción</h2>
          <p className="text-sm text-text-muted font-body leading-relaxed whitespace-pre-wrap">{producto.descripcion}</p>
        </div>
      )}

      {/* Chat con vendedor */}
      <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-text-base">Chat con el vendedor</h2>
          {isOwnProduct ? (
             <Link href="/marketplace/mensajes" className="text-xs text-accent hover:underline font-body">
              Gestionar todos los chats de este producto →
            </Link>
          ) : vendedorUserId && (
            <Link href={`/marketplace/mensajes/${producto.id}?con=${vendedorUserId}`} className="text-xs text-accent hover:underline font-body">
              Ver conversación completa →
            </Link>
          )}
        </div>

        {isOwnProduct ? (
          <div className="py-8 text-center bg-bg border border-dashed border-border rounded-xl px-6">
            <p className="text-2xl mb-2">💬</p>
            <p className="text-sm font-semibold text-text-base font-body">Eres el dueño de este producto</p>
            <p className="text-xs text-text-muted font-body mt-1">
              Las consultas de posibles compradores aparecerán en tu bandeja de entrada de mensajes.
            </p>
            <Link href="/marketplace/mensajes" className="mt-4 inline-block btn-primary text-xs py-2 px-4">
              Ir a mis Mensajes
            </Link>
          </div>
        ) : (
          <>
            <div ref={chatRef} className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {mensajes.length === 0 ? (
                <p className="text-sm text-text-muted font-body text-center py-4">Haz una pregunta sobre el producto</p>
              ) : (
                mensajes.map(m => (
                  <div key={m.id} className={`flex ${m.remitente_id === userId ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-3 py-2 rounded-xl text-sm font-body ${
                      m.remitente_id === userId
                        ? 'bg-accent text-bg'
                        : 'bg-bg border border-border text-text-base'
                    }`}>
                      {m.contenido}
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleMensaje} className="flex gap-2">
              <input
                value={mensaje}
                onChange={e => setMensaje(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base placeholder-text-muted focus:outline-none focus:border-accent font-body"
              />
              <button type="submit" disabled={pending || !mensaje.trim()}
                className="bg-accent text-bg px-4 py-2 rounded-lg text-sm font-body font-semibold hover:bg-amber-400 transition-colors disabled:opacity-50">
                {pending ? '...' : 'Enviar'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
