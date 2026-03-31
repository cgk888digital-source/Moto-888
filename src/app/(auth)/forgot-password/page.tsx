'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { requestPasswordReset } from '@/features/auth/actions'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await requestPasswordReset(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setSent(true)
      }
    })
  }

  if (sent) {
    return (
      <div className="animate-slide-up text-center">
        <div className="w-16 h-16 rounded-full bg-secondary/10 border border-secondary/30 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-semibold text-text-base uppercase tracking-wide mb-2">
          Revisa tu correo
        </h1>
        <p className="text-text-muted text-sm font-body mb-2">
          Enviamos un enlace de recuperación a
        </p>
        <p className="text-text-base text-sm font-body font-semibold mb-6">
          {email}
        </p>
        <p className="text-text-muted text-xs font-body mb-8">
          Haz clic en el enlace del correo para crear una nueva contraseña. Puede tardar unos minutos en llegar.
        </p>
        <Link href="/login" className="text-secondary hover:text-secondary-hover text-sm font-body transition-colors">
          ← Volver al inicio de sesión
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-slide-up">
      <h1 className="font-display text-2xl font-semibold text-text-base mb-1 uppercase tracking-wide">
        Recuperar contraseña
      </h1>
      <p className="text-text-muted text-sm mb-8 font-body">
        Ingresa tu email y te enviamos un enlace para crear una nueva contraseña
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wider mb-2 font-body">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder="tu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input-base"
            autoComplete="email"
            autoFocus
          />
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-800/50 rounded-lg px-4 py-3 text-red-400 text-sm font-body">
            {error}
          </div>
        )}

        <button type="submit" disabled={isPending || !email.trim()} className="btn-primary w-full mt-2">
          {isPending ? 'Enviando...' : 'Enviar enlace de recuperación'}
        </button>
      </form>

      <p className="text-center text-text-muted text-sm mt-6 font-body">
        <Link href="/login" className="text-secondary hover:text-secondary-hover transition-colors">
          ← Volver al inicio de sesión
        </Link>
      </p>
    </div>
  )
}
