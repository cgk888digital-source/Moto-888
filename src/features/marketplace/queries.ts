import { createClient } from '@/lib/supabase/server'
import type { Producto, Vendedor } from './types'

export interface GetProductosParams {
  categoria?: string
  condicion?: string
  q?: string
  page?: number
  limit?: number
}

export interface GetProductosResult {
  productos: Producto[]
  total: number
  page: number
  totalPages: number
  hasMore: boolean
}

export async function getProductos(filters?: GetProductosParams): Promise<GetProductosResult> {
  const supabase = await createClient()
  const page = filters?.page ?? 1
  const limit = filters?.limit ?? 20
  const offset = (page - 1) * limit

  let query = supabase
    .from('marketplace_productos')
    .select(`
      id, titulo, descripcion, precio, categoria, condicion,
      motos_compatibles, fotos, stock, estado, vistas, created_at, vendedor_id,
      vendedor:marketplace_vendedores!marketplace_productos_vendedor_id_fkey(
        nombre_tienda, tipo, verificado, ubicacion, rating_promedio
      )
    `, { count: 'exact' })
    .eq('estado', 'activo')

  if (filters?.categoria) query = query.eq('categoria', filters.categoria)
  if (filters?.condicion) query = query.eq('condicion', filters.condicion)
  if (filters?.q) query = query.ilike('titulo', `%${filters.q}%`)

  const { data, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const total = count ?? 0
  const totalPages = Math.ceil(total / limit)

  return {
    productos: ((data ?? []) as any[]).map((p: any) => ({
      ...p,
      vendedor: Array.isArray(p.vendedor) ? p.vendedor[0] : p.vendedor,
    })) as Producto[],
    total,
    page,
    totalPages,
    hasMore: page < totalPages,
  }
}

export async function getProducto(id: string): Promise<Producto | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('marketplace_productos')
    .select(`
      *, vendedor:marketplace_vendedores!marketplace_productos_vendedor_id_fkey(*)
    `)
    .eq('id', id)
    .single()

  if (!data) return null
  return { ...data, vendedor: Array.isArray(data.vendedor) ? data.vendedor[0] : data.vendedor } as Producto
}

export async function getVendedor(id: string): Promise<Vendedor | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('marketplace_vendedores')
    .select('*')
    .eq('id', id)
    .single()
  return data as Vendedor | null
}

export async function getVendedorByUserId(userId: string): Promise<Vendedor | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('marketplace_vendedores')
    .select('*')
    .eq('user_id', userId)
    .single()
  return data as Vendedor | null
}

export async function getMisProductos(vendedorId: string): Promise<Producto[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('marketplace_productos')
    .select('*')
    .eq('vendedor_id', vendedorId)
    .order('created_at', { ascending: false })
  return (data ?? []) as Producto[]
}

export async function getMisCompras(compradorId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('marketplace_transacciones')
    .select(`
      id, precio_base, comision_monto, total_pagado, estado, created_at,
      producto:marketplace_productos!marketplace_transacciones_producto_id_fkey(id, titulo, fotos),
      vendedor:marketplace_vendedores!marketplace_transacciones_vendedor_id_fkey(id, nombre_tienda)
    `)
    .eq('comprador_id', compradorId)
    .order('created_at', { ascending: false })
  return (data ?? []) as any[]
}

export async function getResenasByTransaccion(transaccionIds: string[]) {
  if (transaccionIds.length === 0) return []
  const supabase = await createClient()
  const { data } = await supabase
    .from('marketplace_resenas')
    .select('transaccion_id')
    .in('transaccion_id', transaccionIds)
  return (data ?? []).map((r: any) => r.transaccion_id as string)
}

export async function getResenasByVendedor(vendedorId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('marketplace_resenas')
    .select('id, rating, comentario, created_at')
    .eq('vendedor_id', vendedorId)
    .order('created_at', { ascending: false })
    .limit(20)
  return data ?? []
}

export async function getMensajes(productoId: string, userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('marketplace_mensajes')
    .select('id, contenido, remitente_id, created_at')
    .eq('producto_id', productoId)
    .or(`remitente_id.eq.${userId},destinatario_id.eq.${userId}`)
    .order('created_at', { ascending: true })
  return data ?? []
}

export async function getMensajesThread(productoId: string, userId: string, otroUserId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('marketplace_mensajes')
    .select('id, contenido, remitente_id, destinatario_id, leido, created_at')
    .eq('producto_id', productoId)
    .or(
      `and(remitente_id.eq.${userId},destinatario_id.eq.${otroUserId}),and(remitente_id.eq.${otroUserId},destinatario_id.eq.${userId})`
    )
    .order('created_at', { ascending: true })
  return data ?? []
}

export async function getMisConversaciones(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('marketplace_mensajes')
    .select(`
      id, contenido, remitente_id, destinatario_id, leido, created_at, producto_id,
      producto:marketplace_productos!marketplace_mensajes_producto_id_fkey(id, titulo, fotos)
    `)
    .or(`remitente_id.eq.${userId},destinatario_id.eq.${userId}`)
    .order('created_at', { ascending: false })

  if (!data) return []

  // Deduplicate by (producto_id, otro_user) — keep the latest message per conversation
  const seen = new Set<string>()
  const convs: any[] = []
  for (const msg of data) {
    const otroId = msg.remitente_id === userId ? msg.destinatario_id : msg.remitente_id
    const key = `${msg.producto_id}:${otroId}`
    if (!seen.has(key)) {
      seen.add(key)
      const prod = Array.isArray(msg.producto) ? msg.producto[0] : msg.producto
      convs.push({ ...msg, otro_user_id: otroId, producto: prod })
    }
  }
  return convs
}

export async function getUnreadCount(userId: string) {
  const supabase = await createClient()
  const { count } = await supabase
    .from('marketplace_mensajes')
    .select('id', { count: 'exact', head: true })
    .eq('destinatario_id', userId)
    .eq('leido', false)
  return count ?? 0
}
