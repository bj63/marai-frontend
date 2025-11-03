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
  loyalty?: number
  trust?: number
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

export interface DesignDNA {
  layout: string | null
  theme_tokens: Record<string, string>
  palette: Record<string, string>
  motion: Record<string, unknown>
  soundscape: Record<string, unknown>
  depth: unknown
  font: string | null
}

export interface UserDesignProfile {
  id: string
  user_id: string
  design_dna: DesignDNA | null
  evolution_stage: string | null
  preferred_emotion: string | null
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

type MetricsMetadata = Record<string, unknown> | undefined

async function trackSupabase<T>(
  operation: string,
  request: () => Promise<{ data: T; error: unknown }>,
  metadata?: MetricsMetadata,
): Promise<{ data: T | null; error: unknown | null }> {
  const startedAt = Date.now()
  try {
    const { data, error } = await request()
    if (error) {
      recordSupabaseFailure(operation, Date.now() - startedAt)
      reportError(operation, error, metadata)
      return { data: null, error }
    }

    recordSupabaseSuccess(operation, Date.now() - startedAt)
    return { data, error: null }
  } catch (error) {
    recordSupabaseFailure(operation, Date.now() - startedAt)
    reportError(operation, error, metadata)
    return { data: null, error }
  }
}

export async function getProfile(userId: string): Promise<MiraiProfile | null> {
  const { data } = await trackSupabase('getProfile', () =>
    supabase.from('mirai_profile').select('*').eq('user_id', userId).maybeSingle(),
    { userId },
  )

  return (data as MiraiProfile | null) ?? null
}

export async function saveProfile(
  userId: string,
  profile: Partial<MiraiProfile>,
): Promise<{ profile: MiraiProfile | null; error?: unknown }> {
  const payload = { user_id: userId, ...profile }
  const result = await trackSupabase('saveProfile', () =>
    supabase.from('mirai_profile').upsert(payload, { onConflict: 'user_id' }).select().single(),
    { userId },
  )

  return { profile: (result.data as MiraiProfile | null) ?? null, error: result.error ?? undefined }
}

export async function getPersonality(userId: string): Promise<Personality | null> {
  const { data } = await trackSupabase('getPersonality', () =>
    supabase.from('personality').select('*').eq('user_id', userId).maybeSingle(),
    { userId },
  )

  return (data as Personality | null) ?? null
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

  const result = await trackSupabase('savePersonality', () =>
    supabase.from('personality').upsert(payload, { onConflict: 'user_id' }).select().single(),
    { userId },
  )

  return { personality: (result.data as Personality | null) ?? null, error: result.error ?? undefined }
}

export async function updateUserMetadata(metadata: Record<string, unknown>): Promise<AuthResult> {
  const result = await trackSupabase('updateUserMetadata', () => supabase.auth.updateUser({ data: metadata }), {
    keys: Object.keys(metadata),
  })

  return result.error ? { error: result.error } : {}
}

export async function getFeedWithEngagement(viewerId?: string): Promise<FeedPostWithEngagement[]> {
  const { data } = await trackSupabase(
    'getFeedWithEngagement',
    () => supabase.rpc('fetch_feed_with_engagement', { viewer_id: viewerId ?? null }),
    { viewerId },
  )

  return ((data as FeedPostWithEngagement[]) ?? []).map((entry) => ({
    ...entry,
    likes_count: entry.likes_count ?? 0,
    comments: entry.comments ?? [],
    viewer_has_liked: Boolean(entry.viewer_has_liked),
  }))
}

export async function getFeedForUser(
  userId: string,
  viewerId?: string,
): Promise<FeedPostWithEngagement[]> {
  const { data } = await trackSupabase(
    'getFeedForUser',
    () => supabase.rpc('fetch_profile_feed', { target_user_id: userId, viewer_id: viewerId ?? null }),
    { userId, viewerId },
  )

  return ((data as FeedPostWithEngagement[]) ?? []).map((entry) => ({
    ...entry,
    likes_count: entry.likes_count ?? 0,
    comments: entry.comments ?? [],
    viewer_has_liked: Boolean(entry.viewer_has_liked),
  }))
}

export async function likePost(postId: string, userId: string): Promise<AuthResult> {
  const result = await trackSupabase(
    'likePost',
    () => supabase.from('feed_likes').upsert({ post_id: postId, user_id: userId }),
    { postId, userId },
  )

  return result.error ? { error: result.error } : {}
}

export async function unlikePost(postId: string, userId: string): Promise<AuthResult> {
  const result = await trackSupabase(
    'unlikePost',
    () => supabase.from('feed_likes').delete().eq('post_id', postId).eq('user_id', userId),
    { postId, userId },
  )

  return result.error ? { error: result.error } : {}
}

export async function addComment(
  postId: string,
  userId: string,
  body: string,
): Promise<{ comment: FeedComment | null; error?: unknown }> {
  const result = await trackSupabase(
    'addComment',
    () =>
      supabase
        .from('feed_comments')
        .insert([{ post_id: postId, user_id: userId, body }])
        .select('*')
        .single(),
    { postId, userId },
  )

  return { comment: (result.data as FeedComment | null) ?? null, error: result.error ?? undefined }
}

export async function createPost(
  post: Omit<FeedPost, 'id' | 'created_at'>,
): Promise<{ post: FeedPost | null; error?: unknown }> {
  const result = await trackSupabase(
    'createPost',
    () => supabase.from('feed_posts').insert([post]).select().single(),
    { userId: post.user_id },
  )

  return { post: (result.data as FeedPost | null) ?? null, error: result.error ?? undefined }
}

export async function generateCaptionSuggestion(payload: {
  mood: string
  message: string
}): Promise<{ suggestion: CaptionSuggestionResult | null; error?: unknown }> {
  const startedAt = Date.now()
  try {
    const { data, error } = await supabase.functions.invoke<CaptionSuggestionResult>('generate-caption', {
      body: payload,
    })

    if (error) {
      recordSupabaseFailure('generateCaptionSuggestion', Date.now() - startedAt)
      reportError('generateCaptionSuggestion', error, payload)
      return { suggestion: null, error }
    }

    recordSupabaseSuccess('generateCaptionSuggestion', Date.now() - startedAt)
    return { suggestion: data ?? null }
  } catch (error) {
    recordSupabaseFailure('generateCaptionSuggestion', Date.now() - startedAt)
    reportError('generateCaptionSuggestion', error, payload)
    return { suggestion: null, error }
  }
}

export async function getFollowers(userId: string): Promise<FollowProfile[]> {
  const { data } = await trackSupabase(
    'getFollowers',
    () => supabase.from('followers_view').select('*').eq('target_id', userId).order('created_at', { ascending: false }),
    { userId },
  )

  return (data as FollowProfile[]) ?? []
}

export async function getFollowing(userId: string): Promise<FollowProfile[]> {
  const { data } = await trackSupabase(
    'getFollowing',
    () => supabase.from('following_view').select('*').eq('follower_id', userId).order('created_at', { ascending: false }),
    { userId },
  )

  return (data as FollowProfile[]) ?? []
}

export async function followProfile(followerId: string, targetId: string): Promise<AuthResult> {
  const result = await trackSupabase(
    'followProfile',
    () => supabase.from('follows').upsert({ follower_id: followerId, following_id: targetId }),
    { followerId, targetId },
  )

  return result.error ? { error: result.error } : {}
}

export async function unfollowProfile(followerId: string, targetId: string): Promise<AuthResult> {
  const result = await trackSupabase(
    'unfollowProfile',
    () => supabase.from('follows').delete().eq('follower_id', followerId).eq('following_id', targetId),
    { followerId, targetId },
  )

  return result.error ? { error: result.error } : {}
}

export async function getOnboardingState(userId: string): Promise<OnboardingState | null> {
  const { data } = await trackSupabase(
    'getOnboardingState',
    () => supabase.from('onboarding_state').select('*').eq('user_id', userId).maybeSingle(),
    { userId },
  )

  return (data as OnboardingState | null) ?? null
}

export async function upsertOnboardingState(
  userId: string,
  state: Partial<OnboardingState>,
): Promise<{ state: OnboardingState | null; error?: unknown }> {
  const payload = { user_id: userId, ...state }
  const result = await trackSupabase(
    'upsertOnboardingState',
    () => supabase.from('onboarding_state').upsert(payload, { onConflict: 'user_id' }).select().single(),
    { userId },
  )

  return { state: (result.data as OnboardingState | null) ?? null, error: result.error ?? undefined }
}

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const { data } = await trackSupabase(
    'getUserSettings',
    () => supabase.from('user_settings').select('*').eq('user_id', userId).maybeSingle(),
    { userId },
  )

