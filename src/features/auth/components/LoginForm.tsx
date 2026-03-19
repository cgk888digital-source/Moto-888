'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { signIn } from '../actions'

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await signIn(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="animate-slide-up">
      <h1 className="font-display text-2xl font-semibold text-text-base mb-1 uppercase tracking-wide">
        Bienvenido
      </h1>
      <p className="text-text-muted text-sm mb-8 font-body">
        Accede a tu cuenta MotoSafe
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
            className="input-base"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wider mb-2 font-body">
            Contraseña
          </label>
          <input
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="input-base"
            autoComplete="current-password"
          />
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-800/50 rounded-lg px-4 py-3 text-red-400 text-sm font-body">
            {error}
          </div>
        )}

        <button type="submit" disabled={isPending} className="btn-primary w-full mt-2">
          {isPending ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="text-center text-text-muted text-sm mt-6 font-body">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="text-accent hover:text-accent-hover transition-colors">
          Regístrate
        </Link>
      </p>
    </div>
  )
}
