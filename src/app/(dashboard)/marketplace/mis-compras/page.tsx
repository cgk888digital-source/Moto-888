import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getMisCompras, getResenasByTransaccion } from '@/features/marketplace/queries'
import { ResenaForm } from './ResenaForm'
import Link from 'next/link'
import Image from 'next/image'

const ESTADO_CONFIG: Record<string, { label: string; color: string }> = {
  completada: { label: 'Completada', color: 'text-green-400 bg-green-400/10 border-green-400/20' },
  pendiente:  { label: 'Pendiente',  color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  cancelada:  { label: 'Cancelada',  color: 'text-red-400 bg-red-400/10 border-red-400/20' },
}

export default async function MisComprasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const compras = await getMisCompras(user.id)
  const idsResenados = await getResenasByTransaccion(compras.map(c => c.id))

  return (
    <div className="animate-fade-in space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/marketplace" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors font-body uppercase tracking-wider mb-2">
            ← Marketplace
          </Link>
          <h1 className="font-display text-3xl font-bold text-text-base uppercase tracking-wide">Mis compras</h1>
        </div>
      </div>

      {compras.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-border rounded-2xl">
          <p className="text-5xl mb-4">🛒</p>
          <p className="font-display text-xl font-bold text-text-base uppercase tracking-wide mb-2">Sin compras aún</p>
          <p className="text-text-muted font-body text-sm mb-6">Explora el marketplace para encontrar repuestos y accesorios</p>
          <Link href="/marketplace" className="btn-primary">Ir al marketplace</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {compras.map(compra => {
            const producto = Array.isArray(compra.producto) ? compra.producto[0] : compra.producto
            const vendedor = Array.isArray(compra.vendedor) ? compra.vendedor[0] : compra.vendedor
            const yaResenado = idsResenados.includes(compra.id)
            const estado = (compra.estado ?? 'pendiente') as string
            const cfg = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG.pendiente

            return (
              <div key={compra.id} className="bg-surface border border-border rounded-2xl p-5 space-y-4">
                {/* Producto */}
                <div className="flex gap-4">
                  {producto?.fotos?.[0] && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-surface-2">
                      <Image src={producto.fotos[0]} alt={producto.titulo ?? ''} width={64} height={64} className="object-cover w-full h-full" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link href={`/marketplace/producto/${producto?.id}`}
                      className="font-display font-bold text-text-base hover:text-accent transition-colors text-sm uppercase tracking-wide line-clamp-1">
                      {producto?.titulo ?? 'Producto'}
                    </Link>
                    {vendedor && (
                      <p className="text-xs text-text-muted font-body">Vendedor: {vendedor.nombre_tienda}</p>
                    )}
                    <p className="text-xs text-text-muted font-body">
                      {compra.created_at ? new Date(compra.created_at).toLocaleDateString('es-VE') : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display font-bold text-accent">${compra.total_pagado?.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-body ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                </div>

                {/* Desglose de precio */}
                <div className="bg-bg border border-border rounded-lg px-4 py-3 grid grid-cols-3 gap-2 text-center text-xs font-body">
                  <div>
                    <p className="text-text-muted">Precio base</p>
                    <p className="text-text-base font-semibold">${compra.precio_base?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-text-muted">Comisión plataforma</p>
                    <p className="text-text-base font-semibold">${compra.comision_monto?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-text-muted">Total pagado</p>
                    <p className="text-accent font-bold">${compra.total_pagado?.toFixed(2)}</p>
                  </div>
                </div>

                {/* Reseña */}
                {estado === 'completada' && vendedor && (
                  yaResenado ? (
                    <div className="flex items-center gap-2 text-xs text-green-400 font-body">
                      <span>✓</span> Reseña enviada
                    </div>
                  ) : (
                    <ResenaForm transaccionId={compra.id} vendedorId={vendedor.id} />
                  )
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
