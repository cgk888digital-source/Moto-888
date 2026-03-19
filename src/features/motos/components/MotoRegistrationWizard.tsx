'use client'

import { useState, useTransition } from 'react'
import { createMoto, updateUserNombre } from '../actions'
import { MotoFormData, TipoAceite, KitTipo, MARCAS_MOTO } from '../types'

const YEAR_CURRENT = new Date().getFullYear()
const YEARS = Array.from({ length: 35 }, (_, i) => YEAR_CURRENT - i)

const KIT_OPTIONS: { value: KitTipo; label: string; description: string; icon: string }[] = [
  { value: 'digital', label: 'Digital', description: 'QR en tu móvil, sin hardware', icon: '📱' },
  { value: 'sticker', label: 'Sticker NFC', description: 'Pegatina NFC para tu moto', icon: '🏷️' },
  { value: 'llavero', label: 'Llavero NFC', description: 'Llavero NFC premium', icon: '🔑' },
]

const ACEITE_OPTIONS: { value: TipoAceite; label: string; description: string }[] = [
  { value: 'mineral', label: 'Mineral', description: 'Clásico, económico' },
  { value: 'semi-sintetico', label: 'Semi-sintético', description: 'Balance calidad/precio' },
  { value: 'sintetico', label: 'Sintético', description: 'Mayor rendimiento' },
]

