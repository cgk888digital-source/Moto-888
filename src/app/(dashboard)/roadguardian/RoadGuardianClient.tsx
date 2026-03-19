'use client'
import { useState, useEffect, useRef, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Contacto {
  id: string
  nombre: string
  telefono: string
  relacion: string | null
  orden: number | null
}

interface Alerta {
  id: string
  lat: number
  lng: number
  google_maps_url: string | null
  contacto_alertado: string | null
  cancelada: boolean | null
  created_at: string | null
}

interface Props {
  contactos: Contacto[]
  alertas: Alerta[]
  userId: string
}

const COUNTDOWN = 30

export function RoadGuardianClient({ contactos: init, alertas, userId }: Props) {
  const [contactos, setContactos] = useState(init)
  const [activo, setActivo] = useState(false)
  const [caida, setCaida] = useState(false)
  const [countdown, setCountdown] = useState(COUNTDOWN)
  const [showForm, setShowForm] = useState(false)
  const [pending, startTransition] = useTransition()
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  // Detección de caída usando DeviceMotion
  useEffect(() => {
    if (!activo) return

    function handleMotion(e: DeviceMotionEvent) {
      const acc = e.accelerationIncludingGravity
      if (!acc) return
      const total = Math.sqrt((acc.x ?? 0) ** 2 + (acc.y ?? 0) ** 2 + (acc.z ?? 0) ** 2)
      // Umbral: aceleración total muy baja (caída libre ~0) seguida de impacto
      if (total < 2) {
        triggerCaida()
      }
    }

    window.addEventListener('devicemotion', handleMotion)
    return () => window.removeEventListener('devicemotion', handleMotion)
  }, [activo])

  // Countdown al detectar caída
  useEffect(() => {
    if (!caida) return

    setCountdown(COUNTDOWN)
    timerRef.current = setInterval(() => {
      setCountdown(n => {
        if (n <= 1) {
          clearInterval(timerRef.current!)
          enviarAlerta()
          return 0
        }
        return n - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current!)
  }, [caida])

  function triggerCaida() {
    if (caida) return
    setCaida(true)
  }

  function cancelar() {
    clearInterval(timerRef.current!)
    setCaida(false)
    setCountdown(COUNTDOWN)
  }

  async function enviarAlerta() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude: lat, longitude: lng } = pos.coords
      const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`
      await supabase.from('roadguardian_alertas').insert({
        user_id: userId,
        lat,
        lng,
        google_maps_url: mapsUrl,
        contacto_alertado: contactos[0]?.telefono ?? null,
        cancelada: false,
      })
      // Aquí iría el envío de SMS/WhatsApp (Twilio) — pendiente integración
      setCaida(false)
    })
  }

  async function addContacto(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    if (contactos.length >= 3) return

    startTransition(async () => {
      const { data } = await supabase.from('roadguardian_contactos').insert({
        user_id: userId,
        nombre: fd.get('nombre') as string,
        telefono: fd.get('telefono') as string,
        relacion: (fd.get('relacion') as string) || null,
        orden: contactos.length + 1,
      }).select().single()

      if (data) {
        setContactos(prev => [...prev, data])
        setShowForm(false)
        ;(e.target as HTMLFormElement).reset()
      }
    })
  }

  async function deleteContacto(id: string) {
    await supabase.from('roadguardian_contactos').delete().eq('id', id)
    setContactos(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Modo carretera ON/OFF */}
      <div className={`rounded-xl border-2 p-6 text-center transition-all ${activo ? 'border-accent bg-accent/5' : 'border-border bg-surface'}`}>
        {caida ? (
          <div className="space-y-4">
            <p className="text-5xl animate-pulse">🚨</p>
            <p className="font-display text-2xl font-bold text-red-400">¡CAÍDA DETECTADA!</p>
            <p className="font-body text-text-muted text-sm">Enviando alerta en {countdown} segundos...</p>
            <div className="w-full bg-border rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(countdown / COUNTDOWN) * 100}%` }}
              />
            </div>
            <button
              onClick={cancelar}
              className="bg-green-600 text-white px-8 py-3 rounded-xl font-body font-bold text-lg hover:bg-green-500 transition-colors"
            >
              ✅ CANCELAR — Estoy bien
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-5xl">{activo ? '🛡️' : '⚫'}</p>
            <p className="font-display text-xl font-bold text-text-base">
              {activo ? 'Modo Carretera ACTIVO' : 'Modo Carretera INACTIVO'}
            </p>
            <p className="text-sm text-text-muted font-body">
              {activo
                ? 'Monitoreando acelerómetro. Caída detectada → alerta automática en 30s.'
                : 'Activa el modo carretera antes de salir a rodar.'}
            </p>
            <button
              onClick={() => setActivo(a => !a)}
              className={`px-8 py-3 rounded-xl font-body font-bold text-lg transition-colors ${
                activo
                  ? 'bg-red-600 hover:bg-red-500 text-white'
                  : 'bg-accent hover:bg-amber-400 text-bg'
              }`}
            >
              {activo ? 'Desactivar' : '🛡️ Activar Modo Carretera'}
            </button>
            {/* Botón de prueba en desarrollo */}
            {activo && (
              <button onClick={triggerCaida} className="block text-xs text-text-muted hover:text-accent font-body mx-auto mt-1 transition-colors">
                Simular caída (dev)
              </button>
            )}
          </div>
        )}
      </div>

      {/* Contactos de emergencia */}
      <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-text-base">Contactos de Emergencia</h2>
          <span className="text-xs text-text-muted font-body">{contactos.length}/3</span>
        </div>

        {contactos.map(c => (
          <div key={c.id} className="flex items-center gap-3 bg-bg border border-border rounded-lg p-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm font-display">
              {c.orden}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-text-base font-body">{c.nombre}</p>
              <p className="text-xs text-text-muted font-body">{c.telefono} {c.relacion ? `· ${c.relacion}` : ''}</p>
            </div>
            <button onClick={() => deleteContacto(c.id)} className="text-text-muted hover:text-red-400 transition-colors text-sm">✕</button>
          </div>
        ))}

        {contactos.length < 3 && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full text-sm border border-dashed border-border text-text-muted hover:border-accent hover:text-accent rounded-lg py-3 font-body transition-colors"
          >
            + Agregar contacto
          </button>
        )}

        {showForm && (
          <form onSubmit={addContacto} className="space-y-3">
            <input name="nombre" placeholder="Nombre *" required
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base placeholder-text-muted focus:outline-none focus:border-accent font-body" />
            <input name="telefono" placeholder="Teléfono (con código país) *" required
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base placeholder-text-muted focus:outline-none focus:border-accent font-body" />
            <input name="relacion" placeholder="Relación (mamá, amigo, pareja...)"
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base placeholder-text-muted focus:outline-none focus:border-accent font-body" />
            <button type="submit" disabled={pending}
              className="w-full bg-accent text-bg py-2 rounded-lg text-sm font-body font-semibold hover:bg-amber-400 transition-colors disabled:opacity-50">
              {pending ? 'Guardando...' : 'Guardar contacto'}
            </button>
          </form>
        )}
      </div>

      {/* Historial de alertas */}
      {alertas.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
          <h2 className="font-display font-bold text-text-base">Historial de Alertas</h2>
          {alertas.map(a => (
            <div key={a.id} className={`flex items-center gap-3 p-3 rounded-lg border ${a.cancelada ? 'border-border bg-bg' : 'border-red-900/50 bg-red-900/10'}`}>
              <span className="text-xl">{a.cancelada ? '✅' : '🚨'}</span>
              <div className="flex-1">
                <p className="text-xs text-text-muted font-body">
                  {a.created_at ? new Date(a.created_at).toLocaleString('es-VE') : ''}
                  {a.cancelada ? ' · Cancelada' : ' · Enviada'}
                </p>
                {a.contacto_alertado && <p className="text-xs text-text-muted font-body">→ {a.contacto_alertado}</p>}
              </div>
              {a.google_maps_url && (
                <a href={a.google_maps_url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline font-body">Ver mapa</a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
