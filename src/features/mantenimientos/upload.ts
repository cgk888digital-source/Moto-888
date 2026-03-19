import { createClient } from '@/lib/supabase/client'

/**
 * Sube una foto al bucket 'mantenimientos'.
 * Ruta: {user_id}/{moto_id}/{timestamp}.{ext}
 * Guarda el PATH en DB (no la URL firmada), para que no expire.
 */
export async function uploadFotoMantenimiento(
  file: File,
  userId: string,
  motoId: string
): Promise<{ path: string } | { error: string }> {
  const supabase = createClient()

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/${motoId}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('mantenimientos')
    .upload(path, file, { contentType: file.type, upsert: false })

  if (error) return { error: error.message }
  return { path }
}

/**
 * Genera una URL firmada de corta duración para mostrar la foto.
 */
export async function getFotoUrl(path: string): Promise<string | null> {
  const supabase = createClient()
  const { data } = await supabase.storage
    .from('mantenimientos')
    .createSignedUrl(path, 60 * 60) // 1 hora
  return data?.signedUrl ?? null
}
