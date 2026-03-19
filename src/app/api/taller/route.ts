import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { token, km_registrado, tipo_servicio, notas_mecanico, costo_cobrado } = body

  if (!token || !tipo_servicio || !km_registrado) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
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
