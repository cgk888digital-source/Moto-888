'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createEvento(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const titulo = (formData.get('titulo') as string)?.trim()
  const descripcion = (formData.get('descripcion') as string)?.trim()
  const fecha_hora = formData.get('fecha_hora') as string
  const punto_partida = (formData.get('punto_partida') as string)?.trim()
  const cupos_max = formData.get('cupos_max') ? Number(formData.get('cupos_max')) : null

  if (!titulo || !fecha_hora) return { error: 'Título y fecha son requeridos' }

  const { data, error } = await supabase.from('eventos').insert({
    creador_id: user.id,
    titulo,
    descripcion,
    fecha_hora,
    punto_partida,
    cupos_max,
  }).select('id').single()

  if (error || !data) return { error: error?.message ?? 'Error al crear evento' }

  revalidatePath('/eventos')
  redirect(`/eventos/${data.id}`)
}

export async function setAsistencia(eventoId: string, respuesta: 'voy' | 'tal_vez' | 'no_voy', anterior: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  if (anterior === respuesta) {
    // Toggle off
    await supabase.from('evento_asistentes').delete().match({ evento_id: eventoId, user_id: user.id })
    if (anterior === 'voy') await supabase.rpc('decrement_voy', { evento_id: eventoId })
  } else {
    await supabase.from('evento_asistentes').upsert({
      evento_id: eventoId,
      user_id: user.id,
      respuesta,
    }, { onConflict: 'evento_id,user_id' })

    if (respuesta === 'voy' && anterior !== 'voy') await supabase.rpc('increment_voy', { evento_id: eventoId })
    if (respuesta !== 'voy' && anterior === 'voy') await supabase.rpc('decrement_voy', { evento_id: eventoId })
  }

  revalidatePath(`/eventos/${eventoId}`)
  revalidatePath('/eventos')
}
