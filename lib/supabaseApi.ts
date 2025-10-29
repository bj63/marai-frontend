import { supabase } from './supabaseClient'
import { recordSupabaseFailure, recordSupabaseSuccess, reportError } from './observability'

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

export interface FeedComment {
  id: string
  post_id: string
  user_id: string
  body: string
  created_at: string
  author_name: string | null
  author_avatar: string | null
}

export interface FeedPostWithEngagement extends FeedPost {
  likes_count: number
  comments: FeedComment[]
  viewer_has_liked: boolean
}

export interface FollowRelation {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export interface FollowProfile extends MiraiProfile {
  handle: string | null
  bio: string | null
  is_following?: boolean
}

export interface OnboardingState {
  user_id: string
  completed: boolean
  current_step: string | null
  completed_at: string | null
}

export interface Notification {
  id: string
  user_id: string
  title: string
  body: string
  type: string
  created_at: string
  read_at: string | null
  metadata?: Record<string, unknown>
}

export interface ConversationSummary {
  id: string
  title: string
  updated_at: string
  last_message_preview: string | null
}

export interface DirectMessage {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  created_at: string
  sender_name: string | null
  sender_avatar: string | null
}

export type SearchEntityType = 'profile' | 'post'

export interface SearchResult {
  id: string
  type: SearchEntityType
  title: string
  subtitle: string | null
  href: string
}

export interface UserSettings {
  id: string
  user_id: string
  profile_visibility: 'public' | 'private'
  share_activity: boolean
  preferred_login: 'password' | 'google' | 'magic-link' | 'wallet' | null
  wallet_address: string | null
  created_at: string
  updated_at: string
}

export interface CaptionSuggestionResult {
  caption: string
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
  const startedAt = Date.now()
  const { data, error } = await supabase
    .from('mirai_profile')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('getProfile', durationMs)
    reportError('getProfile', error, { userId })
    return null
  }
  recordSupabaseSuccess('getProfile', Date.now() - startedAt)
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

  const startedAt = Date.now()
  const { data, error } = await supabase
    .from('mirai_profile')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) {
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('saveProfile', durationMs)
    reportError('saveProfile', error, { userId })
    return { profile: null, error }
  }

  recordSupabaseSuccess('saveProfile', Date.now() - startedAt)
    console.error('saveProfile:', error)
    return { profile: null, error }
  }


  if (error) {
    console.error('saveProfile:', error)
    return { profile: null, error }
  }

  return { profile: data }
}

export async function getPersonality(userId: string): Promise<Personality | null> {
  const startedAt = Date.now()
  const { data, error } = await supabase
    .from('personality')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('getPersonality', durationMs)
    reportError('getPersonality', error, { userId })
    return null
  }
  recordSupabaseSuccess('getPersonality', Date.now() - startedAt)
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

  const startedAt = Date.now()
  const { data, error } = await supabase
    .from('personality')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) {
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('savePersonality', durationMs)
    reportError('savePersonality', error, { userId })
    return { personality: null, error }
  }

  recordSupabaseSuccess('savePersonality', Date.now() - startedAt)
  return { personality: data }
}

export async function updateUserMetadata(
  metadata: Record<string, unknown>,
): Promise<AuthResult> {
  const startedAt = Date.now()
  const { error } = await supabase.auth.updateUser({
    data: metadata,
  })

  if (error) {
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('updateUserMetadata', durationMs)
    reportError('updateUserMetadata', error, { keys: Object.keys(metadata) })
    return { error }
  }

  recordSupabaseSuccess('updateUserMetadata', Date.now() - startedAt)

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
  const startedAt = Date.now()
  const { data, error } = await supabase
    .from('feed_posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('getFeed', durationMs)
    reportError('getFeed', error)
    return []
  }
  recordSupabaseSuccess('getFeed', Date.now() - startedAt)
  return data || []
}

export async function getFeedWithEngagement(
  viewerId?: string,
): Promise<FeedPostWithEngagement[]> {
  const startedAt = Date.now()
  const { data, error } = await supabase.rpc('fetch_feed_with_engagement', {
    viewer_id: viewerId ?? null,
  })

  if (error) {
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('getFeedWithEngagement', durationMs)
    reportError('getFeedWithEngagement', error, { viewerId })
    return []
  }

  recordSupabaseSuccess('getFeedWithEngagement', Date.now() - startedAt)
    console.error('getFeedWithEngagement:', error)
    return []
  }

  return (data as FeedPostWithEngagement[]) || []
}

