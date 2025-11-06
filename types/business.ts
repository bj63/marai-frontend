export type BusinessNavSection =
  | 'overview'
  | 'planner'
  | 'posts'
  | 'insights'
  | 'team'
  | 'assets'
  | 'analytics'
  | 'settings'

export interface BusinessProfile {
  id: string
  name: string
  tagline: string
  heroImageUrl?: string | null
  avatarUrl?: string | null
  verified?: boolean
  sectors?: string[]
  headquarters?: string | null
  website?: string | null
}

export interface SentimentSignal {
  label: string
  confidence: number
}

export interface SentimentSnapshot {
  dominant: SentimentSignal | null
  aggregate: SentimentSignal[]
  trend: number[]
  updatedAt?: string | null
}

export interface BusinessMetric {
  id: string
  label: string
  value: string
  trendLabel?: string
  trendDirection?: 'up' | 'down' | 'flat'
}

export type AutopostStatus = 'scheduled' | 'publishing' | 'published'

export interface AutopostCallToAction {
  label?: string | null
  url?: string | null
}

export interface AutopostFeedHints {
  placement?: string | null
  isPromoted?: boolean
  campaignId?: string | null
  brand?: string | null
  objective?: string | null
  variantKey?: string | null
  sentimentLabel?: string | null
  sentimentConfidence?: number | null
  autopostId?: number | null
  status?: AutopostStatus
}

export interface AutopostDetails {
  creativeType?: string | null
  title?: string | null
  summary?: string | null
  body?: string | null
  inspirations: string[]
  hashtags: string[]
  audience?: string | null
  adaptiveProfile?: Record<string, unknown> | null
  feedHints?: AutopostFeedHints | null
  callToAction?: AutopostCallToAction | null
  assetUrl?: string | null
  posterUrl?: string | null
  mediaUrl?: string | null
  durationSeconds?: number | null
  scheduledAt?: string | null
  connectionDream?: Record<string, unknown> | null
}

export interface AutopostQueueEntry {
  id: number
  ownerId: string
  body: string
  mood?: string | null
  emotionState?: Record<string, unknown> | null
  sentimentSignals: SentimentSignal[]
  assetUrl?: string | null
  mediaUrl?: string | null
  posterUrl?: string | null
  durationSeconds?: number | null
  metadata?: Record<string, unknown> | null
  status: AutopostStatus
  scheduledAt: string
  publishedPostId?: number | null
  createdAt: string
  updatedAt: string
  creativeType?: string | null
  title?: string | null
  summary?: string | null
  inspirations?: string[] | null
  audience?: string | null
  hashtags?: string[] | null
  callToAction?: AutopostCallToAction | null
  callToActionLabel?: string | null
  callToActionUrl?: string | null
  responseBody?: string | null
  delaySeconds?: number | null
  publishedPost?: {
    id: number
    body: string
    publishedAt: string
    metadata?: Record<string, unknown> | null
  } | null
  details: AutopostDetails | null
  feedHints: AutopostFeedHints | null
  isPromoted: boolean
}

export interface CampaignPerformanceRow {
  id: string
  campaign: string
  objective: string
  impressions: number
  engagementRate: number
  conversionRate: number
  sentiment: SentimentSignal | null
}

export interface EmployeeReflection {
  id: string
  author: string
  role: string
  emotion: SentimentSignal
  note: string
  timestamp: string
}

export interface CreativeAssetItem {
  id: string
  title: string
  type: 'image' | 'video' | 'copy' | 'audio' | 'document'
  url?: string | null
  thumbnailUrl?: string | null
  tags: string[]
  lastUsed?: string | null
}

export interface BusinessFeatureFlags {
  proModeEnabled: boolean
  sentimentSharingEnabled: boolean
  aiCreativePreview: boolean
}

export interface BusinessDataSnapshot {
  company: BusinessProfile
  autoposts: AutopostQueueEntry[]
  sentiment: SentimentSnapshot
  metrics: BusinessMetric[]
  featureFlags: BusinessFeatureFlags
}
