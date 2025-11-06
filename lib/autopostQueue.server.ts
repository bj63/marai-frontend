import { randomUUID } from 'node:crypto'

export type AutopostStatus = 'scheduled' | 'publishing' | 'published'
export type AutopostAudience = 'public' | 'friends' | 'private'

export interface EmotionSignal {
  label: string
  confidence: number
}

export interface AutopostCallToAction {
  label?: string | null
  url?: string | null
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

interface PublishResult {
  entry: AutopostRecord
  feedPost: FeedPostRecord
}

const DEFAULT_OWNER = 'marai-business'
const PAGE_SIZE = 25

const autopostQueue: AutopostRecord[] = []
const feedPosts: FeedPostRecord[] = []

let autopostSequence = 1
let feedSequence = 1

const toNumber = (value: string | null | undefined): number | null => {
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const normaliseArray = (values: string[] | null | undefined): string[] | null => {
  if (!values || values.length === 0) {
    return null
  }
  const seen = new Set<string>()
  const result: string[] = []
  values.forEach((value) => {
    const trimmed = value.trim()
    if (!trimmed) return
    const normalised = trimmed.startsWith('#') ? trimmed : `#${trimmed}`
    if (seen.has(normalised)) return
    seen.add(normalised)
    result.push(normalised)
  })
  return result.length > 0 ? result : null
}

const ensurePosterUrl = (posterUrl: string | null | undefined, mediaUrl: string | null | undefined) => {
  if (posterUrl && posterUrl.trim().length > 0) {
    return posterUrl
  }
  if (mediaUrl && mediaUrl.trim().length > 0) {
    return mediaUrl
  }
  return null
}

const ensureDuration = (durationSeconds: number | null | undefined) => {
  if (durationSeconds && durationSeconds > 0) {
    return durationSeconds
  }
  return 30
}

const cloneMetadata = (metadata: Record<string, unknown> | null | undefined) => {
  if (!metadata) return null
  return JSON.parse(JSON.stringify(metadata))
}

export const listAutoposts = ({ status, cursor, limit }: ListOptions) => {
  const safeLimit = limit && limit > 0 ? Math.min(limit, 100) : PAGE_SIZE
  const sorted = [...autopostQueue].sort((a, b) => b.id - a.id)
  const filtered = typeof status === 'string'
    ? sorted.filter((entry) => entry.status === status)
    : sorted

  let startIndex = 0
  const cursorId = toNumber(cursor)
  if (cursorId) {
    const cursorPosition = filtered.findIndex((entry) => entry.id === cursorId)
    if (cursorPosition >= 0) {
      startIndex = cursorPosition + 1
    }
  }

  const page = filtered.slice(startIndex, startIndex + safeLimit)
  const nextCursor = page.length === safeLimit ? String(page[page.length - 1]?.id ?? '') : null

  return {
    entries: page,
    nextCursor,
  }
}

const createAutopost = (input: CreateAutopostInput): AutopostRecord => {
  const now = new Date().toISOString()
  const entry: AutopostRecord = {
    id: autopostSequence++,
    ownerId: input.ownerId ?? DEFAULT_OWNER,
    body: input.body,
    mood: input.mood ?? null,
    emotionState: input.emotionState ?? null,
    assetUrl: input.assetUrl ?? null,
    mediaUrl: input.mediaUrl ?? null,
    posterUrl: ensurePosterUrl(input.posterUrl, input.mediaUrl ?? input.assetUrl ?? null),
    durationSeconds: ensureDuration(input.durationSeconds),
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
    inspirations: input.inspirations ?? null,
    audience: input.audience ?? null,
    hashtags: normaliseArray(input.hashtags) ?? null,
    callToAction: input.callToAction ?? null,
    callToActionLabel: input.callToActionLabel ?? input.callToAction?.label ?? null,
    callToActionUrl: input.callToActionUrl ?? input.callToAction?.url ?? null,
    responseBody: input.responseBody ?? null,
    delaySeconds: input.delaySeconds ?? null,
  }

  autopostQueue.push(entry)
  return entry
}

interface AdCampaignBrief {
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

const buildCampaignMetadata = (brief: AdCampaignBrief) => {
  const sentiment = brief.emotionSignals[0] ?? { label: 'balanced', confidence: 0.5 }
  const feedHints = {
    placement: 'feed-ad',
    isPromoted: true,
    campaignId: brief.campaignId,
    brand: brief.brandName,
    objective: brief.objective,
    sentimentLabel: sentiment.label,
    sentimentConfidence: sentiment.confidence,
    variantKey: randomUUID(),
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
      assetUrl: brief.assetUrl ?? brief.mediaUrl ?? null,
      posterUrl: ensurePosterUrl(brief.posterUrl, brief.mediaUrl ?? brief.assetUrl ?? null),
      mediaUrl: brief.mediaUrl ?? brief.assetUrl ?? null,
      durationSeconds: ensureDuration(brief.durationSeconds),
      scheduledAt: brief.scheduledAt,
      adaptiveProfile,
      feedHints,
      connectionDream: {
        tone: 'aspirational',
        highlightedEmotion: sentiment.label,
        confidence: sentiment.confidence,
      },
    },
    adCampaign: {
      id: brief.campaignId,
      brand: brief.brandName,
      objective: brief.objective,
      isPromoted: true,
      emotionSignals: brief.emotionSignals,
      callToAction: brief.callToAction,
    },
  }
}

export const createCampaignAutopost = (brief: AdCampaignBrief) => {
  const metadata = buildCampaignMetadata(brief)
  const entry = createAutopost({
    ownerId: brief.brandName.toLowerCase().replace(/\s+/g, '-'),
    body: brief.summary,
    mood: brief.emotionSignals[0]?.label ?? 'confident',
    emotionState: {
      aggregate: brief.emotionSignals,
      lastUpdated: new Date().toISOString(),
    },
    metadata,
    scheduledAt: brief.scheduledAt,
    assetUrl: brief.assetUrl ?? undefined,
    mediaUrl: brief.mediaUrl ?? undefined,
    posterUrl: brief.posterUrl ?? undefined,
    durationSeconds: ensureDuration(brief.durationSeconds),
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

  return entry
}

export const createGenericAutopost = (input: CreateAutopostInput) => createAutopost(input)

export const releaseDueAutoposts = (releaseUntilIso: string) => {
  const releaseUntil = new Date(releaseUntilIso).getTime()
  if (!Number.isFinite(releaseUntil)) {
    throw new Error('Invalid release timestamp')
  }

  const now = new Date().toISOString()
  const released: AutopostRecord[] = []
  autopostQueue.forEach((entry) => {
    if (entry.status !== 'scheduled') return
    const scheduledTime = new Date(entry.scheduledAt).getTime()
    if (!Number.isFinite(scheduledTime)) return
    if (scheduledTime > releaseUntil) return
    entry.status = 'publishing'
    entry.updatedAt = now
    released.push(entry)
  })

  return released
}

const buildFeedMetadata = (entry: AutopostRecord) => {
  const baseMetadata = cloneMetadata(entry.metadata) ?? {}
  const autopostSectionRaw = (baseMetadata as Record<string, unknown>)['autopost']
  const autopostSection =
    autopostSectionRaw && typeof autopostSectionRaw === 'object' && !Array.isArray(autopostSectionRaw)
      ? (autopostSectionRaw as Record<string, unknown>)
      : undefined
  const feedHintsRaw = autopostSection ? autopostSection['feedHints'] : undefined
  const feedHints =
    feedHintsRaw && typeof feedHintsRaw === 'object' && !Array.isArray(feedHintsRaw)
      ? (feedHintsRaw as Record<string, unknown>)
      : {}

  return {
    ...(baseMetadata as Record<string, unknown>),
    feedHints: {
      ...feedHints,
      isPromoted: true,
      autopostId: entry.id,
      status: entry.status,
    },
    autopostStatus: entry.status,
  }
}

export const publishAutopost = (id: number, publishedAtIso: string): PublishResult => {
  const entry = autopostQueue.find((candidate) => candidate.id === id)
  if (!entry) {
    throw new Error(`Autopost ${id} not found`)
  }

  if (entry.status === 'published') {
    return {
      entry,
      feedPost: entry.publishedPost as FeedPostRecord,
    }
  }

  const publishedAt = new Date(publishedAtIso)
  if (Number.isNaN(publishedAt.getTime())) {
    throw new Error('Invalid publishedAt timestamp')
  }

  const post: FeedPostRecord = {
    id: feedSequence++,
    authorId: entry.ownerId,
    body: entry.responseBody ?? entry.body,
    mood: entry.mood ?? null,
    emotionState: entry.emotionState ?? null,
    mediaUrl: entry.mediaUrl ?? entry.assetUrl ?? null,
    posterUrl: entry.posterUrl ?? null,
    durationSeconds: entry.durationSeconds ?? null,
    metadata: buildFeedMetadata(entry),
    publishedAt: publishedAt.toISOString(),
    createdAt: publishedAt.toISOString(),
  }

  entry.status = 'published'
  entry.publishedPostId = post.id
  entry.publishedPost = post
  entry.updatedAt = new Date().toISOString()

  feedPosts.push(post)

  return {
    entry,
    feedPost: post,
  }
}

export const getFeedPosts = () => [...feedPosts]