export async function getFeedForUser(
  userId: string,
  viewerId?: string,
): Promise<FeedPostWithEngagement[]> {
  const startedAt = Date.now()
  const { data, error } = await supabase.rpc('fetch_profile_feed', {
    target_user_id: userId,
    viewer_id: viewerId ?? null,
  })

  if (error) {
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('getFeedForUser', durationMs)
    reportError('getFeedForUser', error, { userId, viewerId })
    return []
  }

  recordSupabaseSuccess('getFeedForUser', Date.now() - startedAt)
    console.error('getFeedForUser:', error)
    return []
  }

  return (data as FeedPostWithEngagement[]) || []
}

export async function likePost(
  postId: string,
  userId: string,
): Promise<AuthResult> {
  const startedAt = Date.now()
  const { error } = await supabase
    .from('feed_likes')
    .upsert({ post_id: postId, user_id: userId })

  if (error) {
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('likePost', durationMs)
    reportError('likePost', error, { postId, userId })
    return { error }
  }

  recordSupabaseSuccess('likePost', Date.now() - startedAt)
  return {}
}

export async function unlikePost(postId: string, userId: string): Promise<AuthResult> {
  const startedAt = Date.now()
  const { error } = await supabase
    .from('feed_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId)

  if (error) {
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('unlikePost', durationMs)
    reportError('unlikePost', error, { postId, userId })
    return { error }
  }

  recordSupabaseSuccess('unlikePost', Date.now() - startedAt)
  return {}
}

export async function getComments(postId: string): Promise<FeedComment[]> {
  const startedAt = Date.now()
  const { data, error } = await supabase
    .from('feed_comments_view')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) {
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('getComments', durationMs)
    reportError('getComments', error, { postId })
    return []
  }

  recordSupabaseSuccess('getComments', Date.now() - startedAt)
  return (data as FeedComment[]) || []
}

export async function addComment(
  postId: string,
  userId: string,
  body: string,
): Promise<{ comment: FeedComment | null; error?: unknown }> {
  const startedAt = Date.now()
  const { data, error } = await supabase
    .from('feed_comments')
    .insert([
      {
        post_id: postId,
        user_id: userId,
        body,
      },
    ])
    .select('*')
    .single()

  if (error) {
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('addComment', durationMs)
    reportError('addComment', error, { postId, userId })
    return { comment: null, error }
  }

  recordSupabaseSuccess('addComment', Date.now() - startedAt)
  return { comment: data as FeedComment }
}

export async function createPost(
  post: Omit<FeedPost, 'id' | 'created_at'>,
): Promise<{ post: FeedPost | null; error?: unknown }> {
  const startedAt = Date.now()
  const { data, error } = await supabase
    .from('feed_posts')
    .insert([post])
    .select()
    .single()

  if (error) {
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('createPost', durationMs)
    reportError('createPost', error, { userId: post.user_id })
    return { post: null, error }
  }

  recordSupabaseSuccess('createPost', Date.now() - startedAt)
  const { error } = await supabase
    .from('feed_likes')
    .upsert({ post_id: postId, user_id: userId })

  if (error) {
    console.error('likePost:', error)
    return { error }
  }

  return {}
}

export async function unlikePost(postId: string, userId: string): Promise<AuthResult> {
  const { error } = await supabase
    .from('feed_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId)

  if (error) {
    console.error('unlikePost:', error)
    return { error }
  }

  return {}
}

export async function getComments(postId: string): Promise<FeedComment[]> {
  const { data, error } = await supabase
    .from('feed_comments_view')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('getComments:', error)
    return []
  }

  return (data as FeedComment[]) || []
}

export async function addComment(
  postId: string,
  userId: string,
  body: string,
): Promise<{ comment: FeedComment | null; error?: unknown }> {
  const { data, error } = await supabase
    .from('feed_comments')
    .insert([
      {
        post_id: postId,
        user_id: userId,
        body,
      },
    ])
    .select('*')
    .single()

  if (error) {
    console.error('addComment:', error)
    return { comment: null, error }
  }

  return { comment: data as FeedComment }
}


  if (error) {
    console.error('likePost:', error)
    return { error }
  }

  return {}
}

