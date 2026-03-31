'use client'
import { useState, useTransition, useRef } from 'react'
import { createVendedor, createProducto, updateProducto } from '@/features/marketplace/actions'
import { CATEGORIAS } from '@/features/marketplace/types'
import type { Vendedor, Producto } from '@/features/marketplace/types'
import { createClient } from '@/lib/supabase/client'

const MAX_FOTOS = 5
const MAX_MB = 10

export function VenderForm({ vendedor, producto }: { vendedor: Vendedor | null, producto?: Producto }) {
  const [step, setStep] = useState<'perfil' | 'producto'>(vendedor || producto ? 'producto' : 'perfil')
  const [pending, startTransition] = useTransition()
  const [precio, setPrecio] = useState(producto?.precio ?? 0)

  // Unified image state
  const [fotos, setFotos] = useState<string[]>(producto?.fotos ?? [])
  const [fotosUrlInput, setFotosUrlInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const comision = precio < 50 ? 0.03 : precio <= 200 ? 0.025 : 0.02
  const totalComprador = precio > 0 ? (precio * (1 + comision)).toFixed(2) : null

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    const remaining = MAX_FOTOS - fotos.length
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

      setFotos(prev => [...prev, ...urls])
    } catch (err: any) {
      setUploadError(err.message ?? 'Error al subir imagen')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function addPhotoUrl() {
    const urls = fotosUrlInput.split('\n').map(u => u.trim()).filter(Boolean)
    if (!urls.length) return
    
    const remaining = MAX_FOTOS - fotos.length
    if (remaining <= 0) {
      setUploadError(`Máximo ${MAX_FOTOS} fotos`)
      return
    }

    const toAdd = urls.slice(0, remaining)
    setFotos(prev => [...prev, ...toAdd])
    setFotosUrlInput('')
  }

  function removePhoto(url: string) {
    setFotos(prev => prev.filter(u => u !== url))
  }

  function handleProductoSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    // Ensure all images are included
    fd.set('fotos', fotos.join('\n'))
    
    startTransition(async () => { 
      if (producto) {
        const res = await updateProducto(producto.id, fd)
        if (res.error) alert(res.error)
        else window.location.href = `/marketplace/producto/${producto.id}`
      } else {
        await createProducto(fd) 
      }
    })
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
          {producto ? `Editando: ${producto.titulo}` : (vendedor ? `Publicando como: ${vendedor.nombre_tienda}` : 'Paso 2/2 — Datos del producto')}
        </p>
      </div>

      <input name="titulo" placeholder="Título del producto *" required defaultValue={producto?.titulo}
        className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base placeholder-text-muted focus:outline-none focus:border-accent font-body" />
      <textarea name="descripcion" placeholder="Descripción detallada..." rows={3} defaultValue={producto?.descripcion ?? ''}
        className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base placeholder-text-muted resize-none focus:outline-none focus:border-accent font-body" />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-text-muted font-body">Precio (USD) *</label>
          <input type="number" name="precio" min="0.01" step="0.01" required
            defaultValue={producto?.precio}
            onChange={e => setPrecio(Number(e.target.value))}
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base focus:outline-none focus:border-accent font-body" />
          {totalComprador && (
            <p className="text-xs text-text-muted font-body">Comprador paga: <span className="text-accent">${totalComprador}</span></p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-xs text-text-muted font-body">Stock</label>
          <input type="number" name="stock" defaultValue={producto?.stock ?? 1} min={1}
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base focus:outline-none focus:border-accent font-body" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <select name="categoria" required defaultValue={producto?.categoria}
          className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base focus:outline-none focus:border-accent font-body">
          <option value="">Categoría *</option>
          {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select name="condicion" defaultValue={producto?.condicion ?? 'usado'}
          className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base focus:outline-none focus:border-accent font-body">
          <option value="usado">Usado</option>
          <option value="nuevo">Nuevo</option>
        </select>
      </div>

      {/* ── Fotos ── */}
      <div className="space-y-3">
        <label className="text-xs text-text-muted font-body">
          Fotos del producto <span className="text-text-muted/60">({fotos.length}/{MAX_FOTOS} máx.)</span>
        </label>

        {/* Unified Preview Grid */}
        {fotos.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {fotos.map((url, idx) => (
              <div key={`${url}-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-border bg-bg group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow-lg hover:bg-red-600 transition-colors z-10"
                  title="Eliminar imagen"
                >
                  ✕
                </button>
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            ))}
          </div>
        )}

        {/* Upload desde dispositivo */}
        {fotos.length < MAX_FOTOS && (
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
                  <span>Subir foto desde dispositivo</span>
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
        <div className="flex gap-2">
          <input
            value={fotosUrlInput}
            onChange={e => setFotosUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addPhotoUrl())}
            placeholder="https://ejemplo.com/foto.jpg"
            className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base placeholder-text-muted focus:outline-none focus:border-accent font-body"
          />
          <button
            type="button"
            onClick={addPhotoUrl}
            disabled={!fotosUrlInput.trim() || fotos.length >= MAX_FOTOS}
            className="px-3 py-2 bg-surface border border-border rounded-lg text-xs font-body text-text-base hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
          >
            Añadir
          </button>
        </div>

        {/* Hidden input que va al server action */}
        <input type="hidden" name="fotos" value={fotos.join('\n')} />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-text-muted font-body">Motos compatibles (separadas por coma)</label>
        <input name="motos_compatibles" placeholder="Bera SBR 150, Yamaha FZ, Honda CB..."
          defaultValue={producto?.motos_compatibles?.join(', ') ?? ''}
          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base placeholder-text-muted focus:outline-none focus:border-accent font-body" />
      </div>

      <button type="submit" disabled={pending || uploading}
        className="w-full bg-accent text-bg py-2.5 rounded-lg text-sm font-body font-semibold hover:bg-amber-400 transition-colors disabled:opacity-50">
        {pending ? (producto ? 'Guardando...' : 'Publicando...') : (producto ? '💾 Guardar cambios' : '🛒 Publicar producto')}
      </button>
    </form>
  )
}
