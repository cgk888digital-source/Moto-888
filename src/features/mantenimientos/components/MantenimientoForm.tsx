'use client'

import { useRef, useState } from 'react'
import { createMantenimiento } from '../actions'
import { uploadFotoMantenimiento } from '../upload'
import { Mantenimiento, TIPOS_SERVICIO } from '../types'

interface Props {
  moto_id: string
  userId: string
  kmActuales: number
  onNuevoMantenimiento: (m: Mantenimiento) => void
  onCancel: () => void
}

export function MantenimientoForm({ moto_id, userId, kmActuales, onNuevoMantenimiento, onCancel }: Props) {
  const today = new Date().toISOString().split('T')[0]
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    tipo_servicio: '',
    km_al_servicio: kmActuales,
    fecha: today,
    costo: '',
    taller: '',
    notas: '',
    proximo_km: '',
  })
  const [foto, setFoto] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(field: string, value: string | number) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setFoto(file)
    if (file) {
      setFotoPreview(URL.createObjectURL(file))
    } else {
      setFotoPreview(null)
    }
  }

  function removeFoto() {
    setFoto(null)
    setFotoPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!form.tipo_servicio || loading) return

    setLoading(true)
    setError(null)

    // Subir foto si hay
    let foto_url: string | null = null
    if (foto) {
      const uploadResult = await uploadFotoMantenimiento(foto, userId, moto_id)
      if ('error' in uploadResult) {
        setError(`Error subiendo foto: ${uploadResult.error}`)
        setLoading(false)
        return
      }
      foto_url = uploadResult.path
    }

    const result = await createMantenimiento({
      moto_id,
      tipo_servicio: form.tipo_servicio,
      km_al_servicio: Number(form.km_al_servicio),
      fecha: form.fecha,
      costo: form.costo ? Number(form.costo) : null,
      taller: form.taller || null,
      notas: form.notas || null,
      proximo_km: form.proximo_km ? Number(form.proximo_km) : null,
      foto_url,
    })

    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    if (result.mantenimiento) {
      onNuevoMantenimiento(result.mantenimiento)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Tipo de servicio */}
      <div>
        <label className="label-field">Tipo de servicio *</label>
        <select
          value={form.tipo_servicio}
          onChange={e => set('tipo_servicio', e.target.value)}
          required
          className="input-field"
        >
          <option value="">Selecciona un servicio...</option>
          {TIPOS_SERVICIO.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* KM + Fecha */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-field">KM al servicio *</label>
          <input
            type="number"
            value={form.km_al_servicio}
            onChange={e => set('km_al_servicio', e.target.value)}
            required min={0}
            className="input-field"
          />
        </div>
        <div>
          <label className="label-field">Fecha *</label>
          <input
            type="date"
            value={form.fecha}
            onChange={e => set('fecha', e.target.value)}
            required
            className="input-field"
          />
        </div>
      </div>

      {/* Próximo KM + Costo */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-field">Próximo servicio (KM)</label>
          <input
            type="number"
            value={form.proximo_km}
            onChange={e => set('proximo_km', e.target.value)}
            placeholder="Ej: 15000"
            min={0}
            className="input-field"
          />
        </div>
        <div>
          <label className="label-field">Costo ($)</label>
          <input
            type="number"
            value={form.costo}
            onChange={e => set('costo', e.target.value)}
            placeholder="Opcional"
            min={0} step="0.01"
            className="input-field"
          />
        </div>
      </div>

      {/* Taller */}
      <div>
        <label className="label-field">Taller / Mecánico</label>
        <input
          type="text"
          value={form.taller}
          onChange={e => set('taller', e.target.value)}
          placeholder="Nombre del taller (opcional)"
          className="input-field"
        />
      </div>

      {/* Notas */}
      <div>
        <label className="label-field">Notas</label>
        <textarea
          value={form.notas}
          onChange={e => set('notas', e.target.value)}
          placeholder="Observaciones del servicio (opcional)"
          rows={3}
          className="input-field resize-none"
        />
      </div>

      {/* Foto */}
      <div>
        <label className="label-field">Foto del servicio</label>
        {fotoPreview ? (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={fotoPreview} alt="Vista previa" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={removeFoto}
              className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg hover:bg-black transition-colors"
            >
              Eliminar
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-accent transition-colors">
            <span className="text-2xl mb-1">📷</span>
            <span className="text-xs text-text-muted font-body">Toca para agregar foto</span>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFotoChange}
              className="hidden"
            />
          </label>
        )}
        <p className="text-xs text-text-muted mt-1 font-body">JPG, PNG o WebP · máx. 5 MB</p>
      </div>

      {error && (
        <p className="text-sm text-red-400 font-body">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={!form.tipo_servicio || loading}
          className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
              {foto ? 'Subiendo foto...' : 'Guardando...'}
            </>
          ) : 'Guardar servicio'}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost px-4">
          Cancelar
        </button>
      </div>
    </form>
  )
}
