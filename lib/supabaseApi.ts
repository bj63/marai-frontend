import { supabase, supabaseRuntime } from './supabaseClient'
import { recordSupabaseFailure, recordSupabaseSuccess, reportError } from './observability'
import offlineSupabaseApi from './supabaseOfflineApi'
import type {
  AuthResult,
  CaptionSuggestionResult,
  ConversationSummary,
  DesignDNA,
  DirectMessage,
  FeedComment,
  FeedPost,
  FeedPostWithEngagement,
  FollowProfile,
  MiraiProfile,
  Notification,
  OnboardingState,
  Personality,
  SearchEntityType,
  SearchResult,
  TeamMember,
  UserDesignProfile,
  UserSettings,
} from '@/types/supabase'

export type {
  AuthResult,
  CaptionSuggestionResult,
  ConversationSummary,
  DesignDNA,
  DirectMessage,
  FeedComment,
  FeedPost,
  FeedPostWithEngagement,
  FollowProfile,
  MiraiProfile,
  Notification,
  OnboardingState,
  Personality,
  SearchEntityType,
  SearchResult,
  TeamMember,
  UserDesignProfile,
  UserSettings,
} from '@/types/supabase'

const offlineMode = supabaseRuntime.mode !== 'online'

type MetricsMetadata = Record<string, unknown> | undefined

type TrackedSupabasePromise<T> = Promise<{ data?: T | null; error?: unknown | null }>

const asTrackedPromise = <T>(builder: unknown): TrackedSupabasePromise<T> =>
  builder as TrackedSupabasePromise<T>

async function trackSupabase<T>(
  operation: string,
  request: () => TrackedSupabasePromise<T>,
  metadata?: MetricsMetadata,
): Promise<{ data: T | null; error: unknown | null }> {
  const startedAt = Date.now()
  try {
    const { data = null, error = null } = await request()
    if (error) {
      recordSupabaseFailure(operation, Date.now() - startedAt)
      reportError(operation, error, metadata)
      return { data: null, error }
    }

    recordSupabaseSuccess(operation, Date.now() - startedAt)
    return { data: (data ?? null) as T | null, error: null }
  } catch (error) {
    recordSupabaseFailure(operation, Date.now() - startedAt)
    reportError(operation, error, metadata)
    return { data: null, error }
  }
}

export async function getProfile(userId: string): Promise<MiraiProfile | null> {
  if (offlineMode) {
    return offlineSupabaseApi.getProfile(userId)
  }

  const { data } = await trackSupabase(
    'getProfile',
    () =>
      asTrackedPromise(
        supabase.from('mirai_profile').select('*').eq('user_id', userId).maybeSingle(),
      ),
    { userId },
  )

  return (data as MiraiProfile | null) ?? null
}

export async function saveProfile(
  userId: string,
  profile: Partial<MiraiProfile>,
): Promise<{ profile: MiraiProfile | null; error?: unknown }> {
  if (offlineMode) {
    return offlineSupabaseApi.saveProfile(userId, profile)
  }

  const payload = { user_id: userId, ...profile }
  const result = await trackSupabase(
    'saveProfile',
    () =>
      asTrackedPromise(
        supabase.from('mirai_profile').upsert(payload, { onConflict: 'user_id' }).select().single(),
      ),
    { userId },
  )

  return { profile: (result.data as MiraiProfile | null) ?? null, error: result.error ?? undefined }
}

export async function getPersonality(userId: string): Promise<Personality | null> {
  if (offlineMode) {
    return offlineSupabaseApi.getPersonality(userId)
  }

  const { data } = await trackSupabase(
    'getPersonality',
    () =>
      asTrackedPromise(supabase.from('personality').select('*').eq('user_id', userId).maybeSingle()),
    { userId },
  )

  return (data as Personality | null) ?? null
}

