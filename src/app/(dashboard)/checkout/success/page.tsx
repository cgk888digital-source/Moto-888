import Link from 'next/link'

export default function CheckoutSuccessPage() {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-6xl mb-6">🎉</div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-text-base mb-3">
        ¡Ya sos Pro!
      </h1>
      <p className="text-text-muted font-body text-sm max-w-sm mb-8 leading-relaxed">
        Tu plan fue activado. Ahora tenés acceso ilimitado al Chat IA y todas las funciones Pro de Bikevzla 888.
      </p>
      <Link href="/dashboard" className="btn-primary px-8 py-3">
        Ir al dashboard
      </Link>
    </div>
  )
}
