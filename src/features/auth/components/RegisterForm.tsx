'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { signUp } from '../actions'

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await signUp(formData)
      if (result?.error) setError(result.error)
      if (result?.message) setMessage(result.message)
    })
  }

  if (message) {
    return (
      <div className="animate-fade-in text-center">
        <div className="text-4xl mb-4">📬</div>
        <h2 className="font-display text-xl font-semibold text-text-base mb-2 uppercase tracking-wide">
          Revisa tu email
        </h2>
        <p className="text-text-muted text-sm font-body">{message}</p>
        <Link href="/login" className="inline-block mt-6 text-accent hover:text-accent-hover text-sm transition-colors">
          Volver al inicio
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-slide-up">
      <h1 className="font-display text-2xl font-semibold text-text-base mb-1 uppercase tracking-wide">
        Crea tu cuenta
      </h1>
      <p className="text-text-muted text-sm mb-8 font-body">
        Protege tu moto con Bikevzla 888
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wider mb-2 font-body">
            Nombre
          </label>
          <input
            name="nombre"
            type="text"
            required
            placeholder="Tu nombre"
            className="input-base"
            autoComplete="given-name"
          />
        </div>

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
            placeholder="Mínimo 6 caracteres"
            minLength={6}
            className="input-base"
            autoComplete="new-password"
          />
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-800/50 rounded-lg px-4 py-3 text-red-400 text-sm font-body">
            {error}
          </div>
        )}

        <button type="submit" disabled={isPending} className="btn-primary w-full mt-2">
          {isPending ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>

      <p className="text-center text-text-muted text-sm mt-6 font-body">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-accent hover:text-accent-hover transition-colors">
          Iniciar sesión
        </Link>
      </p>
    </div>
  )
}
