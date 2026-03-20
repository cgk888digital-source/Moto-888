import { createClient } from '@/lib/supabase/server'
import type { Producto, Vendedor } from './types'

export async function getProductos(filters?: {
  categoria?: string
  condicion?: string
  q?: string
}): Promise<Producto[]> {
  const supabase = await createClient()

  let query = supabase
    .from('marketplace_productos')
    .select(`
      id, titulo, descripcion, precio, categoria, condicion,
      motos_compatibles, fotos, stock, estado, vistas, created_at, vendedor_id,
      vendedor:marketplace_vendedores!marketplace_productos_vendedor_id_fkey(
        nombre_tienda, tipo, verificado, ubicacion, rating_promedio
      )
    `)
    .eq('estado', 'activo')
    .order('created_at', { ascending: false })
    .limit(60)

  if (filters?.categoria) query = query.eq('categoria', filters.categoria)
  if (filters?.condicion) query = query.eq('condicion', filters.condicion)
  if (filters?.q) query = query.ilike('titulo', `%${filters.q}%`)

  const { data } = await query
  return (data ?? []).map((p: any) => ({
    ...p,
    vendedor: Array.isArray(p.vendedor) ? p.vendedor[0] : p.vendedor,
  })) as Producto[]
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
