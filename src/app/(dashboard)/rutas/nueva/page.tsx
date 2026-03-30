import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createRuta } from '@/features/rutas/actions'
import Link from 'next/link'

export default async function NuevaRutaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="animate-fade-in max-w-lg mx-auto space-y-6">
      <div>
        <Link href="/rutas" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-secondary transition-colors font-body uppercase tracking-wider mb-4">
          ← Rutas
        </Link>
        <h1 className="font-display text-3xl font-bold text-text-base uppercase tracking-wide">Nueva ruta</h1>
      </div>

      <form action={createRuta as unknown as (fd: FormData) => Promise<void>} className="bg-surface border border-border rounded-2xl p-6 space-y-5">
        <div>
          <label className="label-field">Título de la ruta *</label>
          <input name="titulo" required className="input-base" placeholder="ej. Ruta de las colinas del Ávila" />
        </div>

        <div>
          <label className="label-field">Descripción</label>
          <textarea name="descripcion" rows={3} className="input-base resize-none"
            placeholder="Descripción de la ruta, puntos de interés, recomendaciones..." />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-field">Distancia (km)</label>
            <input name="distancia_km" type="number" min={0} step={0.1} className="input-base" placeholder="45.5" />
          </div>
          <div>
            <label className="label-field">Estado / Región</label>
            <input name="estado_region" className="input-base" placeholder="ej. Miranda" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-field">Dificultad</label>
            <select name="dificultad" className="input-base">
              <option value="">Seleccionar</option>
              <option value="facil">Fácil</option>
              <option value="media">Media</option>
              <option value="dificil">Difícil</option>
            </select>
          </div>
          <div>
            <label className="label-field">Tipo de terreno</label>
            <select name="tipo_terreno" className="input-base">
              <option value="">Seleccionar</option>
              <option value="asfalto">Asfalto</option>
              <option value="tierra">Tierra</option>
              <option value="mixto">Mixto</option>
              <option value="montaña">Montaña</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn-primary w-full">
          Publicar ruta →
        </button>
      </form>
    </div>
  )
}
