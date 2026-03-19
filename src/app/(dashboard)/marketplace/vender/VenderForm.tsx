'use client'
import { useState, useTransition, useRef } from 'react'
import { createVendedor, createProducto } from '@/features/marketplace/actions'
import { CATEGORIAS } from '@/features/marketplace/types'
import type { Vendedor } from '@/features/marketplace/types'
import { createClient } from '@/lib/supabase/client'

const MAX_FOTOS = 5
const MAX_MB = 10

export function VenderForm({ vendedor }: { vendedor: Vendedor | null }) {
  const [step, setStep] = useState<'perfil' | 'producto'>(vendedor ? 'producto' : 'perfil')
  const [pending, startTransition] = useTransition()
  const [precio, setPrecio] = useState(0)

  // Image upload state
  const [fotosSubidas, setFotosSubidas] = useState<string[]>([])
  const [fotosUrl, setFotosUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const comision = precio < 50 ? 0.03 : precio <= 200 ? 0.025 : 0.02
  const totalComprador = precio > 0 ? (precio * (1 + comision)).toFixed(2) : null

  // Combine uploaded URLs + manually entered URLs
  const todasLasFotos = [
    ...fotosSubidas,
    ...fotosUrl.split('\n').map(u => u.trim()).filter(Boolean),
  ]

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    const remaining = MAX_FOTOS - fotosSubidas.length
    if (remaining <= 0) {
      setUploadError(`Máximo ${MAX_FOTOS} fotos`)
      return
    }

    const toUpload = files.slice(0, remaining)
    const oversized = toUpload.filter(f => f.size > MAX_MB * 1024 * 1024)
    if (oversized.length) {
      setUploadError(`Cada foto debe ser menor a ${MAX_MB}MB`)
      return
    }

    setUploadError(null)
    setUploading(true)

    try {
      const supabase = createClient()
      const urls: string[] = []

      for (const file of toUpload) {
        const ext = file.name.split('.').pop()
        const path = `productos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error } = await supabase.storage
          .from('marketplace-fotos')
          .upload(path, file, { cacheControl: '3600', upsert: false })

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
          .from('marketplace-fotos')
          .getPublicUrl(path)

        urls.push(publicUrl)
      }

      setFotosSubidas(prev => [...prev, ...urls])
    } catch (err: any) {
      setUploadError(err.message ?? 'Error al subir imagen')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function removePhoto(url: string) {
    setFotosSubidas(prev => prev.filter(u => u !== url))
  }

  function handleProductoSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    // Override fotos with combined list
    fd.set('fotos', todasLasFotos.join('\n'))
    startTransition(async () => { await createProducto(fd) })
  }

  if (step === 'perfil') {
    return (
      <form onSubmit={e => { e.preventDefault(); startTransition(async () => { await createVendedor(new FormData(e.currentTarget)) }) }}
        className="bg-surface border border-border rounded-xl p-5 space-y-4">
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
          <p className="text-xs text-accent font-body font-semibold">Paso 1/2 — Perfil de vendedor</p>
          <p className="text-xs text-text-muted font-body mt-1">Solo se crea una vez. Aparecerá en todos tus productos.</p>
        </div>
        <input name="nombre_tienda" placeholder="Nombre de tu tienda o tu nombre *" required
          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base placeholder-text-muted focus:outline-none focus:border-accent font-body" />
        <select name="tipo" className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base focus:outline-none focus:border-accent font-body">
          <option value="particular">Particular</option>
          <option value="tienda">Tienda / Negocio</option>
        </select>
        <input name="ubicacion" placeholder="Ciudad / Estado (Venezuela)"
          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base placeholder-text-muted focus:outline-none focus:border-accent font-body" />
        <textarea name="descripcion" placeholder="Descripción breve de lo que vendés" rows={2}
          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base placeholder-text-muted resize-none focus:outline-none focus:border-accent font-body" />
        <button type="submit" disabled={pending}
          className="w-full bg-accent text-bg py-2.5 rounded-lg text-sm font-body font-semibold hover:bg-amber-400 transition-colors disabled:opacity-50">
          {pending ? 'Creando perfil...' : 'Crear perfil y continuar →'}
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={handleProductoSubmit}
      className="bg-surface border border-border rounded-xl p-5 space-y-4">
      <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
        <p className="text-xs text-accent font-body font-semibold">
          {vendedor ? `Publicando como: ${vendedor.nombre_tienda}` : 'Paso 2/2 — Datos del producto'}
        </p>
      </div>

      <input name="titulo" placeholder="Título del producto *" required
        className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base placeholder-text-muted focus:outline-none focus:border-accent font-body" />
      <textarea name="descripcion" placeholder="Descripción detallada..." rows={3}
        className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base placeholder-text-muted resize-none focus:outline-none focus:border-accent font-body" />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-text-muted font-body">Precio (USD) *</label>
          <input type="number" name="precio" min="0.01" step="0.01" required
            onChange={e => setPrecio(Number(e.target.value))}
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base focus:outline-none focus:border-accent font-body" />
          {totalComprador && (
            <p className="text-xs text-text-muted font-body">Comprador paga: <span className="text-accent">${totalComprador}</span></p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-xs text-text-muted font-body">Stock</label>
          <input type="number" name="stock" defaultValue={1} min={1}
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base focus:outline-none focus:border-accent font-body" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <select name="categoria" required
          className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base focus:outline-none focus:border-accent font-body">
          <option value="">Categoría *</option>
          {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select name="condicion"
          className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base focus:outline-none focus:border-accent font-body">
          <option value="usado">Usado</option>
          <option value="nuevo">Nuevo</option>
        </select>
      </div>

      {/* ── Fotos ── */}
      <div className="space-y-3">
        <label className="text-xs text-text-muted font-body">
          Fotos del producto <span className="text-text-muted/60">({todasLasFotos.length}/{MAX_FOTOS} máx.)</span>
        </label>

        {/* Preview fotos subidas */}
        {fotosSubidas.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {fotosSubidas.map(url => (
              <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-lg"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload desde dispositivo */}
        {todasLasFotos.length < MAX_FOTOS && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="foto-upload"
            />
            <label
              htmlFor="foto-upload"
              className={`flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-lg py-4 cursor-pointer transition-colors font-body text-sm
                ${uploading ? 'border-border text-text-muted opacity-50 cursor-not-allowed' : 'border-border hover:border-accent text-text-muted hover:text-accent'}`}
            >
              {uploading ? (
                <>
                  <span className="animate-spin">⏳</span> Subiendo...
                </>
              ) : (
                <>
                  <span className="text-xl">📷</span>
                  <span>Subir foto desde celular o computador</span>
                </>
              )}
            </label>
          </div>
        )}

        {uploadError && (
          <p className="text-xs text-red-400 font-body">{uploadError}</p>
        )}

        {/* Separador */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-text-muted font-body">o pegá una URL</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* URLs manuales */}
        <textarea
          value={fotosUrl}
          onChange={e => setFotosUrl(e.target.value)}
          placeholder="https://imagen1.jpg&#10;https://imagen2.jpg"
          rows={2}
          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base placeholder-text-muted resize-none focus:outline-none focus:border-accent font-body"
        />

        {/* Hidden input que va al server action */}
        <input type="hidden" name="fotos" value={todasLasFotos.join('\n')} />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-text-muted font-body">Motos compatibles (separadas por coma)</label>
        <input name="motos_compatibles" placeholder="Bera SBR 150, Yamaha FZ, Honda CB..."
          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base placeholder-text-muted focus:outline-none focus:border-accent font-body" />
      </div>

      <button type="submit" disabled={pending || uploading}
        className="w-full bg-accent text-bg py-2.5 rounded-lg text-sm font-body font-semibold hover:bg-amber-400 transition-colors disabled:opacity-50">
        {pending ? 'Publicando...' : '🛒 Publicar producto'}
      </button>
    </form>
  )
}
