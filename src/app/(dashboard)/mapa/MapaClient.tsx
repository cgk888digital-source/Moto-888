'use client'
import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'

const TIPO_ICON: Record<string, string> = {
  taller: '🔧',
  gasolinera: '⛽',
  zona_riesgo: '⚠️',
  repuestos: '🔩',
}

const TIPO_COLOR: Record<string, string> = {
  taller: 'text-blue-400',
  gasolinera: 'text-green-400',
  zona_riesgo: 'text-red-400',
  repuestos: 'text-amber-400',
}

interface POI {
  id: string
  nombre: string
  tipo: string
  lat: number
  lng: number
  direccion: string | null
  telefono: string | null
  verificado: boolean | null
  rating: number | null
}

interface Props {
  pois: POI[]
  userId: string
}

export function MapaClient({ pois: initialPois, userId }: Props) {
  const [pois, setPois] = useState(initialPois)
  const [filtro, setFiltro] = useState<string>('todos')
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<POI | null>(null)
  const [pending, startTransition] = useTransition()

  const filtered = filtro === 'todos' ? pois : pois.filter(p => p.tipo === filtro)

  async function handleReportar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const supabase = createClient()

    startTransition(async () => {
      const { data } = await supabase.from('pois').insert({
        nombre: fd.get('nombre') as string,
        tipo: fd.get('tipo') as string,
        lat: Number(fd.get('lat')),
        lng: Number(fd.get('lng')),
        direccion: (fd.get('direccion') as string) || null,
        telefono: (fd.get('telefono') as string) || null,
        reportado_por: userId,
      }).select().single()

      if (data) {
        setPois(prev => [...prev, data])
        setShowForm(false)
      }
    })
  }

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {/* Lista POI */}
      <div className="md:col-span-1 space-y-3">
        {/* Filtros */}
        <div className="flex flex-wrap gap-2">
          {['todos', 'taller', 'gasolinera', 'repuestos', 'zona_riesgo'].map(t => (
            <button
              key={t}
              onClick={() => setFiltro(t)}
              className={`text-xs px-3 py-1.5 rounded-full font-body transition-colors ${
                filtro === t ? 'bg-accent text-bg' : 'bg-surface border border-border text-text-muted hover:border-accent'
              }`}
            >
              {t === 'todos' ? '📍 Todos' : `${TIPO_ICON[t]} ${t.charAt(0).toUpperCase() + t.slice(1)}`}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowForm(s => !s)}
          className="w-full text-sm bg-surface border border-border rounded-lg px-3 py-2 text-text-muted hover:border-accent hover:text-accent transition-colors font-body"
        >
          + Reportar punto
        </button>

        {showForm && (
          <form onSubmit={handleReportar} className="bg-surface border border-border rounded-xl p-4 space-y-3">
            <input name="nombre" placeholder="Nombre del lugar *" required
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base placeholder-text-muted focus:outline-none focus:border-accent font-body" />
            <select name="tipo" required
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base focus:outline-none focus:border-accent font-body">
              <option value="">Tipo *</option>
              <option value="taller">🔧 Taller</option>
              <option value="gasolinera">⛽ Gasolinera</option>
              <option value="repuestos">🔩 Repuestos</option>
              <option value="zona_riesgo">⚠️ Zona de riesgo</option>
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" name="lat" placeholder="Latitud *" step="any" required
                className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base placeholder-text-muted focus:outline-none focus:border-accent font-body" />
              <input type="number" name="lng" placeholder="Longitud *" step="any" required
                className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base placeholder-text-muted focus:outline-none focus:border-accent font-body" />
            </div>
            <input name="direccion" placeholder="Dirección"
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base placeholder-text-muted focus:outline-none focus:border-accent font-body" />
            <input name="telefono" placeholder="Teléfono"
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base placeholder-text-muted focus:outline-none focus:border-accent font-body" />
            <button type="submit" disabled={pending}
              className="w-full bg-accent text-bg py-2 rounded-lg text-sm font-body font-semibold hover:bg-amber-400 transition-colors disabled:opacity-50">
              {pending ? 'Guardando...' : 'Reportar'}
            </button>
          </form>
        )}

        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-text-muted font-body text-center py-8">No hay puntos en esta categoría</p>
          ) : (
            filtered.map(poi => (
              <button
                key={poi.id}
                onClick={() => setSelected(poi)}
                className={`w-full text-left bg-surface border rounded-lg p-3 transition-colors hover:border-accent ${selected?.id === poi.id ? 'border-accent' : 'border-border'}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{TIPO_ICON[poi.tipo]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-base font-body truncate">{poi.nombre}</p>
                    <p className={`text-xs font-body ${TIPO_COLOR[poi.tipo]}`}>{poi.tipo}</p>
                  </div>
                  {poi.verificado && <span className="text-xs text-green-400 font-body">✓</span>}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Panel detalle / mapa placeholder */}
      <div className="md:col-span-2">
        {selected ? (
          <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{TIPO_ICON[selected.tipo]}</span>
              <div>
                <h2 className="font-display font-bold text-xl text-text-base">{selected.nombre}</h2>
                <p className={`text-sm font-body ${TIPO_COLOR[selected.tipo]}`}>{selected.tipo}</p>
              </div>
              {selected.verificado && (
                <span className="ml-auto text-xs bg-green-900/40 text-green-400 px-2 py-1 rounded-full font-body">✓ Verificado</span>
              )}
            </div>
            <div className="space-y-2 text-sm font-body text-text-muted">
              {selected.direccion && <p>📍 {selected.direccion}</p>}
              {selected.telefono && <p>📞 {selected.telefono}</p>}
              <p>🌐 {selected.lat.toFixed(6)}, {selected.lng.toFixed(6)}</p>
              {selected.rating != null && selected.rating > 0 && <p>⭐ {selected.rating.toFixed(1)} / 5</p>}
            </div>
            <a
              href={`https://maps.google.com/?q=${selected.lat},${selected.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-accent text-bg px-4 py-2 rounded-lg text-sm font-body font-semibold hover:bg-amber-400 transition-colors"
            >
              Abrir en Google Maps →
            </a>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl h-full min-h-[400px] flex items-center justify-center text-text-muted font-body">
            <div className="text-center">
              <p className="text-5xl mb-3">📍</p>
              <p className="text-sm">Selecciona un punto para ver detalles</p>
              <p className="text-xs mt-1 text-text-muted/60">{pois.length} puntos en el mapa</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