export async function savePersonality(
  userId: string,
  traits: Partial<Personality>,
): Promise<{ personality: Personality | null; error?: unknown }> {
  if (offlineMode) {
    return offlineSupabaseApi.savePersonality(userId, traits)
  }

  const payload = {
    user_id: userId,
    ...traits,
    updated_at: new Date().toISOString(),
  }

  const result = await trackSupabase(
    'savePersonality',
    () =>
      asTrackedPromise(
        supabase.from('personality').upsert(payload, { onConflict: 'user_id' }).select().single(),
      ),
    { userId },
  )

  return { personality: (result.data as Personality | null) ?? null, error: result.error ?? undefined }
}

export async function updateUserMetadata(metadata: Record<string, unknown>): Promise<AuthResult> {
  if (offlineMode) {
    return offlineSupabaseApi.updateUserMetadata(metadata)
  }

  const result = await trackSupabase(
    'updateUserMetadata',
    () => asTrackedPromise(supabase.auth.updateUser({ data: metadata })),
    {
      keys: Object.keys(metadata),
    },
  )

  return result.error ? { error: result.error } : {}
}

export async function getFollowingFeed(viewerId: string): Promise<FeedPostWithEngagement[]> {
  if (offlineMode) {
    return offlineSupabaseApi.getFollowingFeed(viewerId)
  }

  const { data } = await trackSupabase(
    'getFollowingFeed',
    () =>
      supabase.rpc('fetch_following_feed', { viewer_id: viewerId }) as unknown as Promise<{
        data?: FeedPostWithEngagement[] | null
        error?: unknown | null
      }>,
    { viewerId },
  )

  return ((data as FeedPostWithEngagement[]) ?? []).map((entry) => ({
    ...entry,
    likes_count: entry.likes_count ?? 0,
    comments: entry.comments ?? [],
    viewer_has_liked: Boolean(entry.viewer_has_liked),
  }))
}

