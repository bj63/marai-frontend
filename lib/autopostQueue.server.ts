import { randomUUID } from 'node:crypto'

import type { AutopostCallToAction as AutopostCallToActionType } from '@/lib/autopost'

export type AutopostCallToAction = AutopostCallToActionType

export type AutopostStatus = 'scheduled' | 'publishing' | 'published'
export type AutopostAudience = 'public' | 'friends' | 'private'

export interface EmotionSignal {
  label: string
  confidence: number
}

export interface FeedPostRecord {
  id: number
  authorId: string
  body: string
  mood?: string | null
  emotionState?: Record<string, unknown> | null
  mediaUrl?: string | null
  posterUrl?: string | null
  durationSeconds?: number | null
  metadata?: Record<string, unknown> | null
  publishedAt: string
  createdAt: string
}

export interface AutopostRecord {
  id: number
  ownerId: string
  body: string
  mood?: string | null
  emotionState?: Record<string, unknown> | null
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
  publishedPost?: FeedPostRecord | null
  creativeType?: string | null
  title?: string | null
  summary?: string | null
  inspirations?: string[] | null
  audience?: AutopostAudience | null
  hashtags?: string[] | null
  callToAction?: AutopostCallToAction | null
  callToActionLabel?: string | null
  callToActionUrl?: string | null
  responseBody?: string | null
  delaySeconds?: number | null
}

interface AutopostQueueState {
  entries: AutopostRecord[]
  feedPosts: FeedPostRecord[]
  autopostSequence: number
  feedSequence: number
}

interface ListOptions {
  status?: AutopostStatus
  cursor?: string | null
  limit?: number
}

interface CreateAutopostInput {
  ownerId?: string
  body: string
  mood?: string | null
  emotionState?: Record<string, unknown> | null
  metadata?: Record<string, unknown> | null
  scheduledAt: string
  assetUrl?: string | null
  mediaUrl?: string | null
  posterUrl?: string | null
  durationSeconds?: number | null
  creativeType?: string | null
  title?: string | null
  summary?: string | null
  inspirations?: string[] | null
  audience?: AutopostAudience | null
  hashtags?: string[] | null
  callToAction?: AutopostCallToAction | null
  callToActionLabel?: string | null
  callToActionUrl?: string | null
  responseBody?: string | null
  delaySeconds?: number | null
}

export interface AdCampaignBrief {
  campaignId: string
  brandName: string
  objective: string
  creativeType: string
  title: string
  summary: string
  body: string
  inspirations: string[]
  hashtags: string[]
  assetUrl?: string | null
  posterUrl?: string | null
  mediaUrl?: string | null
  durationSeconds?: number | null
  audience?: AutopostAudience | null
  callToAction?: AutopostCallToAction | null
  emotionSignals: EmotionSignal[]
  scheduledAt: string
  delaySeconds?: number | null
}

interface PublishResult {
  entry: AutopostRecord
  feedPost: FeedPostRecord
}

const DEFAULT_OWNER = 'marai-business'
const DEFAULT_DURATION_SECONDS = 30
const PAGE_SIZE = 25

const getQueueState = (): AutopostQueueState => {
  const globalScope = globalThis as typeof globalThis & { __maraiAutopostQueue?: AutopostQueueState }
  if (!globalScope.__maraiAutopostQueue) {
    globalScope.__maraiAutopostQueue = {
      entries: [],
      feedPosts: [],
      autopostSequence: 1,
      feedSequence: 1,
    }
  }

  return globalScope.__maraiAutopostQueue
}

const cloneMetadata = <T>(metadata: T | null | undefined): T | null => {
  if (!metadata) return null
  return JSON.parse(JSON.stringify(metadata)) as T
}

const cloneFeedPost = (post: FeedPostRecord): FeedPostRecord => ({
  ...post,
  metadata: cloneMetadata(post.metadata),
  emotionState: post.emotionState ? { ...post.emotionState } : null,
})