export async function unlikePost(postId: string, userId: string): Promise<AuthResult> {
  const { error } = await supabase
    .from('feed_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId)

  if (error) {
    console.error('unlikePost:', error)
    return { error }
  }

  return {}
}

export async function getComments(postId: string): Promise<FeedComment[]> {
  const { data, error } = await supabase
    .from('feed_comments_view')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('getComments:', error)
    return []
  }

  return (data as FeedComment[]) || []
}

export async function addComment(
  postId: string,
  userId: string,
  body: string,
): Promise<{ comment: FeedComment | null; error?: unknown }> {
  const { data, error } = await supabase
    .from('feed_comments')
    .insert([
      {
        post_id: postId,
        user_id: userId,
        body,
      },
    ])
    .select('*')
    .single()

  if (error) {
    console.error('addComment:', error)
    return { comment: null, error }
  }

  return { comment: data as FeedComment }
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
  const startedAt = Date.now()
  const { error } = await supabase.auth.signInWithOtp({ email })
  if (error) {
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('requestMagicLink', durationMs)
    reportError('requestMagicLink', error, { email })
    return { error }
  }
  recordSupabaseSuccess('requestMagicLink', Date.now() - startedAt)
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
  const startedAt = Date.now()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  })

  if (error) {
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('signUpWithPassword', durationMs)
    reportError('signUpWithPassword', error, { email })
    return { error }
  }

  recordSupabaseSuccess('signUpWithPassword', Date.now() - startedAt)
    console.error('signUpWithPassword:', error)
    return { error }
  }

  return {}
}

export async function signInWithPassword(email: string, password: string): Promise<AuthResult> {
  const startedAt = Date.now()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('signInWithPassword', durationMs)
    reportError('signInWithPassword', error, { email })
    return { error }
  }

  recordSupabaseSuccess('signInWithPassword', Date.now() - startedAt)
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

  const startedAt = Date.now()
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
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('signInWithGoogle', durationMs)
    reportError('signInWithGoogle', error)
    return { error }
  }

  recordSupabaseSuccess('signInWithGoogle', Date.now() - startedAt)
    console.error('signInWithGoogle:', error)
    return { error }
  }

  return {}
}

export async function signOut(): Promise<void> {
  const startedAt = Date.now()
  const { error } = await supabase.auth.signOut()
  if (error) {
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('signOut', durationMs)
    reportError('signOut', error)
    return
  }

  recordSupabaseSuccess('signOut', Date.now() - startedAt)
}

export async function getFollowers(userId: string): Promise<FollowProfile[]> {
  const startedAt = Date.now()
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('signOut:', error)
  }
}

export async function getFollowers(userId: string): Promise<FollowProfile[]> {
  const { data, error } = await supabase
    .from('followers_view')
    .select('*')
    .eq('target_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('getFollowers', durationMs)
    reportError('getFollowers', error, { userId })
    return []
  }

  recordSupabaseSuccess('getFollowers', Date.now() - startedAt)
    console.error('getFollowers:', error)
    return []
  }

  return (data as FollowProfile[]) || []
}

export async function getFollowing(userId: string): Promise<FollowProfile[]> {
  const startedAt = Date.now()
  const { data, error } = await supabase
    .from('following_view')
    .select('*')
    .eq('source_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('getFollowing', durationMs)
    reportError('getFollowing', error, { userId })
    return []
  }

  recordSupabaseSuccess('getFollowing', Date.now() - startedAt)
    console.error('getFollowing:', error)
    return []
  }

  return (data as FollowProfile[]) || []
}

export async function followProfile(
  followerId: string,
  targetId: string,
): Promise<AuthResult> {
  const startedAt = Date.now()
  const { error } = await supabase
    .from('follows')
    .upsert({ follower_id: followerId, following_id: targetId })

  if (error) {
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('followProfile', durationMs)
    reportError('followProfile', error, { followerId, targetId })
    return { error }
  }

  recordSupabaseSuccess('followProfile', Date.now() - startedAt)
    console.error('followProfile:', error)
    return { error }
  }

  return {}
}

export async function unfollowProfile(
  followerId: string,
  targetId: string,
): Promise<AuthResult> {
  const startedAt = Date.now()
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', targetId)

  if (error) {
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('unfollowProfile', durationMs)
    reportError('unfollowProfile', error, { followerId, targetId })
    return { error }
  }

  recordSupabaseSuccess('unfollowProfile', Date.now() - startedAt)
    console.error('unfollowProfile:', error)
    return { error }
  }

  return {}
}

