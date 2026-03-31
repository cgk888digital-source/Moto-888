'use client'

import { useState, useTransition, useRef } from 'react'
import Image from 'next/image'
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

  // OCR state
  const [ocrLoading, setOcrLoading] = useState(false)
  const [ocrSuccess, setOcrSuccess] = useState(false)
  const [ocrError, setOcrError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [propietarioExtraido, setPropietarioExtraido] = useState<string | null>(null)

  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  async function processOCR(file: File) {
    setOcrLoading(true)
    setOcrError(null)
    setOcrSuccess(false)

    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    try {
      const fd = new FormData()
      fd.append('imagen', file)
      const res = await fetch('/api/ocr-titulo', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        setOcrError(data.error ?? 'No se pudo leer el título')
        return
      }
      const d = data.datos
      if (d.marca) setMarca(d.marca)
      if (d.modelo) setModelo(d.modelo)
      if (d.ano) setAno(d.ano)
      if (d.tipo_motor) setTipoMotor(d.tipo_motor)
      if (d.cilindrada) setCilindrada(d.cilindrada)
      if (d.placa) setPlaca(d.placa)
      if (d.serial_motor) setSerialMotor(d.serial_motor)
      if (d.nombre_propietario) setPropietarioExtraido(d.nombre_propietario)
      setOcrSuccess(true)
    } catch {
      setOcrError('Error al procesar la imagen. Inténtalo de nuevo.')
    } finally {
      setOcrLoading(false)
      if (cameraInputRef.current) cameraInputRef.current.value = ''
      if (galleryInputRef.current) galleryInputRef.current.value = ''
    }
  }

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

      {/* OCR Scanner */}
      <div>
        <p className="text-xs text-text-muted uppercase tracking-wider font-body mb-3">
          Escanear carnet de circulación / título
        </p>

        {/* Inputs ocultos */}
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment"
          className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) processOCR(f) }} />
        <input ref={galleryInputRef} type="file" accept="image/*"
          className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) processOCR(f) }} />

        {/* Estado inicial */}
        {!ocrLoading && !ocrSuccess && (
          <div className="rounded-xl border border-dashed border-secondary/40 bg-secondary/5 p-4">
            <p className="text-xs text-text-muted font-body text-center mb-3">
              Sube una foto y la IA extrae los datos automáticamente
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => cameraInputRef.current?.click()}
                className="flex flex-col items-center gap-2 py-3 px-2 rounded-xl border border-secondary/30 bg-secondary/5 hover:bg-secondary/10 hover:border-secondary/60 transition-all text-secondary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs font-display font-semibold uppercase tracking-wide">Tomar foto</span>
              </button>
              <button type="button" onClick={() => galleryInputRef.current?.click()}
                className="flex flex-col items-center gap-2 py-3 px-2 rounded-xl border border-secondary/30 bg-secondary/5 hover:bg-secondary/10 hover:border-secondary/60 transition-all text-secondary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-display font-semibold uppercase tracking-wide">Galería / PC</span>
              </button>
            </div>
            {ocrError && <p className="text-red-400 text-xs font-body mt-3 text-center">{ocrError}</p>}
          </div>
        )}

        {/* Estado: procesando */}
        {ocrLoading && (
          <div className="rounded-xl border border-secondary/30 bg-secondary/5 p-5 flex flex-col items-center gap-3">
            {imagePreview && (
              <div className="relative w-full h-24 rounded-lg overflow-hidden">
                <Image src={imagePreview} alt="Título" fill className="object-cover opacity-40" />
              </div>
            )}
            <div className="w-5 h-5 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
            <p className="text-secondary text-sm font-body">Analizando con IA...</p>
          </div>
        )}

        {/* Estado: éxito */}
        {ocrSuccess && imagePreview && (
          <div className="rounded-xl border border-green-700/40 bg-green-950/30 p-4 flex items-start gap-3">
            <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-green-700/30">
              <Image src={imagePreview} alt="Título escaneado" fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-green-400 text-sm">✓</span>
                <span className="text-green-400 text-sm font-body font-semibold">Datos extraídos</span>
              </div>
              {propietarioExtraido && (
                <p className="text-text-muted text-xs font-body">
                  Propietario: <span className="text-text-base">{propietarioExtraido}</span>
                </p>
              )}
              <p className="text-text-muted text-xs font-body mt-0.5">Revisa y corrige los campos abajo</p>
            </div>
            <button type="button" onClick={() => { setOcrSuccess(false); setImagePreview(null); setPropietarioExtraido(null); setOcrError(null) }}
              className="text-text-muted hover:text-text-base text-xs font-body flex-shrink-0">
              Reintentar
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-border" />

      {/* Marca */}
      <div>
        <label className="label-field">Marca *</label>
        <select required value={marca} onChange={e => setMarca(e.target.value)} className="input-base">
          <option value="" disabled>Selecciona la marca</option>
          {MARCAS_MOTO.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Modelo */}
      <div>
        <label className="label-field">Modelo *</label>
        <input type="text" required value={modelo} onChange={e => setModelo(e.target.value)}
          placeholder="ej. SBR 150, CBF 125..." className="input-base" />
      </div>

      {/* Año y KM */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-field">Año *</label>
          <select value={ano} onChange={e => setAno(Number(e.target.value))} className="input-base">
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="label-field">KM actuales *</label>
          <input type="number" min={0} required value={km}
            onChange={e => setKm(Number(e.target.value))} className="input-base" />
        </div>
      </div>

      {/* Cilindrada y Tipo de Motor */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-field">Cilindrada (cc)</label>
          <input type="text" value={cilindrada} onChange={e => setCilindrada(e.target.value)}
            placeholder="ej. 110, 150..." className="input-base" />
        </div>
        <div>
          <label className="label-field">Tipo de Motor</label>
          <input type="text" value={tipoMotor} onChange={e => setTipoMotor(e.target.value)}
            placeholder="ej. 4T, 2T..." className="input-base" />
        </div>
      </div>

      {/* Placa y Serial Motor */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-field">Placa</label>
          <input type="text" value={placa} onChange={e => setPlaca(e.target.value)}
            placeholder="ej. AA1B22..." className="input-base" />
        </div>
        <div>
          <label className="label-field">Serial Motor</label>
          <input type="text" value={serialMotor} onChange={e => setSerialMotor(e.target.value)}
            placeholder="ej. ABC123456..." className="input-base" />
        </div>
      </div>

      {/* Tipo de aceite */}
      <div>
        <label className="label-field">Tipo de aceite</label>
        <div className="grid grid-cols-3 gap-2">
          {ACEITE_OPTIONS.map(opt => (
            <button key={opt.value} type="button" onClick={() => setTipoAceite(opt.value)}
              className={`p-3 rounded-lg border text-sm font-body transition-all ${
                tipoAceite === opt.value
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-text-muted hover:border-text-muted'
              }`}>
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
        <button type="button" onClick={() => setEsNueva(n => !n)}
          className={`w-12 h-6 rounded-full transition-colors relative ${esNueva ? 'bg-accent' : 'bg-surface-2'}`}>
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
