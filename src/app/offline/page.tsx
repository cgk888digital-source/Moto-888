'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-dvh bg-bg flex flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl mb-6">🏍️</p>
      <h1 className="font-display text-3xl font-bold text-text-base uppercase tracking-wide mb-3">
        Sin conexión
      </h1>
      <p className="text-text-muted font-body text-sm max-w-xs">
        No hay internet en este momento. Tu historial de mantenimientos y tus motos están disponibles cuando vuelvas a conectarte.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-8 btn-primary"
      >
        Reintentar
      </button>
    </div>
  )
}
