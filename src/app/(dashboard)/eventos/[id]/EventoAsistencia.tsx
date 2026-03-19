'use client'
import { useTransition } from 'react'
import { setAsistencia } from '@/features/eventos/actions'

type Respuesta = 'voy' | 'tal_vez' | 'no_voy'

interface Props {
  eventoId: string
  anterior: string | null
}

const OPCIONES: { value: Respuesta; label: string; icon: string }[] = [
  { value: 'voy', label: 'Voy', icon: '✅' },
  { value: 'tal_vez', label: 'Tal vez', icon: '🤔' },
  { value: 'no_voy', label: 'No voy', icon: '❌' },
]

export function EventoAsistencia({ eventoId, anterior }: Props) {
  const [pending, startTransition] = useTransition()

  function handleClick(respuesta: Respuesta) {
    startTransition(() => {
      setAsistencia(eventoId, respuesta, anterior)
    })
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-text-muted font-body">¿Vas a esta rodada?</p>
      <div className="flex gap-2">
        {OPCIONES.map(({ value, label, icon }) => {
          const activo = anterior === value
          return (
            <button
              key={value}
              onClick={() => handleClick(value)}
              disabled={pending}
              className={`flex-1 py-2.5 rounded-lg text-sm font-body font-semibold transition-colors border ${
                activo
                  ? 'bg-accent text-bg border-accent'
                  : 'bg-transparent border-border text-text-muted hover:border-accent hover:text-accent'
              } ${pending ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {icon} {label}
            </button>
          )
        })}
      </div>
      {anterior && (
        <p className="text-xs text-text-muted font-body text-center">
          Tu respuesta: <span className="text-accent">{OPCIONES.find(o => o.value === anterior)?.label}</span>
          {' · '}
          <button
            onClick={() => handleClick(anterior as Respuesta)}
            className="underline hover:text-accent transition-colors"
          >
            Cancelar
          </button>
        </p>
      )}
    </div>
  )
}
