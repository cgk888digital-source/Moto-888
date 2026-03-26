import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { rateLimitMiddleware } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const rateLimit = rateLimitMiddleware(req, 'api/stripe')
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Intenta más tarde.', retryAfter: rateLimit.retryAfter },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
    )
  }

  const apiKey = req.headers.get('x-taller-api-key')
  if (!apiKey) {
    return NextResponse.json({ error: 'API key requerida' }, { status: 401 })
  }

  const validKey = process.env.TALLER_API_KEY
  if (!validKey || apiKey !== validKey) {
    return NextResponse.json({ error: 'API key inválida' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const data = body as {
    token?: unknown
    km_registrado?: unknown
    tipo_servicio?: unknown
    notas_mecanico?: unknown
    costo_cobrado?: unknown
  }

  const token = typeof data.token === 'string' ? data.token : ''
  const km_registrado = typeof data.km_registrado === 'number' ? data.km_registrado : 0
  const tipo_servicio = typeof data.tipo_servicio === 'string' ? data.tipo_servicio : ''
  const notas_mecanico = typeof data.notas_mecanico === 'string' ? data.notas_mecanico : null
  const costo_cobrado = typeof data.costo_cobrado === 'number' ? data.costo_cobrado : null

  if (!token || !tipo_servicio || !km_registrado || km_registrado <= 0 || km_registrado > 999999) {
    return NextResponse.json({ error: 'Datos inválidos o incompletos' }, { status: 400 })
  }

  if (tipo_servicio.length > 100) {
    return NextResponse.json({ error: 'Tipo de servicio demasiado largo' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Buscar moto por nfc_token
  const { data: moto, error: motoError } = await supabase
    .from('motos')
    .select('id, nfc_activado, taller_acceso')
    .eq('nfc_token', token)
    .single()

  if (motoError || !moto) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 404 })
  }

  if (!moto.nfc_activado) {
    return NextResponse.json({ error: 'NFC no activado' }, { status: 403 })
  }

  if (!moto.taller_acceso) {
    return NextResponse.json({ error: 'Acceso no habilitado por el dueño' }, { status: 403 })
  }

  const { error: insertError } = await supabase
    .from('registros_taller')
    .insert({
      moto_id: moto.id,
      km_registrado: Number(km_registrado),
      tipo_servicio,
      notas_mecanico: notas_mecanico || null,
      costo_cobrado: costo_cobrado ? Number(costo_cobrado) : null,
      registrado_via: 'nfc',
      confirmado_dueno: false,
    })

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
