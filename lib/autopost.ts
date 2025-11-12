import type { AutopostFeedHints, AutopostStatus } from '@/types/business'

export interface AutopostCallToAction {
  label?: string | null
  url?: string | null
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
  feedHints?: unknown
  callToAction?: AutopostCallToAction | null
  assetUrl?: string | null
  posterUrl?: string | null
  mediaUrl?: string | null
  durationSeconds?: number | null
  scheduledAt?: string | null
  connectionDream?: Record<string, unknown> | null
}

const hasOwn = (object: Record<string, unknown>, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(object, key)

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const toStringOrNull = (value: unknown): string | null => {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return null
}

const toNumberOrNull = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => toStringOrNull(entry))
      .filter((entry): entry is string => Boolean(entry && entry.trim().length > 0))
      .map((entry) => entry.trim())
  }

  const fallback = toStringOrNull(value)
  if (!fallback) return []
  return fallback
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
}

const toOptionalStringArray = (value: unknown): string[] | null => {
  const items = toStringArray(value)
  return items.length > 0 ? items : null
}

const findValue = (source: Record<string, unknown>, keys: string[]): unknown => {
  for (const key of keys) {
    if (hasOwn(source, key)) {
      return source[key]
    }
  }
  return undefined
}

const findRecord = (source: Record<string, unknown>, keys: string[]): Record<string, unknown> | null => {
  for (const key of keys) {
    const value = findValue(source, [key])
    if (isRecord(value)) {
      return value
    }
  }
  return null
}

const findString = (source: Record<string, unknown>, keys: string[]): string | null => {
  const value = findValue(source, keys)
  return toStringOrNull(value)
}

const findNumber = (source: Record<string, unknown>, keys: string[]): number | null => {
  const value = findValue(source, keys)
  return toNumberOrNull(value)
}

const parseBoolean = (value: unknown): boolean | null => {
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true
    if (value.toLowerCase() === 'false') return false
  }
  return null
}

export const parseFeedHints = (value: unknown): AutopostFeedHints | null => {
  if (!isRecord(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  const categories = toOptionalStringArray(record.categories ?? record.categoryTags)
  const relationalHooks = toOptionalStringArray(record.relationalHooks ?? record.relational_hooks)
  const targetPersonas = toOptionalStringArray(record.targetPersonas ?? record.target_personas)

  const placement = toStringOrNull(record.placement)
  const campaignId =
    toStringOrNull(record.campaignId) ?? toStringOrNull(record.campaign_id)
  const brand = toStringOrNull(record.brand)
  const objective = toStringOrNull(record.objective)
  const variantKey = toStringOrNull(record.variantKey)
  const creativeMedium =
    toStringOrNull(record.creativeMedium) ?? toStringOrNull(record.creative_medium)
  const sentimentLabel = toStringOrNull(record.sentimentLabel)
  const sentimentConfidence = toNumberOrNull(record.sentimentConfidence)
  const autopostId = toNumberOrNull(record.autopostId ?? record.autopost_id)
  const statusRaw = toStringOrNull(record.status)
  const status = statusRaw ? (statusRaw as AutopostStatus) : undefined
  const isPromoted = parseBoolean(record.isPromoted ?? record.is_promoted)

  return {
    placement,
    campaignId,
    brand,
    objective,
    variantKey,
    creativeMedium,
    sentimentLabel,
    sentimentConfidence: sentimentConfidence ?? undefined,
    autopostId: autopostId ?? undefined,
    status,
    isPromoted: isPromoted ?? undefined,
    categories,
    relationalHooks,
    targetPersonas,
  }
}

export const sanitizeHashtagInput = (value: string): string[] => {
  const seen = new Set<string>()
  return value
    .split(/[#,\s,]+/)
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.length > 0)
    .map((entry) => `#${entry.replace(/[^a-z0-9]/gi, '')}`)
    .filter((entry) => entry.length > 1)
    .filter((entry) => {
      if (seen.has(entry)) {
        return false
      }
      seen.add(entry)
      return true
    })
}

export const extractAutopostDetails = (metadata: unknown): AutopostDetails | null => {
  if (!metadata) {
    return null
  }

  const container = isRecord(metadata) ? metadata : null
  if (!container) {
    return null
  }

  const candidate =
    findRecord(container, ['autopost', 'creative', 'payload', 'entry']) ?? container

  const type = findString(candidate, ['type', 'contentType', 'metadataType']) ?? findString(container, ['type'])
  const creativeType = findString(candidate, ['creativeType', 'creative_type', 'type'])
  const title = findString(candidate, ['title', 'headline'])
  const summary = findString(candidate, ['summary', 'body', 'description'])
  const body = findString(candidate, ['body', 'message', 'text'])
  const audience = findString(candidate, ['audience', 'visibility'])
  const assetUrl = findString(candidate, ['assetUrl', 'asset_url', 'mediaUrl', 'media_url'])
  const posterUrl = findString(candidate, ['posterUrl', 'poster_url', 'thumbnail'])
  const mediaUrl = findString(candidate, ['mediaUrl', 'media_url'])
  const durationSeconds = findNumber(candidate, ['durationSeconds', 'duration_seconds'])
  const scheduledAt = findString(candidate, ['scheduledAt', 'scheduled_at'])

  const inspirations = toStringArray(findValue(candidate, ['inspirations', 'inspiration_sources']))
  const hashtags = toStringArray(findValue(candidate, ['hashtags', 'tags']))

  const adaptiveProfile = findRecord(candidate, ['adaptiveProfile', 'adaptive_profile'])
  const feedHintsValue =
    findValue(candidate, ['feedHints', 'feed_hints']) ?? findValue(container, ['feedHints', 'feed_hints'])
  const feedHints = parseFeedHints(feedHintsValue)
  const callToActionRecord = findRecord(candidate, ['callToAction', 'call_to_action'])
  const callToActionLabel =
    findString(candidate, ['callToActionLabel', 'ctaLabel']) ??
    findString(callToActionRecord ?? {}, ['label', 'text'])
  const callToActionUrl =
    findString(candidate, ['callToActionUrl', 'ctaUrl']) ??
    findString(callToActionRecord ?? {}, ['url', 'href'])
  const callToAction =
    callToActionLabel || callToActionUrl
      ? {
          label: callToActionLabel,
          url: callToActionUrl,
        }
      : callToActionRecord
        ? {
            label: findString(callToActionRecord, ['label', 'text']),
            url: findString(callToActionRecord, ['url', 'href']),
          }
        : null

  const connectionDream = findRecord(candidate, ['connectionDream', 'connection_dream'])

  return {
    type,
    creativeType,
    title,
    summary,
    body,
    inspirations,
    hashtags,
    audience,
    adaptiveProfile: adaptiveProfile ?? null,
    feedHints: feedHints ?? null,
    callToAction,
    assetUrl,
    posterUrl,
    mediaUrl,
    durationSeconds,
    scheduledAt,
    connectionDream: connectionDream ?? null,
  }
}
