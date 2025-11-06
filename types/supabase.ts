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
  metadata?: FeedAutopostMetadata | Record<string, unknown> | null
}

export interface FeedAutopostMetadata {
  creativeType?: string | null
  title?: string | null
  summary?: string | null
  body?: string | null
  inspirations?: string[]
  hashtags?: string[]
  audience?: string | null
  adaptiveProfile?: Record<string, unknown> | null
  feedHints?: unknown
  callToAction?: { label?: string | null; url?: string | null } | null
  assetUrl?: string | null
  posterUrl?: string | null
  mediaUrl?: string | null
  durationSeconds?: number | null
  scheduledAt?: string | null
  connectionDream?: Record<string, unknown> | null
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
