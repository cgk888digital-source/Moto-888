import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getProductos, getVendedorByUserId } from '@/features/marketplace/queries'
import { ProductoCard } from '@/features/marketplace/components/ProductoCard'
import { CATEGORIAS } from '@/features/marketplace/types'

interface Props {
  searchParams: Promise<{ categoria?: string; condicion?: string; q?: string; page?: string }>
}

export default async function MarketplacePage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const page = parseInt(params.page ?? '1', 10)
  
  const [result, vendedor] = await Promise.all([
    getProductos({ ...params, page }),
    getVendedorByUserId(user.id),
  ])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-7 w-1 rounded-full bg-secondary" />
          <h1 className="font-display text-2xl font-bold text-text-base tracking-wide uppercase">
            Market<span className="text-secondary">place</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <Link href="/marketplace/mis-compras" className="btn-ghost text-xs px-3 py-2">
            Mis compras
          </Link>
          {vendedor ? (
            <Link href="/marketplace/vender" className="bg-accent text-bg px-4 py-2 rounded-lg text-sm font-body font-semibold hover:bg-amber-400 transition-colors">
              + Publicar producto
            </Link>
          ) : (
            <Link href="/marketplace/vender" className="border border-secondary text-secondary px-4 py-2 rounded-lg text-sm font-body font-semibold hover:bg-secondary-muted transition-colors">
              Vender en Bikevzla 888
            </Link>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <form method="GET" className="flex flex-wrap gap-2 w-full">
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Buscar repuestos, accesorios..."
            className="flex-1 min-w-48 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-base placeholder-text-muted focus:outline-none focus:border-secondary font-body"
            aria-label="Buscar productos"
          />
          <select 
            name="categoria" 
            defaultValue={params.categoria ?? ''}
            className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-base focus:outline-none focus:border-secondary font-body"
            aria-label="Filtrar por categoría"
          >
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select 
            name="condicion" 
            defaultValue={params.condicion ?? ''}
            className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-base focus:outline-none focus:border-secondary font-body"
            aria-label="Filtrar por condición"
          >
            <option value="">Nuevo y Usado</option>
            <option value="nuevo">Nuevo</option>
            <option value="usado">Usado</option>
          </select>
          <input type="hidden" name="page" value="1" />
          <button type="submit" className="bg-accent text-bg px-4 py-2 rounded-lg text-sm font-body font-semibold hover:bg-amber-400 transition-colors">
            Buscar
          </button>
          {(params.q || params.categoria || params.condicion) && (
            <Link href="/marketplace" className="text-sm text-text-muted hover:text-secondary font-body py-2 transition-colors">
              Limpiar
            </Link>
          )}
        </form>
      </div>

      {/* Zero commission banner */}
      <div className="bg-accent/10 border border-accent/30 rounded-xl px-4 py-3 flex items-center gap-3">
        <span className="text-2xl" aria-hidden="true">🎯</span>
        <div>
          <p className="text-sm font-semibold text-accent font-body">CERO comisión al vendedor</p>
          <p className="text-xs text-text-muted font-body">Publicá gratis. Solo el comprador paga una pequeña comisión de plataforma (1–3%).</p>
        </div>
      </div>

      {/* Grid productos */}
      {result.productos.length === 0 ? (
        <div className="text-center py-16 text-text-muted font-body">
          <p className="text-5xl mb-3" aria-hidden="true">🔩</p>
          <p className="text-sm">No hay productos que coincidan con tu búsqueda.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-text-muted font-body">
            Mostrando {result.productos.length} de {result.total} productos
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {result.productos.map(p => <ProductoCard key={p.id} producto={p} />)}
          </div>
          
          {/* Pagination */}
          {result.totalPages > 1 && (
            <nav className="flex justify-center gap-2" aria-label="Paginación">
              {page > 1 && (
                <Link
                  href={`/marketplace?${new URLSearchParams({
                    ...(params.q && { q: params.q }),
                    ...(params.categoria && { categoria: params.categoria }),
                    ...(params.condicion && { condicion: params.condicion }),
                    page: String(page - 1),
                  })}`}
                  className="px-3 py-2 bg-surface border border-border rounded-lg text-sm font-body hover:border-secondary transition-colors"
                  aria-label="Página anterior"
                >
                  ← Anterior
                </Link>
              )}
              <span className="px-3 py-2 text-text-muted font-body text-sm">
                Página {page} de {result.totalPages}
              </span>
              {result.hasMore && (
                <Link
                  href={`/marketplace?${new URLSearchParams({
                    ...(params.q && { q: params.q }),
                    ...(params.categoria && { categoria: params.categoria }),
                    ...(params.condicion && { condicion: params.condicion }),
                    page: String(page + 1),
                  })}`}
                  className="px-3 py-2 bg-surface border border-border rounded-lg text-sm font-body hover:border-secondary transition-colors"
                  aria-label="Página siguiente"
                >
                  Siguiente →
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  )
}
