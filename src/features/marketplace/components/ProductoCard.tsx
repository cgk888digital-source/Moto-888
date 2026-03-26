'use client'

import { memo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Producto } from '../types'
import { COMISION_POR_PRECIO } from '../types'

interface Props {
  producto: Producto
}

export const ProductoCard = memo(function ProductoCard({ producto }: Props) {
  const comision = COMISION_POR_PRECIO(producto.precio)
  const totalComprador = (producto.precio * (1 + comision)).toFixed(2)
  const foto = producto.fotos?.[0]

  return (
    <Link 
      href={`/marketplace/producto/${producto.id}`} 
      className="block bg-surface border border-border rounded-xl overflow-hidden hover:border-accent transition-colors group"
      aria-label={`Ver producto: ${producto.titulo}`}
    >
      <div className="h-40 bg-bg flex items-center justify-center overflow-hidden relative">
        {foto ? (
          <Image
            src={foto}
            alt={producto.titulo}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-4xl opacity-30" aria-hidden="true">🔩</span>
        )}
      </div>

      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-text-base font-body line-clamp-2 group-hover:text-accent transition-colors">
            {producto.titulo}
          </h3>
          <span 
            className={`text-xs px-1.5 py-0.5 rounded font-body flex-shrink-0 ${
              producto.condicion === 'nuevo' ? 'bg-green-900/40 text-green-400' : 'bg-surface border border-border text-text-muted'
            }`}
            aria-label={`Condición: ${producto.condicion === 'nuevo' ? 'Nuevo' : 'Usado'}`}
          >
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
              {producto.vendedor.verificado && <span className="text-green-400" aria-label="Vendedor verificado">✓</span>}
              {producto.vendedor.nombre_tienda}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
})