export async function getFeedWithEngagement(viewerId?: string): Promise<FeedPostWithEngagement[]> {
  if (offlineMode) {
    return offlineSupabaseApi.getFeedWithEngagement(viewerId)
  }

  const { data } = await trackSupabase(
    'getFeedWithEngagement',
    () =>
      supabase.rpc('fetch_feed_with_engagement', { viewer_id: viewerId ?? null }) as unknown as Promise<{
        data?: FeedPostWithEngagement[] | null
        error?: unknown | null
      }>,
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
  if (offlineMode) {
    return offlineSupabaseApi.getFeedForUser(userId, viewerId)
  }

  const { data } = await trackSupabase(
    'getFeedForUser',
    () =>
      supabase.rpc('fetch_profile_feed', { target_user_id: userId, viewer_id: viewerId ?? null }) as unknown as Promise<{
        data?: FeedPostWithEngagement[] | null
        error?: unknown | null
      }>,
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
  if (offlineMode) {
    return offlineSupabaseApi.likePost(postId, userId)
  }

  const result = await trackSupabase(
    'likePost',
    () => asTrackedPromise(supabase.from('feed_likes').upsert({ post_id: postId, user_id: userId })),
    { postId, userId },
  )

  return result.error ? { error: result.error } : {}
}

export async function unlikePost(postId: string, userId: string): Promise<AuthResult> {
  if (offlineMode) {
    return offlineSupabaseApi.unlikePost(postId, userId)
  }

  const result = await trackSupabase(
    'unlikePost',
    () =>
      asTrackedPromise(supabase.from('feed_likes').delete().eq('post_id', postId).eq('user_id', userId)),
    { postId, userId },
  )

  return result.error ? { error: result.error } : {}
}

export async function addComment(
  postId: string,
  userId: string,
  body: string,
): Promise<{ comment: FeedComment | null; error?: unknown }> {
  if (offlineMode) {
    return offlineSupabaseApi.addComment(postId, userId, body)
  }

  const result = await trackSupabase(
    'addComment',
    () =>
      asTrackedPromise(
        supabase
          .from('feed_comments')
          .insert([{ post_id: postId, user_id: userId, body }])
          .select('*')
          .single(),
      ),
    { postId, userId },
  )

  return { comment: (result.data as FeedComment | null) ?? null, error: result.error ?? undefined }
}

export async function createPost(
  post: Omit<FeedPost, 'id' | 'created_at'>,
): Promise<{ post: FeedPost | null; error?: unknown }> {
  if (offlineMode) {
    return offlineSupabaseApi.createPost(post)
  }

  const result = await trackSupabase(
    'createPost',
    () => asTrackedPromise(supabase.from('feed_posts').insert([post]).select().single()),
    { userId: post.user_id },
  )

  return { post: (result.data as FeedPost | null) ?? null, error: result.error ?? undefined }
}

export async function generateCaptionSuggestion(payload: {
  mood: string
  message: string
}): Promise<{ suggestion: CaptionSuggestionResult | null; error?: unknown }> {
  if (offlineMode) {
    return offlineSupabaseApi.generateCaptionSuggestion(payload)
  }

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
  if (offlineMode) {
    return offlineSupabaseApi.getFollowers(userId)
  }

  const { data } = await trackSupabase(
    'getFollowers',
    () =>
      asTrackedPromise(
        supabase.from('followers_view').select('*').eq('target_id', userId).order('created_at', { ascending: false }),
      ),
    { userId },
  )

  return (data as FollowProfile[]) ?? []
}

export async function getFollowing(userId: string): Promise<FollowProfile[]> {
  if (offlineMode) {
    return offlineSupabaseApi.getFollowing(userId)
  }

  const { data } = await trackSupabase(
    'getFollowing',
    () =>
      asTrackedPromise(
        supabase.from('following_view').select('*').eq('follower_id', userId).order('created_at', { ascending: false }),
      ),
    { userId },
  )

  return (data as FollowProfile[]) ?? []
}

export async function followProfile(followerId: string, targetId: string): Promise<AuthResult> {
  if (offlineMode) {
    return offlineSupabaseApi.followProfile(followerId, targetId)
  }

  const result = await trackSupabase(
    'followProfile',
    () => asTrackedPromise(supabase.from('follows').upsert({ follower_id: followerId, following_id: targetId })),
    { followerId, targetId },
  )

  return result.error ? { error: result.error } : {}
}

export async function unfollowProfile(followerId: string, targetId: string): Promise<AuthResult> {
  if (offlineMode) {
    return offlineSupabaseApi.unfollowProfile(followerId, targetId)
  }

  const result = await trackSupabase(
    'unfollowProfile',
    () =>
      asTrackedPromise(supabase.from('follows').delete().eq('follower_id', followerId).eq('following_id', targetId)),
    { followerId, targetId },
  )

  return result.error ? { error: result.error } : {}
}

export async function getOnboardingState(userId: string): Promise<OnboardingState | null> {
  if (offlineMode) {
    return offlineSupabaseApi.getOnboardingState(userId)
  }

  const { data } = await trackSupabase(
    'getOnboardingState',
    () => asTrackedPromise(supabase.from('onboarding_state').select('*').eq('user_id', userId).maybeSingle()),
    { userId },
  )

  return (data as OnboardingState | null) ?? null
}

export async function upsertOnboardingState(
  userId: string,
  state: Partial<OnboardingState>,
): Promise<{ state: OnboardingState | null; error?: unknown }> {
  if (offlineMode) {
    return offlineSupabaseApi.upsertOnboardingState(userId, state)
  }

  const payload = { user_id: userId, ...state }
  const result = await trackSupabase(
    'upsertOnboardingState',
    () =>
      asTrackedPromise(supabase.from('onboarding_state').upsert(payload, { onConflict: 'user_id' }).select().single()),
    { userId },
  )

  return { state: (result.data as OnboardingState | null) ?? null, error: result.error ?? undefined }
}

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  if (offlineMode) {
    return offlineSupabaseApi.getUserSettings(userId)
  }

  const { data } = await trackSupabase(
    'getUserSettings',
    () => asTrackedPromise(supabase.from('user_settings').select('*').eq('user_id', userId).maybeSingle()),
    { userId },
  )

  return (data as UserSettings | null) ?? null
}

export async function saveUserSettings(
  userId: string,
  settings: Partial<UserSettings>,
): Promise<AuthResult> {
  if (offlineMode) {
    return offlineSupabaseApi.saveUserSettings(userId, settings)
  }

  const payload = { user_id: userId, ...settings }
  const result = await trackSupabase(
    'saveUserSettings',
    () => asTrackedPromise(supabase.from('user_settings').upsert(payload, { onConflict: 'user_id' })),
    { userId },
  )

  return result.error ? { error: result.error } : {}
}

export async function getUserDesignProfile(userId: string): Promise<UserDesignProfile | null> {
  if (offlineMode) {
    return offlineSupabaseApi.getUserDesignProfile(userId)
  }

  const { data } = await trackSupabase(
    'getUserDesignProfile',
    () =>
      asTrackedPromise(supabase.from('user_design_profile').select('*').eq('user_id', userId).maybeSingle()),
    { userId },
  )

  return (data as UserDesignProfile | null) ?? null
}

export async function saveUserDesignProfile(
  userId: string,
  profile: Partial<UserDesignProfile> & { design_dna?: DesignDNA | null },
): Promise<{ profile: UserDesignProfile | null; error?: unknown }> {
  if (offlineMode) {
    return offlineSupabaseApi.saveUserDesignProfile(userId, profile)
  }

  const payload = { user_id: userId, ...profile }
  const result = await trackSupabase(
    'saveUserDesignProfile',
    () =>
      asTrackedPromise(supabase.from('user_design_profile').upsert(payload, { onConflict: 'user_id' }).select().single()),
    { userId },
  )

  return { profile: (result.data as UserDesignProfile | null) ?? null, error: result.error ?? undefined }
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  if (offlineMode) {
    return offlineSupabaseApi.getNotifications(userId)
  }

  const { data } = await trackSupabase(
    'getNotifications',
    () =>
      asTrackedPromise(
        supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      ),
    { userId },
  )

  return (data as Notification[]) ?? []
}

export async function markNotificationRead(id: string): Promise<AuthResult> {
  if (offlineMode) {
    return offlineSupabaseApi.markNotificationRead(id)
  }

  const result = await trackSupabase(
    'markNotificationRead',
    () => asTrackedPromise(supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id)),
    { id },
  )

  return result.error ? { error: result.error } : {}
}