export async function getFollowState(
  followerId: string,
  targetId: string,
): Promise<boolean> {
  const startedAt = Date.now()
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', followerId)
    .eq('following_id', targetId)

  if (error) {
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('getFollowState', durationMs)
    reportError('getFollowState', error, { followerId, targetId })
    return false
  }

  recordSupabaseSuccess('getFollowState', Date.now() - startedAt)
    console.error('getFollowState:', error)
    return false
  }

  return (count ?? 0) > 0
}

export async function getOnboardingState(userId: string): Promise<OnboardingState | null> {
  const startedAt = Date.now()
  const { data, error } = await supabase
    .from('onboarding_state')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('getOnboardingState', durationMs)
    reportError('getOnboardingState', error, { userId })
    return null
  }

  recordSupabaseSuccess('getOnboardingState', Date.now() - startedAt)
    console.error('getOnboardingState:', error)
    return null
  }

  return data as OnboardingState | null
}

export async function upsertOnboardingState(
  userId: string,
  payload: Partial<OnboardingState>,
): Promise<{ state: OnboardingState | null; error?: unknown }> {
  const startedAt = Date.now()
  const { data, error } = await supabase
    .from('onboarding_state')
    .upsert(
      {
        user_id: userId,
        ...payload,
      },
      { onConflict: 'user_id' },
    )
    .select('*')
    .single()

  if (error) {
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('upsertOnboardingState', durationMs)
    reportError('upsertOnboardingState', error, { userId })
    return { state: null, error }
  }

  recordSupabaseSuccess('upsertOnboardingState', Date.now() - startedAt)
    console.error('upsertOnboardingState:', error)
    return { state: null, error }
  }

  return { state: data as OnboardingState }
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  const startedAt = Date.now()
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('getNotifications', durationMs)
    reportError('getNotifications', error, { userId })
    return []
  }

  recordSupabaseSuccess('getNotifications', Date.now() - startedAt)
    console.error('getNotifications:', error)
    return []
  }

  return (data as Notification[]) || []
}

export async function markNotificationRead(id: string): Promise<AuthResult> {
  const startedAt = Date.now()
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('markNotificationRead', durationMs)
    reportError('markNotificationRead', error, { id })
    return { error }
  }

  recordSupabaseSuccess('markNotificationRead', Date.now() - startedAt)
    console.error('markNotificationRead:', error)
    return { error }
  }

  return {}
}

export async function markAllNotificationsRead(userId: string): Promise<AuthResult> {
  const startedAt = Date.now()
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null)

  if (error) {
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('markAllNotificationsRead', durationMs)
    reportError('markAllNotificationsRead', error, { userId })
    return { error }
  }

  recordSupabaseSuccess('markAllNotificationsRead', Date.now() - startedAt)
    console.error('markAllNotificationsRead:', error)
    return { error }
  }

  return {}
}

export async function getConversations(userId: string): Promise<ConversationSummary[]> {
  const startedAt = Date.now()
  const { data, error } = await supabase
    .from('conversations_view')
    .select('*')
    .eq('member_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('getConversations', durationMs)
    reportError('getConversations', error, { userId })
    return []
  }

  recordSupabaseSuccess('getConversations', Date.now() - startedAt)
    console.error('getConversations:', error)
    return []
  }

  return (data as ConversationSummary[]) || []
}

export async function getConversationMessages(conversationId: string): Promise<DirectMessage[]> {
  const startedAt = Date.now()
  const { data, error } = await supabase
    .from('messages_view')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) {
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('getConversationMessages', durationMs)
    reportError('getConversationMessages', error, { conversationId })
    return []
  }

  recordSupabaseSuccess('getConversationMessages', Date.now() - startedAt)
    console.error('getConversationMessages:', error)
    return []
  }

  return (data as DirectMessage[]) || []
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  body: string,
): Promise<{ message: DirectMessage | null; error?: unknown }> {
  const startedAt = Date.now()
  const { data, error } = await supabase
    .from('messages')
    .insert([
      {
        conversation_id: conversationId,
        sender_id: senderId,
        body,
      },
    ])
    .select('*')
    .single()

  if (error) {
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('sendMessage', durationMs)
    reportError('sendMessage', error, { conversationId, senderId })
    return { message: null, error }
  }

  recordSupabaseSuccess('sendMessage', Date.now() - startedAt)
    console.error('sendMessage:', error)
    return { message: null, error }
  }

  return { message: data as DirectMessage }
}

