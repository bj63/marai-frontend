import type {
  AutopostCallToAction,
  AutopostDetails,
  AutopostFeedHints,
  AutopostQueueEntry,
  SentimentSignal,
} from '@/types/business'

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

export const pickRecord = (
  source: Record<string, unknown> | null | undefined,
  ...keys: Array<string | string[]>
): Record<string, unknown> | null => {
  if (!source) return null
  for (const key of keys.flat()) {
    const candidate = source[key]
    if (isRecord(candidate)) {
      return candidate
    }
  }
  return null
}

export const pickString = (
  source: Record<string, unknown> | null | undefined,
  ...keys: Array<string | string[]>
): string | null => {
  if (!source) return null
  for (const key of keys.flat()) {
    const candidate = source[key]
    if (typeof candidate === 'string') {
      const trimmed = candidate.trim()
      if (trimmed.length > 0) {
        return trimmed
      }
    }
  }
  return null
}

export const pickNumber = (
  source: Record<string, unknown> | null | undefined,
  ...keys: Array<string | string[]>
): number | null => {
  if (!source) return null
  for (const key of keys.flat()) {
    const candidate = source[key]
    if (typeof candidate === 'number' && Number.isFinite(candidate)) {
      return candidate
    }
    if (typeof candidate === 'string') {
      const parsed = Number(candidate)
      if (!Number.isNaN(parsed)) {
        return parsed
      }
    }
  }
  return null
}

const toStringArray = (value: unknown): string[] => {
  if (!value) return []
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter((entry) => entry.length > 0)
  }
  if (typeof value === 'string') {
    return value
      .split(/[#,\n,]+/)
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)
  }
  return []
}

export const pickStringArray = (
  source: Record<string, unknown> | null | undefined,
  ...keys: Array<string | string[]>
): string[] => {
  if (!source) return []
  for (const key of keys.flat()) {
    if (key in source) {
      const values = toStringArray(source[key])
      if (values.length > 0) {
        return values
      }
    }
  }
  return []
}

export const dedupe = (values: string[]): string[] => {
  const seen = new Set<string>()
  return values.filter((value) => {
    const trimmed = value.trim()
    if (!trimmed) return false
    const key = trimmed.toLowerCase()
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

export const normaliseHashtags = (values: string[]): string[] =>
  dedupe(
    values
      .map((value) => value.trim())
      .filter((value) => value.length > 0)
      .map((value) => (value.startsWith('#') ? value : `#${value}`)),
  )

export const collectHashtags = (entry: AutopostQueueEntry): string[] => {
  const detailsHashtags = entry.details?.hashtags ?? []
  const entryHashtags = entry.hashtags ?? []
  return normaliseHashtags([...detailsHashtags, ...entryHashtags])
}

export const collectInspirations = (details: AutopostDetails | null): string[] =>
  dedupe(details?.inspirations ?? [])

export const getPrimarySentiment = (entry: AutopostQueueEntry): SentimentSignal | null =>
  entry.sentimentSignals[0] ?? null

export const getCallToAction = (
  entry: AutopostQueueEntry,
  details: AutopostDetails | null,
): AutopostCallToAction | null => {
  const detailCta = details?.callToAction
  if (detailCta && (detailCta.label || detailCta.url)) {
    return detailCta
  }
  if (entry.callToAction && (entry.callToAction.label || entry.callToAction.url)) {
    return entry.callToAction
  }
  if (entry.callToActionLabel || entry.callToActionUrl) {
    return {
      label: entry.callToActionLabel,
      url: entry.callToActionUrl,
    }
  }
  return null
}

export const mergeFeedHints = (
  entry: AutopostQueueEntry,
  details: AutopostDetails | null,
): AutopostFeedHints | null => {
  if (details?.feedHints) {
    return details.feedHints
  }
  if (entry.feedHints) {
    return entry.feedHints
  }
  return null
}

export const isSafeExternalUrl = (url?: string | null): url is string => {
  if (!url || typeof url !== 'string') {
    return false
  }
  try {
    const parsed = new URL(url.trim())
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch (error) {
    return false
  }
}