const cloneAutopost = (entry: AutopostRecord): AutopostRecord => ({
  ...entry,
  metadata: cloneMetadata(entry.metadata),
  emotionState: entry.emotionState ? { ...entry.emotionState } : null,
  inspirations: entry.inspirations ? [...entry.inspirations] : null,
  hashtags: entry.hashtags ? [...entry.hashtags] : null,
  callToAction: entry.callToAction ? { ...entry.callToAction } : null,
  publishedPost: entry.publishedPost ? cloneFeedPost(entry.publishedPost) : null,
})

const toNumber = (value: string | null | undefined): number | null => {
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const normaliseHashtags = (values: string[] | null | undefined): string[] | null => {
  if (!values || values.length === 0) {
    return null
  }

  const seen = new Set<string>()
  const tags = values
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter((value) => value.length > 0)
    .map((value) => (value.startsWith('#') ? value : `#${value}`))
    .map((value) => value.replace(/\s+/g, '').replace(/#+/g, '#'))
    .map((value) => value.toLowerCase())
    .filter((value) => {
      if (value.length <= 1 || seen.has(value)) {
        return false
      }
      seen.add(value)
      return true
    })

  return tags.length > 0 ? tags : null
}

const ensurePosterUrl = (posterUrl: string | null | undefined, fallback?: string | null): string | null => {
  if (posterUrl && posterUrl.trim().length > 0) {
    return posterUrl
  }
  if (fallback && fallback.trim().length > 0) {
    return fallback
  }
  return null
}

const ensureDuration = (
  durationSeconds: number | null | undefined,
  mediaCandidate?: string | null,
): number | null => {
  if (typeof durationSeconds === 'number' && Number.isFinite(durationSeconds) && durationSeconds > 0) {
    return Math.round(durationSeconds)
  }
  if (mediaCandidate && mediaCandidate.trim().length > 0) {
    return DEFAULT_DURATION_SECONDS
  }
  return null
}

const createAutopost = (input: CreateAutopostInput): AutopostRecord => {
  const state = getQueueState()
  const now = new Date().toISOString()
  const mediaCandidate = input.mediaUrl ?? input.assetUrl ?? null
  const entry: AutopostRecord = {
    id: state.autopostSequence++,
    ownerId: input.ownerId ?? DEFAULT_OWNER,
    body: input.body,
    mood: input.mood ?? null,
    emotionState: input.emotionState ? { ...input.emotionState } : null,
    assetUrl: input.assetUrl ?? null,
    mediaUrl: mediaCandidate,
    posterUrl: ensurePosterUrl(input.posterUrl ?? null, mediaCandidate),
    durationSeconds: ensureDuration(input.durationSeconds ?? null, mediaCandidate),
    metadata: cloneMetadata(input.metadata),
    status: 'scheduled',
    scheduledAt: input.scheduledAt,
    publishedPostId: null,
    createdAt: now,
    updatedAt: now,
    publishedPost: null,
    creativeType: input.creativeType ?? null,
    title: input.title ?? null,
    summary: input.summary ?? null,
    inspirations: input.inspirations ? [...input.inspirations] : null,
    audience: input.audience ?? null,
    hashtags: normaliseHashtags(input.hashtags) ?? null,
    callToAction: input.callToAction ? { ...input.callToAction } : null,
    callToActionLabel: input.callToActionLabel ?? input.callToAction?.label ?? null,
    callToActionUrl: input.callToActionUrl ?? input.callToAction?.url ?? null,
    responseBody: input.responseBody ?? null,
    delaySeconds: input.delaySeconds ?? null,
  }

  state.entries.push(entry)

  return cloneAutopost(entry)
}

const buildCampaignMetadata = (brief: AdCampaignBrief) => {
  const primarySignal = brief.emotionSignals[0] ?? { label: 'balanced', confidence: 0.5 }
  const mediaCandidate = brief.mediaUrl ?? brief.assetUrl ?? null
  const variantKey = randomUUID()

  const feedHints = {
    placement: 'feed-ad',
    isPromoted: true,
    campaignId: brief.campaignId,
    brand: brief.brandName,
    objective: brief.objective,
    variantKey,
    sentimentLabel: primarySignal.label,
    sentimentConfidence: primarySignal.confidence,
  }

  const adaptiveProfile = {
    brandVoice: brief.brandName,
    campaignObjective: brief.objective,
    emotionSignals: brief.emotionSignals,
  }

  return {
    autopost: {
      creativeType: brief.creativeType,
      title: brief.title,
      summary: brief.summary,
      body: brief.body,
      inspirations: brief.inspirations,
      hashtags: brief.hashtags,
      audience: brief.audience,
      callToAction: brief.callToAction,
      assetUrl: brief.assetUrl ?? mediaCandidate,
      posterUrl: ensurePosterUrl(brief.posterUrl ?? null, mediaCandidate),
      mediaUrl: mediaCandidate,
      durationSeconds: ensureDuration(brief.durationSeconds ?? null, mediaCandidate),
      scheduledAt: brief.scheduledAt,
      adaptiveProfile,
      feedHints,
      connectionDream: {
        tone: 'aspirational',
        highlightedEmotion: primarySignal.label,
        confidence: primarySignal.confidence,
      },
    },
    adCampaign: {
      id: brief.campaignId,
      brand: brief.brandName,
      objective: brief.objective,
      isPromoted: true,
      emotionSignals: brief.emotionSignals,
      callToAction: brief.callToAction ?? null,
    },
  }
}

const slugifyOwner = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || DEFAULT_OWNER

export const listAutoposts = ({ status, cursor, limit }: ListOptions) => {
  const state = getQueueState()
  const safeLimit = limit && limit > 0 ? Math.min(limit, 100) : PAGE_SIZE

  const sorted = [...state.entries].sort((a, b) => {
    const aTime = new Date(a.scheduledAt).getTime()
    const bTime = new Date(b.scheduledAt).getTime()
    if (Number.isFinite(aTime) && Number.isFinite(bTime) && bTime !== aTime) {
      return bTime - aTime
    }
    return b.id - a.id
  })

  const filtered = typeof status === 'string' ? sorted.filter((entry) => entry.status === status) : sorted

  let startIndex = 0
  const cursorId = toNumber(cursor)
  if (cursorId) {
    const cursorPosition = filtered.findIndex((entry) => entry.id === cursorId)
    if (cursorPosition >= 0) {
      startIndex = cursorPosition + 1
    }
  }

  const page = filtered.slice(startIndex, startIndex + safeLimit)
  const nextCursor = page.length === safeLimit && page[page.length - 1]
    ? String(page[page.length - 1]!.id)
    : null

  return {
    entries: page.map(cloneAutopost),
    nextCursor,
  }
}

export const createGenericAutopost = (input: CreateAutopostInput) => createAutopost(input)

export const createCampaignAutopost = (brief: AdCampaignBrief) => {
  const metadata = buildCampaignMetadata(brief)
  const primarySignal = brief.emotionSignals[0] ?? { label: 'confident', confidence: 0.7 }
  const ownerId = slugifyOwner(brief.brandName)

  return createAutopost({
    ownerId,
    body: brief.body,
    mood: primarySignal.label,
    emotionState: {
      aggregate: brief.emotionSignals,
      lastUpdated: new Date().toISOString(),
    },
    metadata,
    scheduledAt: brief.scheduledAt,
    assetUrl: brief.assetUrl ?? null,
    mediaUrl: brief.mediaUrl ?? null,
    posterUrl: brief.posterUrl ?? null,
    durationSeconds: brief.durationSeconds ?? null,
    creativeType: brief.creativeType,
    title: brief.title,
    summary: brief.summary,
    inspirations: brief.inspirations,
    audience: brief.audience ?? 'public',
    hashtags: brief.hashtags,
    callToAction: brief.callToAction ?? null,
    responseBody: brief.body,
    delaySeconds: brief.delaySeconds ?? null,
  })
}

export const releaseDueAutoposts = (releaseUntilIso: string) => {
  const state = getQueueState()
  const releaseUntil = new Date(releaseUntilIso).getTime()
  if (!Number.isFinite(releaseUntil)) {
    throw new Error('Invalid release timestamp')
  }

  const now = new Date().toISOString()
  const released: AutopostRecord[] = []

  state.entries.forEach((entry) => {
    if (entry.status !== 'scheduled') return
    const scheduledTime = new Date(entry.scheduledAt).getTime()
    if (!Number.isFinite(scheduledTime) || scheduledTime > releaseUntil) {
      return
    }
    entry.status = 'publishing'
    entry.updatedAt = now
    released.push(cloneAutopost(entry))
  })

  return released
}

const buildFeedMetadata = (entry: AutopostRecord) => {
  const baseMetadata = (cloneMetadata(entry.metadata) ?? {}) as Record<string, unknown>
  const autopostSection = isRecord(baseMetadata.autopost)
    ? ({ ...baseMetadata.autopost } as Record<string, unknown>)
    : {}

  const feedHintsSource = isRecord(autopostSection.feedHints)
    ? ({ ...(autopostSection.feedHints as Record<string, unknown>) } as Record<string, unknown>)
    : {}

  const rawIsPromoted = (feedHintsSource as { isPromoted?: unknown }).isPromoted
  const mergedFeedHints: Record<string, unknown> = {
    ...feedHintsSource,
    isPromoted: typeof rawIsPromoted === 'boolean' ? rawIsPromoted : Boolean(rawIsPromoted),
    autopostId: entry.id,
    status: entry.status,
  }

  return {
    ...baseMetadata,
    autopost: {
      ...autopostSection,
      feedHints: mergedFeedHints,
      status: entry.status,
    },
    feedHints: mergedFeedHints,
    autopostStatus: entry.status,
  }
}

export const publishAutopost = (id: number, publishedAtIso: string): PublishResult => {
  const state = getQueueState()
  const entry = state.entries.find((candidate) => candidate.id === id)
  if (!entry) {
    throw new Error(`Autopost ${id} not found`)
  }

  if (entry.status === 'published' && entry.publishedPost) {
    return {
      entry: cloneAutopost(entry),
      feedPost: cloneFeedPost(entry.publishedPost),
    }
  }

  const publishedAt = new Date(publishedAtIso)
  if (Number.isNaN(publishedAt.getTime())) {
    throw new Error('Invalid publishedAt timestamp')
  }

  const now = new Date().toISOString()
  const mediaCandidate = entry.mediaUrl ?? entry.assetUrl ?? null
  const feedPost: FeedPostRecord = {
    id: state.feedSequence++,
    authorId: entry.ownerId,
    body: entry.responseBody ?? entry.body,
    mood: entry.mood ?? null,
    emotionState: entry.emotionState ? { ...entry.emotionState } : null,
    mediaUrl: mediaCandidate,
    posterUrl: ensurePosterUrl(entry.posterUrl ?? null, mediaCandidate),
    durationSeconds: ensureDuration(entry.durationSeconds ?? null, mediaCandidate),
    metadata: buildFeedMetadata(entry),
    publishedAt: publishedAt.toISOString(),
    createdAt: publishedAt.toISOString(),
  }

  entry.status = 'published'
  entry.publishedPostId = feedPost.id
  entry.publishedPost = feedPost
  entry.updatedAt = now

  state.feedPosts.push(feedPost)

  return {
    entry: cloneAutopost(entry),
    feedPost: cloneFeedPost(feedPost),
  }
}

export const getAutopost = (id: number): AutopostRecord | null => {
  const state = getQueueState()
  const entry = state.entries.find((candidate) => candidate.id === id)
  return entry ? cloneAutopost(entry) : null
}

export const getFeedPosts = () => {
  const state = getQueueState()
  return state.feedPosts.map(cloneFeedPost)
}

export const resetAutopostQueue = () => {
  const state = getQueueState()
  state.entries = []
  state.feedPosts = []
  state.autopostSequence = 1
  state.feedSequence = 1
}
