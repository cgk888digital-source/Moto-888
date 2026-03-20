'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MotoFormData } from './types'

export async function createMoto(data: MotoFormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('motos').insert({
    user_id: user.id,
    marca: data.marca,
    modelo: data.modelo,
    ano: data.ano,
    km_actuales: data.km_actuales,
    tipo_aceite: data.tipo_aceite,
    es_nueva: data.es_nueva,
    fecha_compra: data.fecha_compra || null,
    kit_tipo: data.kit_tipo,
  })

  if (error) return { error: error.message }

  redirect('/dashboard')
}

export async function updateMoto(motoId: string, data: Partial<MotoFormData>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: moto } = await supabase
    .from('motos').select('id').eq('id', motoId).eq('user_id', user.id).single()
  if (!moto) return { error: 'Moto no encontrada' }

  const { error } = await supabase.from('motos').update({
    marca: data.marca,
    modelo: data.modelo,
    ano: data.ano,
    km_actuales: data.km_actuales,
    tipo_aceite: data.tipo_aceite,
    es_nueva: data.es_nueva,
    fecha_compra: data.fecha_compra || null,
    kit_tipo: data.kit_tipo,
  }).eq('id', motoId)

  if (error) return { error: error.message }
  redirect('/dashboard')
}

export async function updateUserNombre(nombre: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('users')
    .update({ nombre })
    .eq('id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}
