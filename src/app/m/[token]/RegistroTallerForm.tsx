'use client'

import { useState } from 'react'
import { TIPOS_SERVICIO } from '@/features/mantenimientos/types'

interface Props {
  token: string
  motoLabel: string
  kmActuales: number
}

type FormState = 'idle' | 'loading' | 'success' | 'error'

export default function RegistroTallerForm({ token, motoLabel, kmActuales }: Props) {
  const [state, setState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('loading')

    const form = e.currentTarget
    const data = new FormData(form)

    const payload = {
      token,
      tipo_servicio: data.get('tipo_servicio') as string,
      km_registrado: Number(data.get('km_registrado')),
      notas_mecanico: data.get('notas_mecanico') as string,
      costo_cobrado: data.get('costo_cobrado') as string,
    }

    const res = await fetch('/api/taller', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      setState('success')
    } else {
      const json = await res.json()
      setErrorMsg(json.error ?? 'Error al registrar')
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
          <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-semibold text-green-400">Servicio registrado</p>
        <p className="mt-1 text-sm text-zinc-400">El dueño de {motoLabel} recibirá una notificación para confirmar.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          Servicio realizado <span className="text-amber-500">*</span>
        </label>
        <select
          name="tipo_servicio"
          required
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
        >
          <option value="">Seleccionar...</option>
          {TIPOS_SERVICIO.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          KM al momento del servicio <span className="text-amber-500">*</span>
        </label>
        <input
          type="number"
          name="km_registrado"
          required
          min={kmActuales}
          defaultValue={kmActuales}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          Notas del mecánico
        </label>
        <textarea
          name="notas_mecanico"
          rows={3}
          placeholder="Detalles del servicio, piezas cambiadas, observaciones..."
          className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          Costo cobrado ($)
        </label>
        <input
          type="number"
          name="costo_cobrado"
          min={0}
          step={0.01}
          placeholder="0.00"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
        />
      </div>

      {state === 'error' && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={state === 'loading'}
        className="w-full rounded-lg bg-amber-500 px-4 py-3 font-semibold text-black transition hover:bg-amber-400 disabled:opacity-50"
      >
        {state === 'loading' ? 'Registrando...' : 'Registrar servicio'}
      </button>
    </form>
  )
}
