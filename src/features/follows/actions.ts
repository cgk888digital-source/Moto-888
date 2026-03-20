'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleFollow(followingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }
  if (user.id === followingId) return { error: 'No puedes seguirte a ti mismo' }

  const { data: existing } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', user.id)
    .eq('following_id', followingId)
    .maybeSingle()

  if (existing) {
    await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', followingId)
    revalidatePath(`/perfil/${followingId}`)
    return { following: false }
  } else {
    await supabase.from('follows').insert({ follower_id: user.id, following_id: followingId })
    revalidatePath(`/perfil/${followingId}`)
    return { following: true }
  }
}