export function MotoRegistrationWizard({ initialNombre }: { initialNombre?: string | null }) {
  const [step, setStep] = useState(1)
  const [nombre, setNombre] = useState(initialNombre ?? '')
  const [motoData, setMotoData] = useState<Partial<MotoFormData>>({
    tipo_aceite: 'mineral',
    es_nueva: false,
    km_actuales: 0,
    kit_tipo: 'digital',
    ano: YEAR_CURRENT,
  })
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function nextStep() { setStep(s => s + 1) }
  function prevStep() { setStep(s => s - 1) }

  function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre.trim()) return
    startTransition(async () => {
      await updateUserNombre(nombre.trim())
      nextStep()
    })
  }

  function handleStep2(e: React.FormEvent) {
    e.preventDefault()
    if (!motoData.marca || !motoData.modelo) return
    nextStep()
  }

  function handleFinal(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await createMoto(motoData as MotoFormData)
      if (result?.error) setError(result.error)
    })
  }

  const totalSteps = 3

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="mb-10 text-center">
        <span className="font-display text-3xl font-bold tracking-widest text-accent uppercase">
          Moto<span className="text-text-base">Safe</span>
        </span>
      </div>

      {/* Progress */}
      <div className="w-full max-w-md mb-8">
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="flex-1 flex items-center gap-2">
              <div
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  i < step ? 'bg-accent' : 'bg-surface-2'
                }`}
              />
            </div>
          ))}
        </div>
        <p className="text-text-muted text-xs font-body mt-2 text-right">
          Paso {step} de {totalSteps}
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 animate-slide-up">

        {/* STEP 1: Nombre */}
        {step === 1 && (
          <form onSubmit={handleStep1}>
            <h2 className="font-display text-2xl font-semibold text-text-base uppercase tracking-wide mb-1">
              Hola, ¿cómo te llamas?
            </h2>
            <p className="text-text-muted text-sm font-body mb-8">
              Te personalizamos la experiencia
            </p>

            <div className="space-y-4">
              <input
                type="text"
                required
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Tu nombre"
                className="input-base text-lg"
                autoFocus
              />
            </div>

            <div className="mt-8 flex justify-end">
              <button type="submit" disabled={isPending || !nombre.trim()} className="btn-primary">
                {isPending ? 'Guardando...' : 'Continuar →'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Tu moto */}
        {step === 2 && (
          <form onSubmit={handleStep2}>
            <h2 className="font-display text-2xl font-semibold text-text-base uppercase tracking-wide mb-1">
              Cuéntame tu moto
            </h2>
            <p className="text-text-muted text-sm font-body mb-8">
              Registramos los datos para hacerle seguimiento
            </p>

            <div className="space-y-5">
              {/* Marca */}
              <div>
                <label className="block text-xs text-text-muted uppercase tracking-wider mb-2 font-body">
                  Marca
                </label>
                <select
                  required
                  value={motoData.marca ?? ''}
                  onChange={e => setMotoData(d => ({ ...d, marca: e.target.value }))}
                  className="input-base"
                >
                  <option value="" disabled>Selecciona la marca</option>
                  {MARCAS_MOTO.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Modelo */}
              <div>
                <label className="block text-xs text-text-muted uppercase tracking-wider mb-2 font-body">
                  Modelo
                </label>
                <input
                  type="text"
                  required
                  value={motoData.modelo ?? ''}
                  onChange={e => setMotoData(d => ({ ...d, modelo: e.target.value }))}
                  placeholder="ej. MT-07, CBR600, GS 750..."
                  className="input-base"
                />
              </div>

              {/* Año y KM en fila */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-text-muted uppercase tracking-wider mb-2 font-body">
                    Año
                  </label>
                  <select
                    value={motoData.ano ?? YEAR_CURRENT}
                    onChange={e => setMotoData(d => ({ ...d, ano: Number(e.target.value) }))}
                    className="input-base"
                  >
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-text-muted uppercase tracking-wider mb-2 font-body">
                    KM actuales
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={motoData.km_actuales ?? 0}
                    onChange={e => setMotoData(d => ({ ...d, km_actuales: Number(e.target.value) }))}
                    className="input-base"
                  />
                </div>
              </div>

              {/* Tipo de aceite */}
              <div>
                <label className="block text-xs text-text-muted uppercase tracking-wider mb-3 font-body">
                  Tipo de aceite
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ACEITE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setMotoData(d => ({ ...d, tipo_aceite: opt.value }))}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        motoData.tipo_aceite === opt.value
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border text-text-muted hover:border-text-muted'
                      }`}
                    >
                      <div className="font-display font-semibold text-xs uppercase tracking-wide">
                        {opt.label}
                      </div>
                      <div className="text-xs font-body mt-0.5 opacity-70">{opt.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ¿Es nueva? */}
              <div className="flex items-center justify-between py-3 border-t border-border">
                <div>
                  <p className="text-sm text-text-base font-body">¿Es una moto nueva?</p>
                  <p className="text-xs text-text-muted font-body">Recién comprada o 0 km</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMotoData(d => ({ ...d, es_nueva: !d.es_nueva }))}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    motoData.es_nueva ? 'bg-accent' : 'bg-surface-2'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      motoData.es_nueva ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Fecha de compra (opcional) */}
              {!motoData.es_nueva && (
                <div>
                  <label className="block text-xs text-text-muted uppercase tracking-wider mb-2 font-body">
                    Fecha de compra <span className="normal-case">(opcional)</span>
                  </label>
                  <input
                    type="date"
                    value={motoData.fecha_compra ?? ''}
                    onChange={e => setMotoData(d => ({ ...d, fecha_compra: e.target.value || null }))}
                    className="input-base"
                  />
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-between">
              <button type="button" onClick={prevStep} className="btn-ghost">
                ← Volver
              </button>
              <button
                type="submit"
                disabled={!motoData.marca || !motoData.modelo}
                className="btn-primary"
              >
                Continuar →
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Kit MotoSafe */}
        {step === 3 && (
          <form onSubmit={handleFinal}>
            <h2 className="font-display text-2xl font-semibold text-text-base uppercase tracking-wide mb-1">
              Tu kit MotoSafe
            </h2>
            <p className="text-text-muted text-sm font-body mb-8">
              ¿Cómo quieres identificar tu moto?
            </p>

            <div className="space-y-3">
              {KIT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMotoData(d => ({ ...d, kit_tipo: opt.value }))}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                    motoData.kit_tipo === opt.value
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-text-muted'
                  }`}
                >
                  <span className="text-3xl">{opt.icon}</span>
                  <div>
                    <p className={`font-display font-semibold uppercase tracking-wide text-sm ${
                      motoData.kit_tipo === opt.value ? 'text-accent' : 'text-text-base'
                    }`}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-text-muted font-body">{opt.description}</p>
                  </div>
                  {motoData.kit_tipo === opt.value && (
                    <span className="ml-auto text-accent text-lg">✓</span>
                  )}
                </button>
              ))}
            </div>

            {error && (
              <div className="mt-4 bg-red-950/50 border border-red-800/50 rounded-lg px-4 py-3 text-red-400 text-sm font-body">
                {error}
              </div>
            )}

            <div className="mt-8 flex justify-between">
              <button type="button" onClick={prevStep} className="btn-ghost">
                ← Volver
              </button>
              <button type="submit" disabled={isPending} className="btn-primary">
                {isPending ? 'Registrando...' : 'Registrar mi moto →'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
