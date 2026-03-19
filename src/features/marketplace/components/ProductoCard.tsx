import Link from 'next/link'
import type { Producto } from '../types'
import { COMISION_POR_PRECIO } from '../types'

export function ProductoCard({ producto }: { producto: Producto }) {
  const comision = COMISION_POR_PRECIO(producto.precio)
  const totalComprador = (producto.precio * (1 + comision)).toFixed(2)
  const foto = producto.fotos?.[0]

  return (
    <Link href={`/marketplace/producto/${producto.id}`} className="block bg-surface border border-border rounded-xl overflow-hidden hover:border-accent transition-colors group">
      {/* Foto */}
      <div className="h-40 bg-bg flex items-center justify-center overflow-hidden">
        {foto ? (
          <img src={foto} alt={producto.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <span className="text-4xl opacity-30">🔩</span>
        )}
      </div>

      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-text-base font-body line-clamp-2 group-hover:text-accent transition-colors">
            {producto.titulo}
          </h3>
          <span className={`text-xs px-1.5 py-0.5 rounded font-body flex-shrink-0 ${
            producto.condicion === 'nuevo' ? 'bg-green-900/40 text-green-400' : 'bg-surface border border-border text-text-muted'
          }`}>
            {producto.condicion === 'nuevo' ? 'Nuevo' : 'Usado'}
          </span>
        </div>

        <div>
          <p className="text-lg font-display font-bold text-accent">${producto.precio}</p>
          <p className="text-xs text-text-muted font-body">Comprás por ${totalComprador} ({(comision * 100).toFixed(1)}% com.)</p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted font-body">{producto.categoria}</span>
          {producto.vendedor && (
            <span className="text-xs text-text-muted font-body flex items-center gap-1">
              {producto.vendedor.verificado && <span className="text-green-400">✓</span>}
              {producto.vendedor.nombre_tienda}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
