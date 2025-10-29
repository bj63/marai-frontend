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

export interface TeamMember {
  id: string
  email: string
  name: string | null
  role: 'founder' | 'admin' | 'collaborator'
  login_method: 'password' | 'magic-link' | 'google' | 'wallet'
  status: 'active' | 'invited'
  created_at: string
}

export interface AuthResult {
  error?: unknown
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

export async function saveProfile(
  userId: string,
  profile: Partial<MiraiProfile>,
): Promise<{ profile: MiraiProfile | null; error?: unknown }> {
  const payload = {
    user_id: userId,
    ...profile,
  }

  const { data, error } = await supabase
    .from('mirai_profile')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) {
    console.error('saveProfile:', error)
    return { profile: null, error }
  }

  return { profile: data }
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

export async function savePersonality(
  userId: string,
  traits: Partial<Personality>,
): Promise<{ personality: Personality | null; error?: unknown }> {
  const payload = {
    user_id: userId,
    ...traits,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('personality')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) {
    console.error('savePersonality:', error)
    return { personality: null, error }
  }

  return { personality: data }
}

export async function updateUserMetadata(
  metadata: Record<string, unknown>,
): Promise<AuthResult> {
  const { error } = await supabase.auth.updateUser({
    data: metadata,
  })

  if (error) {
    console.error('updateUserMetadata:', error)
    return { error }
  }


  return { personality: data }
}

export async function updateUserMetadata(
  metadata: Record<string, unknown>,
): Promise<AuthResult> {
  const { error } = await supabase.auth.updateUser({
    data: metadata,
  })

  if (error) {
    console.error('updateUserMetadata:', error)
    return { error }
  }


  if (error) {
    console.error('savePersonality:', error)
    return { personality: null, error }
  }

  return { personality: data }
}

export async function updateUserMetadata(
  metadata: Record<string, unknown>,
): Promise<AuthResult> {
  const { error } = await supabase.auth.updateUser({
    data: metadata,
  })

  if (error) {
    console.error('updateUserMetadata:', error)
    return { error }
  }

  return {}
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

export async function createPost(
  post: Omit<FeedPost, 'id' | 'created_at'>,
): Promise<{ post: FeedPost | null; error?: unknown }> {
  const { data, error } = await supabase.from('feed_posts').insert([post]).select().single()

  if (error) {
    console.error('createPost:', error)
    return { post: null, error }
  }

  return { post: data }
}

export async function requestMagicLink(email: string): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithOtp({ email })
  if (error) {
    console.error('requestMagicLink:', error)
    return { error }
  }
  return {}
}

export async function signUpWithPassword(
  email: string,
  password: string,
  username: string,
): Promise<AuthResult> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  })

  if (error) {
    console.error('signUpWithPassword:', error)
    return { error }
  }
    return { error }
  }
  return {}
}

export async function signUpWithPassword(
  email: string,
  password: string,
  username: string,
): Promise<AuthResult> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  })

  if (error) {
    console.error('signUpWithPassword:', error)
    return { error }
  }

  return {}
}

export async function signInWithPassword(email: string, password: string): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    console.error('signInWithPassword:', error)
    return { error }
  }

  return {}
}

export async function signInWithGoogle(): Promise<AuthResult> {
  const redirectTo =
    typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        prompt: 'select_account',
      },
    },
  })

  if (error) {
    console.error('signInWithGoogle:', error)
export async function requestMagicLink(email: string): Promise<{ error: unknown } | null> {
  const { error } = await supabase.auth.signInWithOtp({ email })
  if (error) {
    console.error('requestMagicLink:', error)
    return { error }
  }
  return {}
}

export async function signUpWithPassword(
  email: string,
  password: string,
  username: string,
): Promise<AuthResult> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  })

  if (error) {
    console.error('signUpWithPassword:', error)
    return { error }
  }

  return {}
}

export async function signInWithPassword(email: string, password: string): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    console.error('signInWithPassword:', error)
    return { error }
  }

  return {}
}

export async function signInWithGoogle(): Promise<AuthResult> {
  const redirectTo =
    typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        prompt: 'select_account',
      },
    },
  })

  if (error) {
    console.error('signInWithGoogle:', error)
    return { error }
  }

  return {}
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('signOut:', error)
  }
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('role', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('getTeamMembers:', error)
    return []
  }

  return data ?? []
}

export async function addTeamMember(
  member: Pick<TeamMember, 'email' | 'name' | 'role' | 'login_method'>,
): Promise<{ member: TeamMember | null; error?: unknown }> {
  const payload = {
    ...member,
    status: 'invited' as const,
  }

  const { data, error } = await supabase
    .from('team_members')
    .insert([payload])
    .select()
    .single()

  if (error) {
    console.error('addTeamMember:', error)
    return { member: null, error }
  }

  return { member: data }
}

export async function removeTeamMember(id: string): Promise<AuthResult> {
  const { error } = await supabase.from('team_members').delete().eq('id', id)

  if (error) {
    console.error('removeTeamMember:', error)
    return { error }
  }

  return {}
}
