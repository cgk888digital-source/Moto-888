'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  userId: string
  initialNombre: string
  email: string
}

export function PerfilForm({ userId, initialNombre, email }: Props) {
  const [nombre, setNombre] = useState(initialNombre)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!nombre.trim() || loading) return

    setLoading(true)
    setError(null)
    setSaved(false)

    const supabase = createClient()
    const { error: err } = await supabase
      .from('users')
      .update({ nombre: nombre.trim() })
      .eq('id', userId)

    setLoading(false)

    if (err) {
      setError(err.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label-field">Email</label>
        <input
          type="email"
          value={email}
          disabled
          className="input-field opacity-50 cursor-not-allowed"
        />
      </div>
      <div>
        <label className="label-field">Nombre</label>
        <input
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder="Tu nombre"
          className="input-field"
        />
      </div>

      {error && <p className="text-sm text-red-400 font-body">{error}</p>}

      <button
        type="submit"
        disabled={!nombre.trim() || loading}
        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {loading ? (
          <>
            <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
            Guardando...
          </>
        ) : saved ? '✓ Guardado' : 'Guardar cambios'}
      </button>
    </form>
  )
}
