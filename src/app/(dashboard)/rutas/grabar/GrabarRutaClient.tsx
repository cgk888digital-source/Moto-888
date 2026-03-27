'use client'

import { useState, useEffect, useRef } from 'react'
import { upsertTelemetria } from '@/features/rutas/actions'
import Link from 'next/link'

interface Props {
  rutaId: string | null
  userId: string
}

interface PuntoGPS {
  lat: number
  lng: number
  ts: number
  velocidad: number
}

export function GrabarRutaClient({ rutaId, userId }: Props) {
  const [grabando, setGrabando] = useState(false)
  const [finalizado, setFinalizado] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [velocidadActual, setVelocidadActual] = useState(0)
  const [velocidadMax, setVelocidadMax] = useState(0)
  const [leanAngle, setLeanAngle] = useState(0)
  const [leanMax, setLeanMax] = useState(0)
  const [distancia, setDistancia] = useState(0)
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const puntosRef = useRef<PuntoGPS[]>([])
  const watchIdRef = useRef<number | null>(null)
  const motionCleanupRef = useRef<(() => void) | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  // Calcular distancia entre dos coordenadas (Haversine)
  function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  function iniciarGrabacion() {
    if (!navigator.geolocation) {
      setError('GPS no disponible en este dispositivo')
      return
    }
    puntosRef.current = []
    setElapsed(0)
    setDistancia(0)
    setVelocidadActual(0)
    setVelocidadMax(0)
    setLeanAngle(0)
    setLeanMax(0)
    setGrabando(true)
    startTimeRef.current = Date.now()

    // Timer
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)

    // GPS
    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => {
        const { latitude: lat, longitude: lng, speed } = pos.coords
        const vel = speed ? speed * 3.6 : 0 // m/s → km/h
        const punto: PuntoGPS = { lat, lng, ts: Date.now(), velocidad: vel }

        // Calcular distancia acumulada
        const prev = puntosRef.current[puntosRef.current.length - 1]
        if (prev) {
          const d = haversine(prev.lat, prev.lng, lat, lng)
          setDistancia(t => t + d)
        }

        puntosRef.current.push(punto)
        setVelocidadActual(Math.round(vel))
        setVelocidadMax(m => Math.max(m, vel))
      },
      err => setError(`Error GPS: ${err.message}`),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    )

    // Lean angle via DeviceMotion
    function handleMotion(e: DeviceMotionEvent) {
      const acc = e.accelerationIncludingGravity
      if (!acc?.x) return
      const angle = Math.abs(Math.atan2(acc.x ?? 0, acc.z ?? 9.8) * (180 / Math.PI))
      setLeanAngle(Math.round(angle))
      setLeanMax(m => Math.max(m, angle))
    }
    window.addEventListener('devicemotion', handleMotion)
    motionCleanupRef.current = () => window.removeEventListener('devicemotion', handleMotion)
  }

  function detenerGrabacion() {
    setGrabando(false)
    if (timerRef.current) clearInterval(timerRef.current)
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
    motionCleanupRef.current?.()
    setFinalizado(true)
  }

  async function handleGuardar() {
    setGuardando(true)
    const velocidades = puntosRef.current.map(p => p.velocidad).filter(v => v > 0)
    const velProm = velocidades.length > 0 ? velocidades.reduce((a, b) => a + b, 0) / velocidades.length : 0

    // Construir GPX básico
    let gpx_url: string | null = null
    if (puntosRef.current.length > 1) {
      const trackPoints = puntosRef.current
        .map(p => `    <trkpt lat="${p.lat}" lon="${p.lng}"><time>${new Date(p.ts).toISOString()}</time></trkpt>`)
        .join('\n')
      const gpxContent = `<?xml version="1.0"?><gpx version="1.1" creator="Bikevzla 888"><trk><trkseg>\n${trackPoints}\n</trkseg></trk></gpx>`
      const blob = new Blob([gpxContent], { type: 'application/gpx+xml' })
      // Por ahora guardamos el GPX inline como data URI (en producción se subiría a Storage)
      gpx_url = null // TODO: subir a Supabase Storage
    }

    const result = await upsertTelemetria({
      ruta_id: rutaId,
      distancia_km: Math.round(distancia * 100) / 100,
      duracion_seg: elapsed,
      velocidad_max: Math.round(velocidadMax * 10) / 10,
      velocidad_prom: Math.round(velProm * 10) / 10,
      lean_angle_max: Math.round(leanMax * 10) / 10,
      gpx_url,
      roadguardian_activo: false,
    })

    setGuardando(false)
    if (result?.error) {
      setError(result.error)
    } else {
      setGuardado(true)
    }
  }

  function formatTime(sec: number) {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
    motionCleanupRef.current?.()
  }, [])

  if (guardado) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">✅</p>
        <h2 className="font-display text-2xl font-bold text-text-base uppercase tracking-wide mb-3">¡Ruta guardada!</h2>
        <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto mb-8 text-center">
          <div className="bg-surface border border-border rounded-xl p-3">
            <p className="font-display text-xl font-bold text-accent">{distancia.toFixed(1)}</p>
            <p className="text-xs text-text-muted font-body">km</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-3">
            <p className="font-display text-xl font-bold text-text-base">{velocidadMax.toFixed(0)}</p>
            <p className="text-xs text-text-muted font-body">km/h max</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-3">
            <p className="font-display text-xl font-bold text-text-base">{formatTime(elapsed)}</p>
            <p className="text-xs text-text-muted font-body">duración</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-3">
            <p className="font-display text-xl font-bold text-text-base">{leanMax.toFixed(0)}°</p>
            <p className="text-xs text-text-muted font-body">lean max</p>
          </div>
        </div>
        {rutaId ? (
          <Link href={`/rutas/${rutaId}`} className="btn-primary">Ver ruta</Link>
        ) : (
          <Link href="/rutas" className="btn-primary">Ver rutas</Link>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div>
        <Link href={rutaId ? `/rutas/${rutaId}` : '/rutas'} className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors font-body uppercase tracking-wider mb-4">
          ← {rutaId ? 'Ruta' : 'Rutas'}
        </Link>
        <h1 className="font-display text-3xl font-bold text-text-base uppercase tracking-wide">Grabar telemetría</h1>
        {rutaId && <p className="text-xs text-text-muted font-body mt-1">Vinculada a la ruta seleccionada</p>}
      </div>

      {/* Panel principal */}
      <div className={`rounded-2xl border-2 p-6 text-center transition-all ${grabando ? 'border-accent bg-accent/5' : 'border-border bg-surface'}`}>
        {/* Cronómetro */}
        <p className="font-display text-5xl font-bold text-text-base mb-1">
          {formatTime(elapsed)}
        </p>
        <p className="text-xs text-text-muted font-body mb-6">
          {grabando ? '● GRABANDO' : finalizado ? 'DETENIDO' : 'LISTO'}
        </p>

        {/* Stats en tiempo real */}
        {(grabando || finalizado) && (
          <div className="grid grid-cols-2 gap-3 mb-6 text-left">
            <div className="bg-bg border border-border rounded-xl p-3">
              <p className="text-xs text-text-muted font-body uppercase tracking-wide">Velocidad</p>
              <p className="font-display text-2xl font-bold text-accent">{velocidadActual} <span className="text-sm text-text-muted">km/h</span></p>
            </div>
            <div className="bg-bg border border-border rounded-xl p-3">
              <p className="text-xs text-text-muted font-body uppercase tracking-wide">Vel. Max</p>
              <p className="font-display text-2xl font-bold text-text-base">{velocidadMax.toFixed(0)} <span className="text-sm text-text-muted">km/h</span></p>
            </div>
            <div className="bg-bg border border-border rounded-xl p-3">
              <p className="text-xs text-text-muted font-body uppercase tracking-wide">Distancia</p>
              <p className="font-display text-2xl font-bold text-text-base">{distancia.toFixed(2)} <span className="text-sm text-text-muted">km</span></p>
            </div>
            <div className="bg-bg border border-border rounded-xl p-3">
              <p className="text-xs text-text-muted font-body uppercase tracking-wide">Lean Angle</p>
              <p className="font-display text-2xl font-bold text-text-base">{leanAngle}° <span className="text-sm text-text-muted">max {leanMax.toFixed(0)}°</span></p>
            </div>
          </div>
        )}

        {/* Botones */}
        {!grabando && !finalizado && (
          <button onClick={iniciarGrabacion} className="btn-primary w-full text-lg py-4">
            🎙 Iniciar grabación
          </button>
        )}
        {grabando && (
          <button
            onClick={detenerGrabacion}
            className="w-full bg-red-600 hover:bg-red-500 text-white py-4 rounded-xl font-body font-bold text-lg transition-colors"
          >
            ⏹ Detener
          </button>
        )}
        {finalizado && !guardado && (
          <div className="space-y-3">
            <button
              onClick={handleGuardar}
              disabled={guardando}
              className="btn-primary w-full text-lg py-4"
            >
              {guardando ? 'Guardando...' : '💾 Guardar telemetría'}
            </button>
            <button
              onClick={() => { setFinalizado(false); setElapsed(0) }}
              className="btn-ghost w-full"
            >
              Descartar
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-950/50 border border-red-800/50 rounded-xl px-4 py-3 text-red-400 text-sm font-body">
          {error}
        </div>
      )}

      {!grabando && !finalizado && (
        <div className="bg-surface border border-border rounded-xl p-4 space-y-2">
          <p className="text-xs font-display font-bold uppercase tracking-wider text-text-muted">Qué se mide</p>
          <ul className="space-y-1 text-xs text-text-muted font-body">
            <li>📍 Distancia recorrida (GPS)</li>
            <li>⚡ Velocidad máxima y promedio (GPS)</li>
            <li>📐 Ángulo de inclinación — lean angle (giroscopio)</li>
            <li>⏱️ Duración total del recorrido</li>
          </ul>
        </div>
      )}
    </div>
  )
}
