'use client'

import { useState, useTransition } from 'react'
import { updateMoto } from '@/features/motos/actions'
import { Tables } from '@/types/database.types'
import { MARCAS_MOTO, TipoAceite } from '@/features/motos/types'

const YEAR_CURRENT = new Date().getFullYear()
const YEARS = Array.from({ length: 35 }, (_, i) => YEAR_CURRENT - i)

const ACEITE_OPTIONS: { value: TipoAceite; label: string }[] = [
  { value: 'mineral', label: 'Mineral' },
  { value: 'semi-sintetico', label: 'Semi-sintético' },
  { value: 'sintetico', label: 'Sintético' },
]

export function EditarMotoForm({ moto }: { moto: Tables<'motos'> }) {
  const [marca, setMarca] = useState(moto.marca)
  const [modelo, setModelo] = useState(moto.modelo)
  const [ano, setAno] = useState(moto.ano)
  const [km, setKm] = useState(moto.km_actuales)
  const [tipoAceite, setTipoAceite] = useState(moto.tipo_aceite as TipoAceite)
  const [esNueva, setEsNueva] = useState(moto.es_nueva)
  const [tipoMotor, setTipoMotor] = useState((moto as any).tipo_motor || '')
  const [cilindrada, setCilindrada] = useState((moto as any).cilindrada || '')
  const [placa, setPlaca] = useState((moto as any).placa || '')
  const [serialMotor, setSerialMotor] = useState((moto as any).serial_motor || '')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await updateMoto(moto.id, {
        marca,
        modelo,
        ano,
        km_actuales: km,
        tipo_aceite: tipoAceite,
        es_nueva: esNueva,
        fecha_compra: moto.fecha_compra,
        kit_tipo: (moto.kit_tipo ?? 'digital') as any,
        tipo_motor: tipoMotor,
        cilindrada,
        placa,
        serial_motor: serialMotor,
      })
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl p-6 space-y-5">

      {/* Marca */}
      <div>
        <label className="label-field">Marca *</label>
        <select
          required
          value={marca}
          onChange={e => setMarca(e.target.value)}
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
        <label className="label-field">Modelo *</label>
        <input
          type="text"
          required
          value={modelo}
          onChange={e => setModelo(e.target.value)}
          placeholder="ej. SBR 150, CBF 125..."
          className="input-base"
        />
      </div>

      {/* Año y KM */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-field">Año *</label>
          <select
            value={ano}
            onChange={e => setAno(Number(e.target.value))}
            className="input-base"
          >
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="label-field">KM actuales *</label>
          <input
            type="number"
            min={0}
            required
            value={km}
            onChange={e => setKm(Number(e.target.value))}
            className="input-base"
          />
        </div>
      </div>

      {/* Cilindrada y Tipo de Motor */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-field">Cilindrada (cc)</label>
          <input
            type="text"
            value={cilindrada}
            onChange={e => setCilindrada(e.target.value)}
            placeholder="ej. 600, 1000..."
            className="input-base"
          />
        </div>
        <div>
          <label className="label-field">Tipo de Motor</label>
          <input
            type="text"
            value={tipoMotor}
            onChange={e => setTipoMotor(e.target.value)}
            placeholder="ej. 4T, 2T..."
            className="input-base"
          />
        </div>
      </div>

      {/* Placa y Serial Motor */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-field">Placa</label>
          <input
            type="text"
            value={placa}
            onChange={e => setPlaca(e.target.value)}
            placeholder="ej. AA1B22..."
            className="input-base"
          />
        </div>
        <div>
          <label className="label-field">Serial Motor</label>
          <input
            type="text"
            value={serialMotor}
            onChange={e => setSerialMotor(e.target.value)}
            placeholder="ej. ABC123456..."
            className="input-base"
          />
        </div>
      </div>

      {/* Tipo de aceite */}
      <div>
        <label className="label-field">Tipo de aceite</label>
        <div className="grid grid-cols-3 gap-2">
          {ACEITE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTipoAceite(opt.value)}
              className={`p-3 rounded-lg border text-sm font-body transition-all ${
                tipoAceite === opt.value
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-text-muted hover:border-text-muted'
              }`}
            >
              {opt.label}
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
          onClick={() => setEsNueva(n => !n)}
          className={`w-12 h-6 rounded-full transition-colors relative ${esNueva ? 'bg-accent' : 'bg-surface-2'}`}
        >
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${esNueva ? 'translate-x-6' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {error && (
        <div className="bg-red-950/50 border border-red-800/50 rounded-lg px-4 py-3 text-red-400 text-sm font-body">
          {error}
        </div>
      )}

      <button type="submit" disabled={isPending} className="btn-primary w-full">
        {isPending ? 'Guardando...' : 'Guardar cambios →'}
      </button>
    </form>
  )
}
