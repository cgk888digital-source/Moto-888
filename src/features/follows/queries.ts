import { createClient } from '@/lib/supabase/server'

export async function getFollowStats(userId: string) {
  const supabase = await createClient()
  const [{ count: seguidores }, { count: siguiendo }] = await Promise.all([
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
  ])
  return { seguidores: seguidores ?? 0, siguiendo: siguiendo ?? 0 }
}

export async function isFollowing(followerId: string, followingId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle()
  return !!data
}

export async function getPublicProfile(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('users')
    .select('id, nombre, plan, created_at')
    .eq('id', userId)
    .single()
  return data
}
