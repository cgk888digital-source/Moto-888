'use client'

import { useState, useTransition } from 'react'
import { updatePassword } from '@/features/auth/actions'

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }

    const formData = new FormData()
    formData.set('password', password)

    startTransition(async () => {
      const result = await updatePassword(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="animate-slide-up">
      <h1 className="font-display text-2xl font-semibold text-text-base mb-1 uppercase tracking-wide">
        Nueva contraseña
      </h1>
      <p className="text-text-muted text-sm mb-8 font-body">
        Elige una nueva contraseña para tu cuenta
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wider mb-2 font-body">
            Nueva contraseña
          </label>
          <input
            type="password"
            required
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="input-base"
            autoComplete="new-password"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wider mb-2 font-body">
            Confirmar contraseña
          </label>
          <input
            type="password"
            required
            placeholder="Repite la contraseña"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className="input-base"
            autoComplete="new-password"
          />
        </div>

        {/* Indicador de coincidencia */}
        {confirm.length > 0 && (
          <p className={`text-xs font-body ${password === confirm ? 'text-green-400' : 'text-red-400'}`}>
            {password === confirm ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
          </p>
        )}

        {error && (
          <div className="bg-red-950/50 border border-red-800/50 rounded-lg px-4 py-3 text-red-400 text-sm font-body">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || !password || !confirm}
          className="btn-primary w-full mt-2"
        >
          {isPending ? 'Guardando...' : 'Guardar nueva contraseña'}
        </button>
      </form>
    </div>
  )
}
