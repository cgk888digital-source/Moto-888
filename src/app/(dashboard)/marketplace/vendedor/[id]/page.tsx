import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getVendedor, getMisProductos, getResenasByVendedor } from '@/features/marketplace/queries'
import { ProductoCard } from '@/features/marketplace/components/ProductoCard'

export default async function VendedorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [vendedor, productos, resenas] = await Promise.all([
    getVendedor(id),
    getMisProductos(id),
    getResenasByVendedor(id),
  ])

  if (!vendedor) notFound()

  const esPropio = vendedor.user_id === user.id
  const activosCount = productos.filter(p => p.estado === 'activo').length

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header vendedor */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-bg border border-border flex items-center justify-center text-2xl flex-shrink-0">
            {vendedor.tipo === 'tienda' ? '🏪' : '👤'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-2xl font-bold text-text-base tracking-wide">
                {vendedor.nombre_tienda}
              </h1>
              {vendedor.verificado && (
                <span className="text-xs bg-green-900/40 text-green-400 px-2 py-0.5 rounded-full font-body">
                  ✓ Verificado
                </span>
              )}
            </div>
            <p className="text-sm text-text-muted font-body capitalize mt-0.5">
              {vendedor.tipo === 'tienda' ? '🏪 Tienda' : '👤 Particular'}
              {vendedor.ubicacion && <span> · 📍 {vendedor.ubicacion}</span>}
            </p>
            {vendedor.descripcion && (
              <p className="text-sm text-text-muted font-body mt-2 leading-relaxed">
                {vendedor.descripcion}
              </p>
            )}
          </div>
          {esPropio && (
            <Link
              href="/marketplace/vender"
              className="text-xs bg-accent text-bg px-3 py-1.5 rounded-lg font-body font-semibold hover:bg-amber-400 transition-colors flex-shrink-0"
            >
              + Publicar
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-border">
          <div className="text-center">
            <p className="text-xl font-display font-bold text-accent">{activosCount}</p>
            <p className="text-xs text-text-muted font-body">Productos activos</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-display font-bold text-accent">{vendedor.total_ventas}</p>
            <p className="text-xs text-text-muted font-body">Ventas realizadas</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-display font-bold text-accent">
              {vendedor.rating_promedio > 0 ? `${vendedor.rating_promedio.toFixed(1)} ⭐` : '—'}
            </p>
            <p className="text-xs text-text-muted font-body">Calificación</p>
          </div>
        </div>
      </div>

      {/* Productos */}
      <div>
        <h2 className="font-display font-bold text-lg text-text-base tracking-wide mb-3">
          Productos publicados
        </h2>

        {productos.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-10 text-center text-text-muted font-body">
            <p className="text-4xl mb-2">📦</p>
            <p className="text-sm">Sin productos publicados aún</p>
            {esPropio && (
              <Link
                href="/marketplace/vender"
                className="mt-4 inline-block text-sm bg-accent text-bg px-4 py-2 rounded-lg font-body font-semibold hover:bg-amber-400 transition-colors"
              >
                Publicar primer producto
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {productos
              .filter(p => esPropio || p.estado === 'activo')
              .map(p => (
                <ProductoCard
                  key={p.id}
                  producto={{ ...p, vendedor: { nombre_tienda: vendedor.nombre_tienda, tipo: vendedor.tipo, verificado: vendedor.verificado, ubicacion: vendedor.ubicacion, rating_promedio: vendedor.rating_promedio } }}
                />
              ))}
          </div>
        )}
      </div>

      {/* Reseñas */}
      {resenas.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
          <h2 className="font-display font-bold text-lg text-text-base tracking-wide">
            Reseñas ({resenas.length})
          </h2>
          <div className="space-y-3">
            {resenas.map((r: any) => (
              <div key={r.id} className="bg-bg border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-accent text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  <span className="text-xs text-text-muted font-body">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString('es-VE') : ''}
                  </span>
                </div>
                {r.comentario && (
                  <p className="text-sm text-text-muted font-body">{r.comentario}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <Link
        href="/marketplace"
        className="text-sm text-text-muted hover:text-accent font-body transition-colors inline-block"
      >
        ← Volver al marketplace
      </Link>
    </div>
  )
}