export async function markAllNotificationsRead(userId: string): Promise<AuthResult> {
  if (offlineMode) {
    return offlineSupabaseApi.markAllNotificationsRead(userId)
  }

  const result = await trackSupabase(
    'markAllNotificationsRead',
    () =>
      asTrackedPromise(
        supabase
          .from('notifications')
          .update({ read_at: new Date().toISOString() })
          .eq('user_id', userId)
          .is('read_at', null),
      ),
    { userId },
  )

  return result.error ? { error: result.error } : {}
}

export async function getConversations(userId: string): Promise<ConversationSummary[]> {
  if (offlineMode) {
    return offlineSupabaseApi.getConversations(userId)
  }

  const { data } = await trackSupabase(
    'getConversations',
    () =>
      asTrackedPromise(
        supabase.from('conversations_view').select('*').eq('member_id', userId).order('updated_at', { ascending: false }),
      ),
    { userId },
  )

  return (data as ConversationSummary[]) ?? []
}

export async function getConversationMessages(conversationId: string): Promise<DirectMessage[]> {
  if (offlineMode) {
    return offlineSupabaseApi.getConversationMessages(conversationId)
  }

  const { data } = await trackSupabase(
    'getConversationMessages',
    () =>
      asTrackedPromise(
        supabase.from('messages_view').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true }),
      ),
    { conversationId },
  )

  return (data as DirectMessage[]) ?? []
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  body: string,
): Promise<{ message: DirectMessage | null; error?: unknown }> {
  if (offlineMode) {
    return offlineSupabaseApi.sendMessage(conversationId, senderId, body)
  }

  const result = await trackSupabase(
    'sendMessage',
    () =>
      asTrackedPromise(
        supabase
          .from('messages')
          .insert([{ conversation_id: conversationId, sender_id: senderId, body }])
          .select('*')
          .single(),
      ),
    { conversationId, senderId },
  )

  return { message: (result.data as DirectMessage | null) ?? null, error: result.error ?? undefined }
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  if (offlineMode) {
    return offlineSupabaseApi.getTeamMembers()
  }

  const { data } = await trackSupabase(
    'getTeamMembers',
    () => asTrackedPromise(supabase.from('team_members').select('*').order('created_at', { ascending: true })),
  )

  return (data as TeamMember[]) ?? []
}