  return (data as UserSettings | null) ?? null
}

export async function saveUserSettings(
  userId: string,
  settings: Partial<UserSettings>,
): Promise<AuthResult> {
  const payload = { user_id: userId, ...settings }
  const result = await trackSupabase(
    'saveUserSettings',
    () => supabase.from('user_settings').upsert(payload, { onConflict: 'user_id' }),
    { userId },
  )

  return result.error ? { error: result.error } : {}
}

export async function getUserDesignProfile(userId: string): Promise<UserDesignProfile | null> {
  const { data } = await trackSupabase(
    'getUserDesignProfile',
    () => supabase.from('user_design_profile').select('*').eq('user_id', userId).maybeSingle(),
    { userId },
  )

  return (data as UserDesignProfile | null) ?? null
}

export async function saveUserDesignProfile(
  userId: string,
  profile: Partial<UserDesignProfile> & { design_dna?: DesignDNA | null },
): Promise<{ profile: UserDesignProfile | null; error?: unknown }> {
  const payload = { user_id: userId, ...profile }
  const result = await trackSupabase(
    'saveUserDesignProfile',
    () => supabase.from('user_design_profile').upsert(payload, { onConflict: 'user_id' }).select().single(),
    { userId },
  )

  return { profile: (result.data as UserDesignProfile | null) ?? null, error: result.error ?? undefined }
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  const { data } = await trackSupabase(
    'getNotifications',
    () => supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    { userId },
  )

  return (data as Notification[]) ?? []
}

