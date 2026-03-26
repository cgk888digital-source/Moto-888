'use client'
import { useState, useTransition } from 'react'
import { joinGroup } from '@/features/grupos/actions'

interface Props {
  grupoId: string
  grupoNombre: string
}

export function JoinGroupFlow({ grupoId, grupoNombre }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [isPending, start] = useTransition()
  const [cilindrada, setCilindrada] = useState('')
  const [acompanantes, setAcompanantes] = useState(0)
  const [nota, setNota] = useState('')

  async function handleSubmit() {
    start(async () => {
      await joinGroup(grupoId, { cilindrada, acompanantes, nota })
    })
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full py-3 bg-accent text-bg font-display font-bold rounded-xl shadow-lg shadow-accent/20 hover:bg-amber-400 transition-all flex items-center justify-center gap-2"
      >
        🏁 ¡Quiero unirme a la Rodada!
      </button>
    )
  }

  return (
    <div className="bg-surface-2 border border-border rounded-xl p-5 space-y-4 animate-in slide-in-from-top-2">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-text-base">Detalles de tu participación</h3>
        <button onClick={() => setShowForm(false)} className="text-xs text-text-muted hover:text-accent">Cancelar</button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-text-muted ml-1">Cilindrada (cc)</label>
          <input 
            value={cilindrada}
            onChange={e => setCilindrada(e.target.value)}
            placeholder="Ej: 600cc"
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base focus:border-accent outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-text-muted ml-1">Acompañantes</label>
          <input 
            type="number"
            min={0}
            max={5}
            value={acompanantes}
            onChange={e => setAcompanantes(parseInt(e.target.value))}
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base focus:border-accent outline-none"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] uppercase font-bold text-text-muted ml-1">Mensaje para el grupo (opcional)</label>
        <textarea 
          value={nota}
          onChange={e => setNota(e.target.value)}
          placeholder="Ej: Llevo herramientas básicas..."
          rows={2}
          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base focus:border-accent outline-none resize-none"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full py-3 bg-accent text-bg font-display font-bold rounded-xl hover:bg-amber-400 transition-all disabled:opacity-50"
      >
        {isPending ? 'Procesando...' : '🚀 Confirmar Inscripción'}
      </button>
      
      <p className="text-[10px] text-center text-text-muted font-body">
        Al unirte podrás participar en el chat privado de {grupoNombre}.
      </p>
    </div>
  )
}
