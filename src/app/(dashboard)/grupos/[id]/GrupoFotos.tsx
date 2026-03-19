'use client'
import { useState, useRef, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Foto {
  id: string
  url: string
  descripcion: string | null
  user_id: string
  created_at: string | null
}

interface Props {
  grupoId: string
  userId: string
  esMiembro: boolean
  initialFotos: Foto[]
}

export function GrupoFotos({ grupoId, userId, esMiembro, initialFotos }: Props) {
  const [fotos, setFotos] = useState(initialFotos)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Foto | null>(null)
  const [pending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setError(null)
    setUploading(true)

    try {
      const supabase = createClient()
      for (const file of files.slice(0, 5)) {
        if (file.size > 10 * 1024 * 1024) { setError('Máximo 10MB por foto'); continue }
        const ext = file.name.split('.').pop()
        const path = `${grupoId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

        const { error: upErr } = await supabase.storage.from('grupos-fotos').upload(path, file)
        if (upErr) throw upErr

        const { data: { publicUrl } } = supabase.storage.from('grupos-fotos').getPublicUrl(path)

        const { data: foto } = await supabase
          .from('grupo_fotos')
          .insert({ grupo_id: grupoId, user_id: userId, url: publicUrl })
          .select('id, url, descripcion, user_id, created_at')
          .single()

        if (foto) setFotos(prev => [foto as Foto, ...prev])
      }
    } catch (err: any) {
      setError(err.message ?? 'Error al subir foto')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleDelete(foto: Foto) {
    const supabase = createClient()
    await supabase.from('grupo_fotos').delete().eq('id', foto.id)
    setFotos(prev => prev.filter(f => f.id !== foto.id))
    if (selected?.id === foto.id) setSelected(null)
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-lg text-text-base tracking-wide">
          Fotos del grupo <span className="text-text-muted font-body text-sm font-normal">({fotos.length})</span>
        </h2>
        {esMiembro && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleUpload}
              className="hidden"
              id="grupo-foto-upload"
            />
            <label
              htmlFor="grupo-foto-upload"
              className={`text-xs px-3 py-2 rounded-lg font-body font-semibold cursor-pointer transition-colors ${
                uploading
                  ? 'bg-border text-text-muted opacity-50 cursor-not-allowed'
                  : 'bg-accent text-bg hover:bg-amber-400'
              }`}
            >
              {uploading ? '⏳ Subiendo...' : '📷 + Subir foto'}
            </label>
          </>
        )}
      </div>

      {error && <p className="text-xs text-red-400 font-body">{error}</p>}

      {fotos.length === 0 ? (
        <div className="text-center py-10 text-text-muted font-body">
          <p className="text-4xl mb-2">📸</p>
          <p className="text-sm">Sin fotos aún</p>
          {esMiembro && <p className="text-xs mt-1 text-text-muted/60">Sé el primero en subir un recuerdo</p>}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {fotos.map(foto => (
            <button
              key={foto.id}
              onClick={() => setSelected(foto)}
              className="relative aspect-square rounded-lg overflow-hidden group bg-bg border border-border hover:border-accent transition-colors"
            >
              <img
                src={foto.url}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-w-2xl w-full"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={selected.url}
              alt=""
              className="w-full rounded-xl object-contain max-h-[75vh]"
            />
            {selected.descripcion && (
              <p className="mt-3 text-sm text-center text-white/80 font-body">{selected.descripcion}</p>
            )}
            <div className="flex justify-between mt-3">
              <button
                onClick={() => setSelected(null)}
                className="text-sm text-white/60 hover:text-white font-body transition-colors"
              >
                ✕ Cerrar
              </button>
              {selected.user_id === userId && (
                <button
                  onClick={() => handleDelete(selected)}
                  className="text-sm text-red-400 hover:text-red-300 font-body transition-colors"
                >
                  🗑 Eliminar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
