import { supabase } from './supabaseClient'

export interface MiraiProfile {
  id: string
  user_id: string
  name: string
  avatar: string
  color: string
  created_at: string
}

export interface Personality {
  id: string
  user_id: string
  empathy: number
  humor: number
  confidence: number
  creativity: number
  curiosity: number
  loyalty: number
  trust: number
  energy: number
  updated_at: string
}

export interface FeedPost {
  id: string
  user_id: string
  mirai_name: string | null
  mood: string | null
  message: string | null
  music_url: string | null
  color: string | null
  created_at: string
}

export async function getProfile(userId: string): Promise<MiraiProfile | null> {
  const { data, error } = await supabase
    .from('mirai_profile')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('getProfile:', error)
    return null
  }
  return data
}

export async function saveProfile(userId: string, profile: Partial<MiraiProfile>): Promise<void> {
  const { error } = await supabase
    .from('mirai_profile')
    .upsert({ user_id: userId, ...profile })

  if (error) console.error('saveProfile:', error)
}

export async function getPersonality(userId: string): Promise<Personality | null> {
  const { data, error } = await supabase
    .from('personality')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('getPersonality:', error)
    return null
  }
  return data
}

export async function updatePersonality(userId: string, traits: Partial<Personality>): Promise<void> {
  const { error } = await supabase
    .from('personality')
    .update({ ...traits, updated_at: new Date().toISOString() })
    .eq('user_id', userId)

  if (error) console.error('updatePersonality:', error)
}

export async function getFeed(): Promise<FeedPost[]> {
  const { data, error } = await supabase
    .from('feed_posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getFeed:', error)
    return []
  }
  return data || []
}

export async function createPost(post: Omit<FeedPost, 'id' | 'created_at'>): Promise<void> {
  const { error } = await supabase
    .from('feed_posts')
    .insert([post])

  if (error) console.error('createPost:', error)
}

export async function signIn(email: string): Promise<{ error: unknown } | null> {
  const { error } = await supabase.auth.signInWithOtp({ email })
  if (error) {
    console.error('signIn:', error)
    return { error }
  }
  return null
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}
