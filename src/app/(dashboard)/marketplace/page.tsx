import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getProductos, getVendedorByUserId } from '@/features/marketplace/queries'
import { ProductoCard } from '@/features/marketplace/components/ProductoCard'
import { CATEGORIAS } from '@/features/marketplace/types'

interface Props {
  searchParams: Promise<{ categoria?: string; condicion?: string; q?: string }>
}

export default async function MarketplacePage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const [productos, vendedor] = await Promise.all([
    getProductos(params),
    getVendedorByUserId(user.id),
  ])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="font-display text-2xl font-bold text-text-base tracking-wide uppercase">
          Market<span className="text-accent">place</span>
        </h1>
        <div className="flex gap-2">
          <Link href="/marketplace/mis-compras" className="btn-ghost text-xs px-3 py-2">
            Mis compras
          </Link>
          {vendedor ? (
            <Link href="/marketplace/vender" className="bg-accent text-bg px-4 py-2 rounded-lg text-sm font-body font-semibold hover:bg-amber-400 transition-colors">
              + Publicar producto
            </Link>
          ) : (
            <Link href="/marketplace/vender" className="border border-accent text-accent px-4 py-2 rounded-lg text-sm font-body font-semibold hover:bg-accent/10 transition-colors">
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
            className="flex-1 min-w-48 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-base placeholder-text-muted focus:outline-none focus:border-accent font-body"
          />
          <select name="categoria" defaultValue={params.categoria ?? ''}
            className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-base focus:outline-none focus:border-accent font-body">
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select name="condicion" defaultValue={params.condicion ?? ''}
            className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-base focus:outline-none focus:border-accent font-body">
            <option value="">Nuevo y Usado</option>
            <option value="nuevo">Nuevo</option>
            <option value="usado">Usado</option>
          </select>
          <button type="submit" className="bg-accent text-bg px-4 py-2 rounded-lg text-sm font-body font-semibold hover:bg-amber-400 transition-colors">
            Buscar
          </button>
          {(params.q || params.categoria || params.condicion) && (
            <Link href="/marketplace" className="text-sm text-text-muted hover:text-accent font-body py-2 transition-colors">
              Limpiar
            </Link>
          )}
        </form>
      </div>

      {/* Zero commission banner */}
      <div className="bg-accent/10 border border-accent/30 rounded-xl px-4 py-3 flex items-center gap-3">
        <span className="text-2xl">🎯</span>
        <div>
          <p className="text-sm font-semibold text-accent font-body">CERO comisión al vendedor</p>
          <p className="text-xs text-text-muted font-body">Publicá gratis. Solo el comprador paga una pequeña comisión de plataforma (1–3%).</p>
        </div>
      </div>

      {/* Grid productos */}
      {productos.length === 0 ? (
        <div className="text-center py-16 text-text-muted font-body">
          <p className="text-5xl mb-3">🔩</p>
          <p className="text-sm">No hay productos que coincidan con tu búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {productos.map(p => <ProductoCard key={p.id} producto={p} />)}
        </div>
      )}
    </div>
  )
}
