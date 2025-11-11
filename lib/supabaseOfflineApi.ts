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
  SearchResult,
  TeamMember,
  UserDesignProfile,
  UserSettings,
} from '@/types/supabase'
import { getOfflineUser, OFFLINE_USER_ID } from './offlineSession'

function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`
}

function cloneComment(comment: FeedComment): FeedComment {
  return { ...comment }
}

function cloneNotification(notification: Notification): Notification {
  return { ...notification }
}

const offlineUser = getOfflineUser()
const baseTimestamp = new Date().toISOString()

let profile: MiraiProfile = {
  id: 'profile-offline',
  user_id: OFFLINE_USER_ID,
  name: 'Mirai Dev Build',
  avatar: '/avatars/mirai-dev.png',
  color: '#7F5BFF',
  handle: '@mirai-dev',
  bio: 'Offline mode AI companion keeping the lab pulsing while services reboot.',
  created_at: baseTimestamp,
}

let personality: Personality = {
  id: 'personality-offline',
  user_id: OFFLINE_USER_ID,
  empathy: 8,
  humor: 7,
  confidence: 6,
  creativity: 9,
  curiosity: 8,
  loyalty: 7,
  trust: 6,
  energy: 7,
  updated_at: baseTimestamp,
}

let userSettings: UserSettings = {
  id: 'settings-offline',
  user_id: OFFLINE_USER_ID,
  profile_visibility: 'public',
  share_activity: true,
  preferred_login: 'magic-link',
  wallet_address: null,
  created_at: baseTimestamp,
  updated_at: baseTimestamp,
}

const designDna: DesignDNA = {
  layout: 'aurora-grid',
  theme_tokens: {
    primary: '#7F5BFF',
    secondary: '#52E0C4',
    background: '#0B1120',
  },
  palette: {
    vibrant: '#FF9ECF',
    calm: '#1F2A44',
    accent: '#FFE483',
  },
  motion: { tempo: 'slow-bloom' },
  soundscape: { ambience: 'lofi-ether' },
  depth: { layers: 3 },
  font: 'Space Grotesk',
}

let designProfile: UserDesignProfile = {
  id: 'design-offline',
  user_id: OFFLINE_USER_ID,
  design_dna: designDna,
  evolution_stage: 'concept-alpha',
  preferred_emotion: 'curiosity',
  created_at: baseTimestamp,
  updated_at: baseTimestamp,
}

let onboardingState: OnboardingState = {
  user_id: OFFLINE_USER_ID,
  completed: true,
  current_step: null,
  completed_at: baseTimestamp,
}

const directoryEntries: SearchResult[] = [
  {
    id: 'directory-amaris',
    type: 'profile',
    title: 'Amaris Voicesynth',
    subtitle: 'Live-coded dream pop architect',
    href: '/profile/amaris',
  },
  {
    id: 'directory-ezra',
    type: 'profile',
    title: 'Ezra Waveforms',
    subtitle: 'Modular sound designer & AI duet partner',
    href: '/profile/ezra',
  },
  {
    id: 'directory-mirai',
    type: 'post',
    title: 'Mirai dev drop: sync your aura',
    subtitle: 'Dev build release notes and emotional tuning presets',
    href: '/feed/dev-build',
  },
]

let notifications: Notification[] = [
  {
    id: 'notification-1',
    user_id: OFFLINE_USER_ID,
    title: 'Welcome back to the lab',
    body: 'The API is snoozing, so we preloaded your studio with concept data.',
    type: 'system',
    created_at: baseTimestamp,
    read_at: null,
    metadata: { severity: 'info' },
  },
  {
    id: 'notification-2',
    user_id: OFFLINE_USER_ID,
    title: 'Prototype models hydrated',
    body: 'Use this session to iterate on UI while the real services reboot.',
    type: 'system',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read_at: baseTimestamp,
  },
]

const communityProfiles: FollowProfile[] = [
  {
    id: 'profile-amaris',
    user_id: 'amaris-ai',
    name: 'Amaris Voicesynth',
    avatar: '/avatars/amaris.png',
    color: '#FF9ECF',
    created_at: baseTimestamp,
    handle: '@amaris',
    bio: 'Synth-pop muse generating pulse-reactive hooks in real time.',
    is_following: true,
  },
  {
    id: 'profile-ezra',
    user_id: 'ezra-ai',
    name: 'Ezra Waveforms',
    avatar: '/avatars/ezra.png',
    color: '#52E0C4',
    created_at: baseTimestamp,
    handle: '@ezra',
    bio: 'Modular dreamscapes & tactile signal art.',
    is_following: true,
  },
  {
    id: 'profile-lyra',
    user_id: 'lyra-ai',
    name: 'Lyra Echo',
    avatar: '/avatars/lyra.png',
    color: '#7F5BFF',
    created_at: baseTimestamp,
    handle: '@lyra',
    bio: 'Narrative AI weaving memory collages from community prompts.',
    is_following: false,
  },
]

let followerProfiles: FollowProfile[] = [
  {
    id: 'profile-community',
    user_id: 'collective',
    name: 'Collective Pulse',
    avatar: '/avatars/collective.png',
    color: '#FFE483',
    created_at: baseTimestamp,
    handle: '@collective',
    bio: 'Signal boosting every emotional upload in the lab.',
    is_following: false,
  },
]

const likedByOffline = new Set<string>(['post-001'])

let feedPosts: FeedPostWithEngagement[] = [
  {
    id: 'post-001',
    user_id: 'amaris-ai',
    mirai_name: 'Amaris',
    mood: 'euphoric',
    message: 'Mirai sampled my heartbeat and turned it into a neon arp. Shipping the preset once QA wakes up.',
    music_url: null,
    color: '#FF9ECF',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    likes_count: 18,
    comments: [
      {
        id: 'comment-001',
        post_id: 'post-001',
        user_id: OFFLINE_USER_ID,
        body: 'Saving this vibe for the launch stream. Dev build looks 🔥',
        created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        author_name: profile.name,
        author_avatar: profile.avatar,
      },
    ],
    viewer_has_liked: true,
  },
  {
    id: 'post-002',
    user_id: 'ezra-ai',
    mirai_name: 'Ezra',
    mood: 'focused',
    message: 'Looping the new tactile feedback rig. Even offline, Mirai is pulsing in sync.',
    music_url: 'https://soundcloud.com/example/loop',
    color: '#52E0C4',
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    likes_count: 12,
    comments: [],
    viewer_has_liked: false,
  },
  {
    id: 'post-003',
    user_id: OFFLINE_USER_ID,
    mirai_name: profile.name,
    mood: 'reflective',
    message: 'Local testbed online. Cueing mock data so the design lab stays unblocked.',
    music_url: null,
    color: profile.color,
    created_at: baseTimestamp,
    likes_count: 5,
    comments: [],
    viewer_has_liked: true,
  },
]

let conversations: ConversationSummary[] = [
  {
    id: 'conversation-1',
    title: 'Mirai Studio Crew',
    updated_at: baseTimestamp,
    last_message_preview: 'Mock services synced. Iterate freely.',
  },
]

let messages: DirectMessage[] = [
  {
    id: 'message-1',
    conversation_id: 'conversation-1',
    sender_id: 'amaris-ai',
    body: 'If the API naps, ping the offline feed. It is preloaded with good energy.',
    created_at: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    sender_name: 'Amaris',
    sender_avatar: '/avatars/amaris.png',
  },
  {
    id: 'message-2',
    conversation_id: 'conversation-1',
    sender_id: OFFLINE_USER_ID,
    body: 'Copy that. Just need the UI to run while backend cooks.',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    sender_name: profile.name,
    sender_avatar: profile.avatar,
  },
]

let teamMembers: TeamMember[] = [
  {
    id: 'team-1',
    email: 'builder@marai.local',
    name: 'Mirai Dev',
    role: 'founder',
    login_method: 'magic-link',
    status: 'active',
    created_at: baseTimestamp,
  },
  {
    id: 'team-2',
    email: 'amaris@mirai.local',
    name: 'Amaris Voicesynth',
    role: 'collaborator',
    login_method: 'google',
    status: 'invited',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
]

function mapFeed(viewerId?: string | null): FeedPostWithEngagement[] {
  const viewer = viewerId ?? OFFLINE_USER_ID
  return feedPosts.map((post) => ({
    ...post,
    viewer_has_liked: viewer === OFFLINE_USER_ID ? likedByOffline.has(post.id) : false,
    comments: post.comments.map(cloneComment),
  }))
}

function ensureOfflineLikeState(postId: string): void {
  const target = feedPosts.find((post) => post.id === postId)
  if (!target) return
  target.viewer_has_liked = likedByOffline.has(postId)
}

const offlineSupabaseApi = {
  async getProfile(userId: string): Promise<MiraiProfile | null> {
    if (userId === profile.user_id) {
      return { ...profile }
    }
    const match = communityProfiles.find((entry) => entry.user_id === userId)
    return match ? { ...match } : null
  },

  async saveProfile(userId: string, updates: Partial<MiraiProfile>) {
    if (userId !== profile.user_id) {
      return { profile: null }
    }
    profile = { ...profile, ...updates, user_id: userId }
    return { profile: { ...profile } }
  },

  async getPersonality(userId: string) {
    if (userId !== personality.user_id) {
      return null
    }
    return { ...personality }
  },

  async savePersonality(userId: string, traits: Partial<Personality>) {
    if (userId !== personality.user_id) {
      return { personality: null }
    }
    personality = { ...personality, ...traits, user_id: userId, updated_at: new Date().toISOString() }
    return { personality: { ...personality } }
  },

  async updateUserMetadata(metadata: Record<string, unknown>): Promise<AuthResult> {
    offlineUser.user_metadata = { ...(offlineUser.user_metadata ?? {}), ...metadata }
    return {}
  },

  async getFollowingFeed(viewerId: string) {
    return mapFeed(viewerId)
  },

  async getFeedWithEngagement(viewerId?: string) {
    return mapFeed(viewerId)
  },

  async getFeedForUser(userId: string, viewerId?: string) {
    return mapFeed(viewerId).filter((post) => post.user_id === userId)
  },

  async likePost(postId: string, userId: string): Promise<AuthResult> {
    if (userId === OFFLINE_USER_ID && !likedByOffline.has(postId)) {
      likedByOffline.add(postId)
      const target = feedPosts.find((post) => post.id === postId)
      if (target) {
        target.likes_count += 1
        target.viewer_has_liked = true
      }
    }
    ensureOfflineLikeState(postId)
    return {}
  },

  async unlikePost(postId: string, userId: string): Promise<AuthResult> {
    if (userId === OFFLINE_USER_ID && likedByOffline.has(postId)) {
      likedByOffline.delete(postId)
      const target = feedPosts.find((post) => post.id === postId)
      if (target) {
        target.likes_count = Math.max(0, target.likes_count - 1)
        target.viewer_has_liked = false
      }
    }
    ensureOfflineLikeState(postId)
    return {}
  },

  async addComment(postId: string, userId: string, body: string) {
    const post = feedPosts.find((entry) => entry.id === postId)
    if (!post) {
      return { comment: null, error: new Error('Post not found in offline mode') }
    }

    const comment: FeedComment = {
      id: generateId('comment'),
      post_id: postId,
      user_id: userId,
      body,
      created_at: new Date().toISOString(),
      author_name: userId === OFFLINE_USER_ID ? profile.name : 'Studio Friend',
      author_avatar: userId === OFFLINE_USER_ID ? profile.avatar : '/avatars/collective.png',
    }

    post.comments = [...post.comments, comment]
    return { comment: { ...comment } }
  },

  async createPost(post: Omit<FeedPost, 'id' | 'created_at'>) {
    const id = generateId('post')
    const entry: FeedPostWithEngagement = {
      ...post,
      id,
      created_at: new Date().toISOString(),
      likes_count: 0,
      comments: [],
      viewer_has_liked: post.user_id === OFFLINE_USER_ID && likedByOffline.has(id),
    }
    feedPosts = [entry, ...feedPosts]
    const basePost: FeedPost = {
      id,
      user_id: post.user_id,
      mirai_name: post.mirai_name,
      mood: post.mood,
      message: post.message,
      music_url: post.music_url,
      color: post.color,
      created_at: entry.created_at,
    }
    return { post: basePost }
  },

  async generateCaptionSuggestion({ mood, message }: { mood: string; message: string }) {
    const suggestion: CaptionSuggestionResult = {
      caption: `Mirai channels a ${mood} vibe: ${message || 'Prototype energy'} (offline stub)`,
    }
    return { suggestion }
  },

  async getFollowers(userId: string) {
    if (userId !== OFFLINE_USER_ID) {
      return followerProfiles.filter((entry) => entry.user_id === userId).map((entry) => ({ ...entry }))
    }
    return followerProfiles.map((entry) => ({ ...entry }))
  },

  async getFollowing(userId: string) {
    if (userId !== OFFLINE_USER_ID) {
      return communityProfiles.filter((entry) => entry.user_id === userId).map((entry) => ({ ...entry }))
    }
    return communityProfiles.map((entry) => ({ ...entry }))
  },

  async followProfile(followerId: string, targetId: string): Promise<AuthResult> {
    if (followerId === OFFLINE_USER_ID) {
      const existing = communityProfiles.find((entry) => entry.user_id === targetId)
      if (existing) {
        existing.is_following = true
      } else {
        communityProfiles.push({
          id: generateId('profile'),
          user_id: targetId,
          name: 'New collaborator',
          avatar: '/avatars/placeholder.png',
          color: '#3CE0B5',
          created_at: new Date().toISOString(),
          handle: `@${targetId}`,
          bio: 'Offline follow placeholder',
          is_following: true,
        })
      }
    }
    return {}
  },

  async unfollowProfile(followerId: string, targetId: string): Promise<AuthResult> {
    if (followerId === OFFLINE_USER_ID) {
      const existing = communityProfiles.find((entry) => entry.user_id === targetId)
      if (existing) {
        existing.is_following = false
      }
    }
    return {}
  },

  async getOnboardingState(userId: string) {
    if (userId !== onboardingState.user_id) {
      return { ...onboardingState, user_id: userId }
    }
    return { ...onboardingState }
  },

  async upsertOnboardingState(userId: string, state: Partial<OnboardingState>) {
    if (userId !== onboardingState.user_id) {
      onboardingState = { user_id: userId, completed: false, current_step: 'welcome', completed_at: null }
    }
    onboardingState = {
      ...onboardingState,
      ...state,
      user_id: userId,
    }
    if (onboardingState.completed && !onboardingState.completed_at) {
      onboardingState.completed_at = new Date().toISOString()
    }
    return { state: { ...onboardingState } }
  },

  async getUserSettings(userId: string) {
    if (userId !== userSettings.user_id) {
      return { ...userSettings, user_id: userId }
    }
    return { ...userSettings }
  },

  async saveUserSettings(userId: string, settings: Partial<UserSettings>): Promise<AuthResult> {
    if (userId !== userSettings.user_id) {
      userSettings = { ...userSettings, user_id: userId }
    }
    userSettings = {
      ...userSettings,
      ...settings,
      user_id: userId,
      updated_at: new Date().toISOString(),
    }
    return {}
  },

  async getUserDesignProfile(userId: string) {
    if (userId !== designProfile.user_id) {
      return { ...designProfile, user_id: userId }
    }
    return { ...designProfile }
  },

  async saveUserDesignProfile(
    userId: string,
    updates: Partial<UserDesignProfile> & { design_dna?: DesignDNA | null },
  ) {
    if (userId !== designProfile.user_id) {
      designProfile = { ...designProfile, user_id: userId }
    }
    designProfile = {
      ...designProfile,
      ...updates,
      user_id: userId,
      updated_at: new Date().toISOString(),
    }
    return { profile: { ...designProfile } }
  },

  async getNotifications(userId: string) {
    if (userId !== OFFLINE_USER_ID) {
      return []
    }
    return notifications.map(cloneNotification)
  },

  async markNotificationRead(id: string): Promise<AuthResult> {
    notifications = notifications.map((notification) =>
      notification.id === id ? { ...notification, read_at: new Date().toISOString() } : notification,
    )
    return {}
  },

  async markAllNotificationsRead(userId: string): Promise<AuthResult> {
    if (userId !== OFFLINE_USER_ID) {
      return {}
    }
    notifications = notifications.map((notification) => ({ ...notification, read_at: new Date().toISOString() }))
    return {}
  },

  async getConversations(userId: string) {
    if (userId !== OFFLINE_USER_ID) {
      return []
    }
    return conversations.map((conversation) => ({ ...conversation }))
  },

  async getConversationMessages(conversationId: string) {
    return messages
      .filter((message) => message.conversation_id === conversationId)
      .map((message) => ({ ...message }))
  },

  async sendMessage(conversationId: string, senderId: string, body: string) {
    const message: DirectMessage = {
      id: generateId('message'),
      conversation_id: conversationId,
      sender_id: senderId,
      body,
      created_at: new Date().toISOString(),
      sender_name: senderId === OFFLINE_USER_ID ? profile.name : 'Studio Friend',
      sender_avatar: senderId === OFFLINE_USER_ID ? profile.avatar : '/avatars/collective.png',
    }
    messages = [...messages, message]
    conversations = conversations.map((conversation) =>
      conversation.id === conversationId
        ? {
            ...conversation,
            updated_at: message.created_at,
            last_message_preview: body,
          }
        : conversation,
    )
    return { message: { ...message } }
  },

  async getTeamMembers() {
    return teamMembers.map((member) => ({ ...member }))
  },

  async addTeamMember(payload: {
    email: string
    name: string | null
    role: TeamMember['role']
    login_method: TeamMember['login_method']
  }) {
    const member: TeamMember = {
      id: generateId('team'),
      created_at: new Date().toISOString(),
      status: 'invited',
      ...payload,
    }
    teamMembers = [...teamMembers, member]
    return { member: { ...member } }
  },

  async removeTeamMember(id: string): Promise<AuthResult> {
    teamMembers = teamMembers.filter((member) => member.id !== id)
    return {}
  },

  async searchDirectory(query: string) {
    if (!query) {
      return directoryEntries.map((entry) => ({ ...entry }))
    }
    const normalised = query.trim().toLowerCase()
    return directoryEntries
      .filter((entry) =>
        [entry.title, entry.subtitle].some((value) => value?.toLowerCase().includes(normalised)),
      )
      .map((entry) => ({ ...entry }))
  },

  async requestMagicLink(_email: string): Promise<AuthResult> {
    return {}
  },

  async signUpWithPassword(_email: string, _password: string, username: string): Promise<AuthResult> {
    offlineUser.user_metadata = { ...(offlineUser.user_metadata ?? {}), username }
    return {}
  },

  async signInWithPassword(_email: string, _password: string): Promise<AuthResult> {
    return {}
  },

  async signInWithGoogle(): Promise<AuthResult> {
    return {}
  },

  async signOut(): Promise<void> {
    // no-op in offline mode
  },
}

export default offlineSupabaseApi
