import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getProducto } from '@/features/marketplace/queries'
import { VenderForm } from '@/app/(dashboard)/marketplace/vender/VenderForm'
import Link from 'next/link'

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const producto = await getProducto(id)
  if (!producto) notFound()

  // Verificar que el usuario sea el dueño
  if (producto.vendedor?.user_id !== user.id) {
    redirect(`/marketplace/producto/${id}`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href={`/marketplace/producto/${id}`} className="text-sm text-text-muted hover:text-accent font-body transition-colors">
          ← Volver al producto
        </Link>
        <h1 className="font-display text-xl font-bold text-text-base">Editar Publicación</h1>
      </div>

      <VenderForm vendedor={null} producto={producto} />
    </div>
  )
}