export async function markNotificationRead(id: string): Promise<AuthResult> {
  const result = await trackSupabase(
    'markNotificationRead',
    () => supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id),
    { id },
  )

  return result.error ? { error: result.error } : {}
}

export async function markAllNotificationsRead(userId: string): Promise<AuthResult> {
  const result = await trackSupabase(
    'markAllNotificationsRead',
    () =>
      supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .is('read_at', null),
    { userId },
  )

  return result.error ? { error: result.error } : {}
}

export async function getConversations(userId: string): Promise<ConversationSummary[]> {
  const { data } = await trackSupabase(
    'getConversations',
    () => supabase.from('conversations_view').select('*').eq('member_id', userId).order('updated_at', { ascending: false }),
    { userId },
  )

  return (data as ConversationSummary[]) ?? []
}

export async function getConversationMessages(conversationId: string): Promise<DirectMessage[]> {
  const { data } = await trackSupabase(
    'getConversationMessages',
    () => supabase.from('messages_view').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true }),
    { conversationId },
  )

  return (data as DirectMessage[]) ?? []
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  body: string,
): Promise<{ message: DirectMessage | null; error?: unknown }> {
  const result = await trackSupabase(
    'sendMessage',
    () =>
      supabase
        .from('messages')
        .insert([{ conversation_id: conversationId, sender_id: senderId, body }])
        .select('*')
        .single(),
    { conversationId, senderId },
  )

  return { message: (result.data as DirectMessage | null) ?? null, error: result.error ?? undefined }
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const { data } = await trackSupabase('getTeamMembers', () => supabase.from('team_members').select('*').order('created_at', {
    ascending: true,
  }))

  return (data as TeamMember[]) ?? []
}

export async function addTeamMember(payload: {
  email: string
  name: string | null
  role: TeamMember['role']
  login_method: TeamMember['login_method']
}): Promise<{ member: TeamMember | null; error?: unknown }> {
  const result = await trackSupabase(
    'addTeamMember',
    () => supabase.from('team_members').insert([payload]).select('*').single(),
    { email: payload.email, role: payload.role },
  )

  return { member: (result.data as TeamMember | null) ?? null, error: result.error ?? undefined }
}

export async function removeTeamMember(id: string): Promise<AuthResult> {
  const result = await trackSupabase('removeTeamMember', () => supabase.from('team_members').delete().eq('id', id), { id })
  return result.error ? { error: result.error } : {}
}

export async function searchDirectory(query: string): Promise<SearchResult[]> {
  const { data } = await trackSupabase(
    'searchDirectory',
    () => supabase.rpc('search_directory', { search_query: query }),
    { query },
  )

  return (data as SearchResult[]) ?? []
}

export async function requestMagicLink(email: string): Promise<AuthResult> {
  const result = await trackSupabase('requestMagicLink', () => supabase.auth.signInWithOtp({ email }), { email })
  return result.error ? { error: result.error } : {}
}

export async function signUpWithPassword(
  email: string,
  password: string,
  username: string,
): Promise<AuthResult> {
  const result = await trackSupabase(
    'signUpWithPassword',
    () =>
      supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      }),
    { email },
  )

  return result.error ? { error: result.error } : {}
}

export async function signInWithPassword(email: string, password: string): Promise<AuthResult> {
  const result = await trackSupabase(
    'signInWithPassword',
    () => supabase.auth.signInWithPassword({ email, password }),
    { email },
  )

  return result.error ? { error: result.error } : {}
}

export async function signInWithGoogle(): Promise<AuthResult> {
  const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined
  const result = await trackSupabase(
    'signInWithGoogle',
    () =>
      supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: { prompt: 'select_account' },
        },
      }),
  )

  return result.error ? { error: result.error } : {}
}

export async function signOut(): Promise<void> {
  await trackSupabase('signOut', () => supabase.auth.signOut())
}
