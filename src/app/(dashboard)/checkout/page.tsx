'use client'

import { useState } from 'react'
import Link from 'next/link'

const FEATURES = [
  'Chat IA ilimitado con tu mecánico personal',
  'Diagnósticos con nivel de urgencia',
  'Fotos en cada servicio',
  'Alertas cuando se acerca el próximo mantenimiento',
  'Motos ilimitadas',
  'Historial completo para siempre',
]

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCheckout() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Error al iniciar el pago')
        return
      }

      window.location.href = data.url
    } catch {
      setError('No se pudo conectar con el servidor de pagos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in max-w-md mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors font-body uppercase tracking-wider mb-8"
      >
        ← Dashboard
      </Link>

      <div className="bg-surface border-2 border-accent rounded-2xl p-8 space-y-6">
        {/* Header */}
        <div>
          <span className="text-xs text-accent font-display font-bold uppercase tracking-widest">Plan Pro</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-display text-5xl font-bold text-text-base">$9</span>
            <span className="text-text-muted font-body text-sm">/ mes</span>
          </div>
          <p className="text-text-muted text-sm font-body mt-1">Cancelá cuando quieras</p>
        </div>

        {/* Features */}
        <ul className="space-y-2">
          {FEATURES.map(f => (
            <li key={f} className="flex items-start gap-2 text-sm font-body text-text-muted">
              <span className="text-accent mt-0.5 text-xs shrink-0">✓</span>
              {f}
            </li>
          ))}
        </ul>

        {error && (
          <p className="text-sm text-red-400 font-body">{error}</p>
        )}

        {/* CTA */}
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="btn-primary w-full text-base py-4 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <span className="animate-spin inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
              Redirigiendo a pago...
            </>
          ) : (
            '🔒 Pagar con tarjeta — $9/mes'
          )}
        </button>

        <p className="text-xs text-center text-text-muted font-body">
          Pago seguro vía Stripe. No guardamos datos de tarjeta.
        </p>
      </div>
    </div>
  )
}
