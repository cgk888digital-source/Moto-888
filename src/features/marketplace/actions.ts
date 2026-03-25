'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createVendedor(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data, error } = await supabase.from('marketplace_vendedores').insert({
    user_id: user.id,
    nombre_tienda: (formData.get('nombre_tienda') as string).trim(),
    tipo: formData.get('tipo') as string,
    ubicacion: (formData.get('ubicacion') as string)?.trim() || null,
    descripcion: (formData.get('descripcion') as string)?.trim() || null,
  }).select('id').single()

  if (error || !data) return { error: error?.message ?? 'Error al crear perfil' }
  revalidatePath('/marketplace')
  redirect(`/marketplace/vendedor/${data.id}`)
}

export async function createProducto(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const vendedor = await supabase
    .from('marketplace_vendedores')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!vendedor.data) return { error: 'Primero crea tu perfil de vendedor' }

  const fotosRaw = (formData.get('fotos') as string)?.trim()
  const fotos = fotosRaw ? fotosRaw.split('\n').map(u => u.trim()).filter(Boolean) : null

  const compatiblesRaw = (formData.get('motos_compatibles') as string)?.trim()
  const motos_compatibles = compatiblesRaw
    ? compatiblesRaw.split(',').map(m => m.trim()).filter(Boolean)
    : null

  const { data, error } = await supabase.from('marketplace_productos').insert({
    vendedor_id: vendedor.data.id,
    titulo: (formData.get('titulo') as string).trim(),
    descripcion: (formData.get('descripcion') as string)?.trim() || null,
    precio: Number(formData.get('precio')),
    categoria: formData.get('categoria') as string,
    condicion: formData.get('condicion') as string,
    fotos,
    motos_compatibles,
    stock: Number(formData.get('stock') ?? 1),
  }).select('id').single()

  if (error || !data) return { error: error?.message ?? 'Error al crear producto' }
  revalidatePath('/marketplace')
  redirect(`/marketplace/producto/${data.id}`)
}

export async function toggleGuardado(productoId: string, guardado: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  if (guardado) {
    await supabase.from('marketplace_guardados').delete().match({ producto_id: productoId, user_id: user.id })
  } else {
    await supabase.from('marketplace_guardados').insert({ producto_id: productoId, user_id: user.id })
  }
  revalidatePath(`/marketplace/producto/${productoId}`)
}

export async function createResena(transaccionId: string, vendedorId: string, rating: number, comentario: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }
  if (rating < 1 || rating > 5) return { error: 'Rating inválido' }

  // Verificar que el usuario es el comprador de esta transacción
  const { data: tx } = await supabase
    .from('marketplace_transacciones')
    .select('id, vendedor_id')
    .eq('id', transaccionId)
    .eq('comprador_id', user.id)
    .single()

  if (!tx) return { error: 'Transacción no encontrada' }

  // Verificar que no haya reseña previa para esta transacción
  const { data: existing } = await supabase
    .from('marketplace_resenas')
    .select('id')
    .eq('transaccion_id', transaccionId)
    .maybeSingle()

  if (existing) return { error: 'Ya dejaste una reseña para esta compra' }

  const { error } = await supabase.from('marketplace_resenas').insert({
    vendedor_id: vendedorId,
    comprador_id: user.id,
    transaccion_id: transaccionId,
    rating,
    comentario: comentario.trim() || null,
  })

  if (error) return { error: error.message }

  // Actualizar rating_promedio del vendedor
  const { data: resenas } = await supabase
    .from('marketplace_resenas')
    .select('rating')
    .eq('vendedor_id', vendedorId)

  if (resenas && resenas.length > 0) {
    const avg = resenas.reduce((a, r) => a + r.rating, 0) / resenas.length
    await supabase
      .from('marketplace_vendedores')
      .update({ rating_promedio: Math.round(avg * 10) / 10 })
      .eq('id', vendedorId)
  }

  revalidatePath('/marketplace/mis-compras')
  return { success: true }
}

export async function sendMensaje(productoId: string, destinatarioId: string, contenido: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !contenido.trim()) return { error: 'Inválido' }

  const { error } = await supabase.from('marketplace_mensajes').insert({
    producto_id: productoId,
    remitente_id: user.id,
    destinatario_id: destinatarioId,
    contenido: contenido.trim(),
  })

  if (error) return { error: error.message }
  revalidatePath(`/marketplace/producto/${productoId}`)
  revalidatePath('/marketplace/mensajes')
  return { success: true }
}

export async function markLeido(productoId: string, remitenteId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('marketplace_mensajes')
    .update({ leido: true })
    .eq('producto_id', productoId)
    .eq('remitente_id', remitenteId)
    .eq('destinatario_id', user.id)
    .eq('leido', false)

  revalidatePath('/marketplace/mensajes')
}