export async function searchDirectory(term: string): Promise<SearchResult[]> {
  const trimmed = term.trim()
  if (!trimmed) return []

  const startedAt = Date.now()
  const { data, error } = await supabase.rpc('search_directory', {
    query_term: trimmed,
  })

  if (error) {
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('searchDirectory', durationMs)
    reportError('searchDirectory', error, { term: trimmed })
    return []
  }

  recordSupabaseSuccess('searchDirectory', Date.now() - startedAt)
  if (!term.trim()) return []

  const { data, error } = await supabase.rpc('search_directory', {
    query_term: term.trim(),
  })

  if (error) {
    console.error('searchDirectory:', error)
    return []
  }

  return (data as SearchResult[]) || []
}

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const startedAt = Date.now()
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('getUserSettings', durationMs)
    reportError('getUserSettings', error, { userId })
    return null
  }

  recordSupabaseSuccess('getUserSettings', Date.now() - startedAt)
    console.error('getUserSettings:', error)
    return null
  }

  return data as UserSettings | null
}

export async function saveUserSettings(
  userId: string,
  settings: Partial<UserSettings>,
): Promise<{ settings: UserSettings | null; error?: unknown }> {
  const startedAt = Date.now()
  const { data, error } = await supabase
    .from('user_settings')
    .upsert(
      {
        user_id: userId,
        ...settings,
      },
      { onConflict: 'user_id' },
    )
    .select('*')
    .single()

  if (error) {
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('saveUserSettings', durationMs)
    reportError('saveUserSettings', error, { userId })
    return { settings: null, error }
  }

  recordSupabaseSuccess('saveUserSettings', Date.now() - startedAt)
    console.error('saveUserSettings:', error)
    return { settings: null, error }
  }

  return { settings: data as UserSettings }
}

export async function generateCaptionSuggestion(
  payload: { mood: string; message: string },
): Promise<{ suggestion: CaptionSuggestionResult | null; error?: unknown }> {
  try {
    const startedAt = Date.now()
    const { data, error } = await supabase.functions.invoke('generate-caption', {
      body: payload,
    })

    if (error) {
      const durationMs = Date.now() - startedAt
      recordSupabaseFailure('generateCaptionSuggestion', durationMs)
      reportError('generateCaptionSuggestion', error, payload)
      return { suggestion: null, error }
    }

    recordSupabaseSuccess('generateCaptionSuggestion', Date.now() - startedAt)
    return { suggestion: data as CaptionSuggestionResult }
  } catch (error) {
    recordSupabaseFailure('generateCaptionSuggestion')
    reportError('generateCaptionSuggestion', error, payload)
      console.error('generateCaptionSuggestion:', error)
      return { suggestion: null, error }
    }

    return { suggestion: data as CaptionSuggestionResult }
  } catch (error) {
    console.error('generateCaptionSuggestion:', error)
    return { suggestion: null, error }
  }
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const startedAt = Date.now()
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('role', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('getTeamMembers', durationMs)
    reportError('getTeamMembers', error)
    return []
  }

  recordSupabaseSuccess('getTeamMembers', Date.now() - startedAt)
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

  const startedAt = Date.now()
  const { data, error } = await supabase
    .from('team_members')
    .insert([payload])
    .select()
    .single()

  if (error) {
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('addTeamMember', durationMs)
    reportError('addTeamMember', error, { email: member.email })
    return { member: null, error }
  }

  recordSupabaseSuccess('addTeamMember', Date.now() - startedAt)
    console.error('addTeamMember:', error)
    return { member: null, error }
  }

  return { member: data }
}

export async function removeTeamMember(id: string): Promise<AuthResult> {
  const startedAt = Date.now()
  const { error } = await supabase.from('team_members').delete().eq('id', id)

  if (error) {
    const durationMs = Date.now() - startedAt
    recordSupabaseFailure('removeTeamMember', durationMs)
    reportError('removeTeamMember', error, { id })
    return { error }
  }

  recordSupabaseSuccess('removeTeamMember', Date.now() - startedAt)
  const { error } = await supabase.from('team_members').delete().eq('id', id)

  if (error) {
    console.error('removeTeamMember:', error)
    return { error }
  }

  return {}
}
