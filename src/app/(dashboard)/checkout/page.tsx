'use client'

import { useState } from 'react'
import Link from 'next/link'

const PLANS = [
  {
    id: 'standard',
    name: 'Standard',
    price: 10,
    description: 'Perfecto para el día a día',
    features: [
      'Registro de 1 Motocicleta',
      'Historial de mantenimiento digital',
      'Alertas de servicio básicas',
      'Chat IA (5 consultas/mes)',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 20,
    popular: true,
    description: 'La opción de los viajeros',
    features: [
      'Hasta 3 Motocicletas',
      'Historial con fotos ilimitadas',
      'Chat IA con mecánico ilimitado',
      'Soporte prioritario',
      'Acceso a grupos exclusivos',
    ],
  },
  {
    id: 'elite',
    name: 'Elite / RoadGuardian',
    price: 40,
    description: 'Seguridad y potencia total',
    features: [
      'Motos Ilimitadas',
      'Activación de Kit NFC incluida',
      'RoadGuardian Activo (S.O.S)',
      'Publicaciones destacadas en Marketplace',
      'Telemetría avanzada de rutas',
    ],
  },
]

export default function CheckoutPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCheckout(planId: string) {
    setLoadingPlan(planId)
    setError(null)

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Error al iniciar el pago')
        return
      }

      window.location.href = data.url
    } catch {
      setError('No se pudo conectar con el servidor de pagos')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="animate-fade-in max-w-6xl mx-auto px-4 pb-20">
      <div className="text-center mb-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors font-body uppercase tracking-wider mb-8"
        >
          ← Dashboard
        </Link>
        <h1 className="font-display text-4xl font-bold text-text-base mb-4">Elige tu plan BikeVzla 888</h1>
        <p className="text-text-muted font-body max-w-lg mx-auto">
          Potencia tu experiencia, protege tu moto y únete a la comunidad de motociclistas más grande de Venezuela.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map(plan => (
          <div
            key={plan.id}
            className={`relative bg-surface border-2 rounded-2xl p-8 flex flex-col transition-all duration-300 hover:transform hover:-translate-y-1 ${
              plan.popular ? 'border-accent shadow-lg shadow-accent/10' : 'border-border'
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-bg text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                Más Popular
              </span>
            )}

            <div className="mb-8">
              <h3 className="font-display text-xl font-bold text-text-base mb-1">{plan.name}</h3>
              <p className="text-text-muted text-sm font-body mb-4">{plan.description}</p>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold text-text-base">${plan.price}</span>
                <span className="text-text-muted font-body text-sm">/ mes</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8 flex-grow">
              {plan.features.map(f => (
                <li key={f} className="flex items-start gap-3 text-sm font-body text-text-muted">
                  <span className="text-accent mt-0.5 shrink-0 text-xs">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleCheckout(plan.id)}
              disabled={!!loadingPlan}
              className={`w-full py-4 rounded-xl font-display font-bold transition-all flex items-center justify-center gap-2 ${
                plan.popular ? 'bg-accent text-bg hover:bg-amber-400' : 'bg-surface-2 text-text-base border border-border hover:border-accent'
              } disabled:opacity-50`}
            >
              {loadingPlan === plan.id ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                  Procesando...
                </>
              ) : (
                `Seleccionar Plan ${plan.name}`
              )}
            </button>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-center mt-8 text-red-400 font-body bg-red-950/20 py-3 rounded-lg border border-red-900/50">
          {error}
        </p>
      )}

      <div className="mt-12 text-center text-xs text-text-muted font-body space-y-2">
        <p>🔒 Pagos seguros procesados por Stripe. Tu información está encriptada.</p>
        <p>Cancela tu suscripción en cualquier momento desde tu perfil.</p>
      </div>
    </div>
  )
}