export async function addTeamMember(payload: {
  email: string
  name: string | null
  role: TeamMember['role']
  login_method: TeamMember['login_method']
}): Promise<{ member: TeamMember | null; error?: unknown }> {
  if (offlineMode) {
    return offlineSupabaseApi.addTeamMember(payload)
  }

  const result = await trackSupabase(
    'addTeamMember',
    () => asTrackedPromise(supabase.from('team_members').insert([payload]).select('*').single()),
    { email: payload.email, role: payload.role },
  )

  return { member: (result.data as TeamMember | null) ?? null, error: result.error ?? undefined }
}

export async function removeTeamMember(id: string): Promise<AuthResult> {
  if (offlineMode) {
    return offlineSupabaseApi.removeTeamMember(id)
  }

  const result = await trackSupabase(
    'removeTeamMember',
    () => asTrackedPromise(supabase.from('team_members').delete().eq('id', id)),
    { id },
  )
  return result.error ? { error: result.error } : {}
}

export async function searchDirectory(query: string): Promise<SearchResult[]> {
  if (offlineMode) {
    return offlineSupabaseApi.searchDirectory(query)
  }

  const { data } = await trackSupabase(
    'searchDirectory',
    () =>
      supabase.rpc('search_directory', { search_query: query }) as unknown as Promise<{
        data?: SearchResult[] | null
        error?: unknown | null
      }>,
    { query },
  )

  return (data as SearchResult[]) ?? []
}

export async function requestMagicLink(email: string): Promise<AuthResult> {
  if (offlineMode) {
    return offlineSupabaseApi.requestMagicLink(email)
  }

  const result = await trackSupabase(
    'requestMagicLink',
    () => asTrackedPromise(supabase.auth.signInWithOtp({ email })),
    { email },
  )
  return result.error ? { error: result.error } : {}
}

export async function signUpWithPassword(
  email: string,
  password: string,
  username: string,
): Promise<AuthResult> {
  if (offlineMode) {
    return offlineSupabaseApi.signUpWithPassword(email, password, username)
  }

  const result = await trackSupabase(
    'signUpWithPassword',
    () =>
      asTrackedPromise(
        supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username },
          },
        }),
      ),
    { email },
  )

  return result.error ? { error: result.error } : {}
}

export async function signInWithPassword(email: string, password: string): Promise<AuthResult> {
  if (offlineMode) {
    return offlineSupabaseApi.signInWithPassword(email, password)
  }

  const result = await trackSupabase(
    'signInWithPassword',
    () => asTrackedPromise(supabase.auth.signInWithPassword({ email, password })),
    { email },
  )

  return result.error ? { error: result.error } : {}
}

export async function signInWithGoogle(): Promise<AuthResult> {
  if (offlineMode) {
    return offlineSupabaseApi.signInWithGoogle()
  }

  const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined
  const result = await trackSupabase(
    'signInWithGoogle',
    () =>
      asTrackedPromise(
        supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo,
            queryParams: { prompt: 'select_account' },
          },
        }),
      ),
  )

  return result.error ? { error: result.error } : {}
}

export async function signOut(): Promise<void> {
  if (offlineMode) {
    await offlineSupabaseApi.signOut()
    return
  }

  await trackSupabase('signOut', () => asTrackedPromise(supabase.auth.signOut()))
}
