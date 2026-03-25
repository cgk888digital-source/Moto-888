import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getProducto, getMensajes } from '@/features/marketplace/queries'
import { ProductoDetailClient } from './ProductoDetailClient'

export default async function ProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [producto, mensajes] = await Promise.all([
    getProducto(id),
    getMensajes(id, user.id),
  ])

  if (!producto) notFound()

  const { data: guardado } = await supabase
    .from('marketplace_guardados')
    .select('producto_id')
    .match({ producto_id: id, user_id: user.id })
    .single()

  return (
    <ProductoDetailClient
      producto={producto}
      mensajes={mensajes}
      userId={user.id}
      vendedorUserId={producto.vendedor?.user_id ?? ''}
      isGuardado={!!guardado}
    />
  )
}
