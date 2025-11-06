'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { extractAutopostDetails, sanitizeHashtagInput, type AutopostDetails } from '@/lib/autopost'

export interface FeedPost {
  id: number
  authorId: string
  body: string
  mood?: string | null
  emotionState?: Record<string, unknown> | null
  mediaUrl?: string | null
  posterUrl?: string | null
  durationSeconds?: number | null
  metadata?: Record<string, unknown> | null
  publishedAt?: string | null
  createdAt: string
  authorProfile?: Record<string, unknown> | null
}

export type AutopostStatus = 'scheduled' | 'publishing' | 'published'
export type AutopostAudience = 'public' | 'friends' | 'private'
export type CreativeType = 'poem' | 'story' | 'dreamVideo' | 'imageArt'

export interface AutopostCallToAction {
  label?: string | null
  url?: string | null
}

export interface AutopostEntry {
  id: number
  ownerId: string
  body: string
  mood?: string | null
  emotionState?: Record<string, unknown> | null
  assetUrl?: string | null
  mediaUrl?: string | null
  posterUrl?: string | null
  durationSeconds?: number | null
  metadata?: Record<string, unknown> | AutopostDetails | null
  status: AutopostStatus
  scheduledAt: string
  publishedPostId?: number | null
  createdAt: string
  updatedAt: string
  publishedPost?: FeedPost | null
  creativeType?: CreativeType | null
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

export interface AutopostPanelProps {
  apiBaseUrl: string
  authToken: string
  statusFilter?: AutopostStatus
}

const DEFAULT_METADATA = '{\n  "type": "custom"\n}'

const formatDateTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleString()
  } catch (error) {
    return iso
  }
}

const formatLocalInput = (date: Date) => {
  const pad = (value: number) => `${value}`.padStart(2, '0')
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const defaultScheduledLocal = () => formatLocalInput(new Date(Date.now() + 30 * 60 * 1000))
const defaultReleaseLocal = () => formatLocalInput(new Date())

const buildHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
})

const toTrimmedString = (value: unknown): string | null =>
  typeof value === 'string' ? value.trim() : null

const dedupeStrings = (values: (string | null | undefined)[]): string[] => {
  const seen = new Set<string>()
  const result: string[] = []
  values.forEach((value) => {
    if (typeof value !== 'string') return
    const trimmed = value.trim()
    if (!trimmed) return
    if (seen.has(trimmed)) return
    seen.add(trimmed)
    result.push(trimmed)
  })
  return result
}

const parseInspirations = (value: string): string[] =>
  dedupeStrings(value.split(/[\n,]+/))

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null

const coerceAutopostEntry = (value: unknown): AutopostEntry | null => {
  const record = asRecord(value)
  if (!record) return null
  if (typeof record.id !== 'number') return null
  return record as AutopostEntry
}

const unwrapAutopostPayload = (payload: unknown): AutopostEntry | null => {
  if (Array.isArray(payload)) {
    for (const entry of payload) {
      const candidate = coerceAutopostEntry(entry)
      if (candidate) return candidate
    }
    return null
  }

  const direct = coerceAutopostEntry(payload)
  if (direct) return direct

  const record = asRecord(payload)
  if (!record) return null

  const keys = ['autopost', 'entry', 'data', 'result', 'payload']
  for (const key of keys) {
    if (key in record) {
      const candidate = coerceAutopostEntry(record[key])
      if (candidate) return candidate
    }
  }

  const autoposts = record.autoposts
  if (Array.isArray(autoposts)) {
    for (const entry of autoposts) {
      const candidate = coerceAutopostEntry(entry)
      if (candidate) return candidate
    }
  }

  return null
}

const normaliseHashtag = (value: string): string => {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`
}

const isSafeExternalUrl = (url?: string | null): url is string => {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch (error) {
    return false
  }
}

const formatJson = (value: unknown): string | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value, null, 2)
  } catch (error) {
    return String(value)
  }
}

const mergeAutopostDetails = (entry: AutopostEntry): AutopostDetails | null => {
  const metadataDetails = extractAutopostDetails(entry.metadata)
  const inspirations = dedupeStrings([
    ...(metadataDetails?.inspirations ?? []),
    ...(entry.inspirations ?? []),
  ])
  const hashtags = dedupeStrings([
    ...(metadataDetails?.hashtags ?? []),
    ...(entry.hashtags ?? []),
  ])
  const callToActionCandidate =
    entry.callToAction ??
    (entry.callToActionLabel || entry.callToActionUrl
      ? {
          label: toTrimmedString(entry.callToActionLabel),
          url: toTrimmedString(entry.callToActionUrl),
        }
      : null) ??
    metadataDetails?.callToAction ??
    null

  const callToAction = callToActionCandidate
    ? {
        label: toTrimmedString(callToActionCandidate.label),
        url: toTrimmedString(callToActionCandidate.url),
      }
    : null

  const body =
    toTrimmedString(entry.responseBody) ??
    toTrimmedString(entry.body) ??
    metadataDetails?.body ??
    null

  return {
    creativeType: entry.creativeType ?? metadataDetails?.creativeType ?? null,
    title: entry.title ?? metadataDetails?.title ?? null,
    summary: entry.summary ?? metadataDetails?.summary ?? null,
    body,
    inspirations,
    hashtags,
    audience: entry.audience ?? metadataDetails?.audience ?? null,
    adaptiveProfile: metadataDetails?.adaptiveProfile ?? null,
    feedHints: metadataDetails?.feedHints ?? null,
    callToAction,
    assetUrl:
      entry.assetUrl ??
      entry.mediaUrl ??
      metadataDetails?.assetUrl ??
      metadataDetails?.mediaUrl ??
      null,
    posterUrl: entry.posterUrl ?? metadataDetails?.posterUrl ?? null,
    mediaUrl:
      entry.mediaUrl ??
      metadataDetails?.mediaUrl ??
      metadataDetails?.assetUrl ??
      null,
    durationSeconds: entry.durationSeconds ?? metadataDetails?.durationSeconds ?? null,
    scheduledAt: metadataDetails?.scheduledAt ?? entry.scheduledAt ?? null,
    connectionDream: metadataDetails?.connectionDream ?? null,
  }
}

interface AutopostMetadataViewProps {
  entry: AutopostEntry
}

function AutopostMetadataView({ entry }: AutopostMetadataViewProps) {
  const details = mergeAutopostDetails(entry)
  const rawMetadata = formatJson(entry.metadata)

  if (!details && !rawMetadata) {
    return null
  }

  const hashtags = (details?.hashtags ?? []).map(normaliseHashtag).filter(Boolean)
  const inspirations = details?.inspirations ?? []
  const callToActionLabel = toTrimmedString(details?.callToAction?.label)
  const callToActionUrl = toTrimmedString(details?.callToAction?.url)
  const adaptiveProfile = formatJson(details?.adaptiveProfile)
  const feedHints = formatJson(details?.feedHints)
  const connectionDream = formatJson(details?.connectionDream)
  const primaryAssets = dedupeStrings([details?.assetUrl ?? null, details?.mediaUrl ?? null]).filter((href) =>
    isSafeExternalUrl(href),
  )
  const posterUrl = details?.posterUrl ?? null
  const scheduledAtOverride =
    details?.scheduledAt && details.scheduledAt !== entry.scheduledAt ? details.scheduledAt : null
  const durationSeconds = details?.durationSeconds ?? null
  const audience = details?.audience ?? null

  return (
    <div className="flex flex-col gap-3 text-sm text-brand-mist">
      {details?.creativeType ? (
        <span className="text-[0.65rem] uppercase tracking-[0.32em] text-brand-mist/60">
          Creative type: {details.creativeType}
        </span>
      ) : null}
      {details?.title ? <p className="text-base font-semibold text-white">{details.title}</p> : null}
      {details?.summary ? (
        <p className="leading-relaxed text-brand-mist/90">{details.summary}</p>
      ) : null}
      {details?.body && details.body !== details.summary ? (
        <p className="leading-relaxed text-brand-mist">{details.body}</p>
      ) : null}
      {scheduledAtOverride ? (
        <p>
          Normalized schedule:{' '}
          <span className="text-brand-magnolia">{formatDateTime(scheduledAtOverride)}</span>
        </p>
      ) : null}
      {audience ? (
        <p>
          Audience target: <span className="text-brand-magnolia">{audience}</span>
        </p>
      ) : null}
      {durationSeconds ? (
        <p>
          Duration: <span className="text-brand-magnolia">{durationSeconds} seconds</span>
        </p>
      ) : null}
      {inspirations.length > 0 ? (
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.32em] text-brand-mist/60">Inspirations</p>
          <ul className="mt-1 flex flex-wrap gap-2">
            {inspirations.map((item) => (
              <li key={item} className="rounded-full border border-white/10 bg-[#101737]/80 px-3 py-1 text-brand-mist">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {hashtags.length > 0 ? (
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.32em] text-brand-mist/60">Hashtags</p>
          <div className="mt-1 flex flex-wrap gap-2 text-brand-magnolia">
            {hashtags.map((tag) => (
              <span key={tag} className="rounded-full border border-white/10 bg-[#101737]/80 px-3 py-1">
                {tag}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      {primaryAssets.length > 0 ? (
        <div className="space-y-1">
          <p className="text-[0.7rem] uppercase tracking-[0.32em] text-brand-mist/60">Creative asset</p>
          {primaryAssets.map((href) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="break-words text-brand-magnolia underline"
            >
              {href}
            </a>
          ))}
        </div>
      ) : null}
      {posterUrl && isSafeExternalUrl(posterUrl) ? (
        <div className="space-y-1">
          <p className="text-[0.7rem] uppercase tracking-[0.32em] text-brand-mist/60">Poster</p>
          <a href={posterUrl} target="_blank" rel="noopener noreferrer" className="break-words text-brand-magnolia underline">
            {posterUrl}
          </a>
        </div>
      ) : null}
      {callToActionLabel || callToActionUrl ? (
        <p>
          Call to action:{' '}
          <span className="text-brand-magnolia">{callToActionLabel ?? 'Label not provided'}</span>
          {callToActionUrl && isSafeExternalUrl(callToActionUrl) ? (
            <>
              {' '}
              <a
                href={callToActionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-magnolia underline"
              >
                {callToActionUrl}
              </a>
            </>
          ) : null}
        </p>
      ) : null}
      {adaptiveProfile ? (
        <div className="space-y-1">
          <p className="text-[0.7rem] uppercase tracking-[0.32em] text-brand-mist/60">Adaptive profile</p>
          <pre className="max-h-48 overflow-auto rounded-xl border border-white/10 bg-[#0b1126]/80 p-3 text-xs text-brand-mist/80">
            {adaptiveProfile}
          </pre>
        </div>
      ) : null}
      {feedHints ? (
        <div className="space-y-1">
          <p className="text-[0.7rem] uppercase tracking-[0.32em] text-brand-mist/60">Feed hints</p>
          <pre className="max-h-40 overflow-auto rounded-xl border border-white/10 bg-[#0b1126]/80 p-3 text-xs text-brand-mist/80">
            {feedHints}
          </pre>
        </div>
      ) : null}
      {connectionDream ? (
        <div className="space-y-1">
          <p className="text-[0.7rem] uppercase tracking-[0.32em] text-brand-mist/60">Connection dream</p>
          <pre className="max-h-40 overflow-auto rounded-xl border border-white/10 bg-[#0b1126]/80 p-3 text-xs text-brand-mist/80">
            {connectionDream}
          </pre>
        </div>
      ) : null}
      {rawMetadata ? (
        <details className="rounded-xl border border-white/10 bg-[#0b1126]/60 p-3 text-xs text-brand-mist/80">
          <summary className="cursor-pointer text-sm font-semibold text-white">Raw metadata</summary>
          <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap">{rawMetadata}</pre>
        </details>
      ) : null}
    </div>
  )
}

const STATUS_OPTIONS: Array<{ label: string; value: AutopostStatus | 'all' }> = [
  { label: 'All statuses', value: 'all' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Publishing', value: 'publishing' },
  { label: 'Published', value: 'published' },
]

export function AutopostPanel({ apiBaseUrl, authToken, statusFilter }: AutopostPanelProps) {
  const [queue, setQueue] = useState<AutopostEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)

  const [body, setBody] = useState('')
  const [mood, setMood] = useState('dreamy')
  const [audience, setAudience] = useState<AutopostAudience>('public')
  const [mediaUrl, setMediaUrl] = useState('')
  const [posterUrl, setPosterUrl] = useState('')
  const [hashtagsInput, setHashtagsInput] = useState('')
  const [callToActionLabel, setCallToActionLabel] = useState('')
  const [callToActionUrl, setCallToActionUrl] = useState('')
  const [scheduledLocal, setScheduledLocal] = useState(defaultScheduledLocal())
  const [metadataRaw, setMetadataRaw] = useState(DEFAULT_METADATA)
  const [submitting, setSubmitting] = useState(false)

  const [creativeType, setCreativeType] = useState<CreativeType>('poem')
  const [creativeTitle, setCreativeTitle] = useState('')
  const [creativeSummary, setCreativeSummary] = useState('')
  const [creativeInspirations, setCreativeInspirations] = useState('')
  const [creativeDelaySeconds, setCreativeDelaySeconds] = useState('3600')
  const [creativeAudience, setCreativeAudience] = useState<AutopostAudience>('public')
  const [creativeHashtagsInput, setCreativeHashtagsInput] = useState('')
  const [creativeAssetUrl, setCreativeAssetUrl] = useState('')
  const [creativePosterUrl, setCreativePosterUrl] = useState('')
  const [creativeDurationSeconds, setCreativeDurationSeconds] = useState('')
  const [creativeCallToActionLabel, setCreativeCallToActionLabel] = useState('')
  const [creativeCallToActionUrl, setCreativeCallToActionUrl] = useState('')
  const [creativeSubmitting, setCreativeSubmitting] = useState(false)
  const [creativeResponse, setCreativeResponse] = useState<AutopostEntry | null>(null)

  const [releaseUntilLocal, setReleaseUntilLocal] = useState(defaultReleaseLocal())
  const [releasing, setReleasing] = useState(false)

  const initialStatus = statusFilter ?? 'all'
  const [statusOption, setStatusOption] = useState<AutopostStatus | 'all'>(initialStatus)
  const [nextCursor, setNextCursor] = useState<string | null>(null)

  const headers = useMemo(() => buildHeaders(authToken), [authToken])
  const creativeResponseDetails = creativeResponse ? mergeAutopostDetails(creativeResponse) : null

  useEffect(() => {
    if (statusFilter && statusFilter !== statusOption) {
      setStatusOption(statusFilter)
    }
  }, [statusFilter, statusOption])

  const loadQueue = useCallback(
    async (options?: { cursor?: string }) => {
      const cursor = options?.cursor
      const isLoadMore = Boolean(cursor)
      if (isLoadMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      if (!isLoadMore) {
        setInfoMessage(null)
      }
      setError(null)

      try {
        const params = new URLSearchParams()
        if (statusOption !== 'all') {
          params.set('status', statusOption)
        }
        if (cursor) {
          params.set('cursor', cursor)
        }

        const response = await fetch(
          `${apiBaseUrl}/api/autoposts${params.toString() ? `?${params.toString()}` : ''}`,
          {
            method: 'GET',
            headers,
          },
        )
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(payload.error || `Failed to load autoposts (${response.status})`)
        }

        const entries: AutopostEntry[] = Array.isArray(payload.autoposts) ? payload.autoposts : []
        setQueue((previous) => (isLoadMore ? [...previous, ...entries] : entries))
        const next = typeof payload.nextCursor === 'string' && payload.nextCursor.length > 0 ? payload.nextCursor : null
        setNextCursor(next)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unexpected error loading autoposts')
        if (!options?.cursor) {
          setQueue([])
          setNextCursor(null)
        }
      } finally {
        if (options?.cursor) {
          setLoadingMore(false)
        } else {
          setLoading(false)
        }
      }
    },
    [apiBaseUrl, headers, statusOption],
  )

  useEffect(() => {
    void loadQueue()
  }, [loadQueue])

  const handleStatusChange = (value: AutopostStatus | 'all') => {
    setStatusOption(value)
    setQueue([])
    setNextCursor(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!body.trim()) {
      setError('Please provide a post body before scheduling.')
      return
    }

    const scheduledDate = new Date(scheduledLocal)
    if (Number.isNaN(scheduledDate.getTime())) {
      setError('Please select a valid schedule time.')
      return
    }

    let metadata: Record<string, unknown> | undefined
    if (metadataRaw.trim()) {
      try {
        metadata = JSON.parse(metadataRaw)
      } catch (parseError) {
        setError('Metadata must be valid JSON')
        return
      }
    }

    setSubmitting(true)
    setError(null)
    setInfoMessage(null)

    try {
      const scheduledIso = scheduledDate.toISOString()
      const hashtags = sanitizeHashtagInput(hashtagsInput)
      const response = await fetch(`${apiBaseUrl}/api/autoposts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          body: body.trim(),
          mood: mood.trim(),
          mediaUrl: mediaUrl.trim() || undefined,
          posterUrl: posterUrl.trim() || undefined,
          metadata,
          scheduledAt: scheduledIso,
          audience,
          hashtags: hashtags.length > 0 ? hashtags : undefined,
          callToActionLabel: callToActionLabel.trim() || undefined,
          callToActionUrl: callToActionUrl.trim() || undefined,
        }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload.error || `Failed to schedule autopost (${response.status})`)
      }

      setBody('')
      setMediaUrl('')
      setPosterUrl('')
      setHashtagsInput('')
      setCallToActionLabel('')
      setCallToActionUrl('')
      setMetadataRaw(DEFAULT_METADATA)
      setScheduledLocal(defaultScheduledLocal())
      setInfoMessage(`Autopost scheduled for ${formatDateTime(scheduledIso)}.`)
      await loadQueue()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to schedule autopost')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreativeSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!creativeTitle.trim() || !creativeSummary.trim()) {
      setError('Provide both a title and summary for creative drops.')
      return
    }

    const delaySeconds = creativeDelaySeconds.trim() ? Number(creativeDelaySeconds) : undefined
    if (delaySeconds !== undefined && (!Number.isFinite(delaySeconds) || delaySeconds < 0)) {
      setError('Delay seconds must be zero or a positive number.')
      return
    }

    const durationSeconds = creativeDurationSeconds.trim() ? Number(creativeDurationSeconds) : undefined
    if (durationSeconds !== undefined && (!Number.isFinite(durationSeconds) || durationSeconds <= 0)) {
      setError('Duration seconds must be a positive number when provided.')
      return
    }

    setCreativeSubmitting(true)
    setError(null)
    setInfoMessage(null)

    try {
      const inspirations = parseInspirations(creativeInspirations)
      const hashtags = sanitizeHashtagInput(creativeHashtagsInput)
      const response = await fetch(`${apiBaseUrl}/api/autoposts/creative`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          creativeType,
          title: creativeTitle.trim(),
          summary: creativeSummary.trim(),
          inspirations,
          assetUrl: creativeAssetUrl.trim() || undefined,
          posterUrl: creativePosterUrl.trim() || undefined,
          durationSeconds: durationSeconds ?? undefined,
          delaySeconds: delaySeconds ?? undefined,
          audience: creativeAudience,
          hashtags: hashtags.length > 0 ? hashtags : undefined,
          callToActionLabel: creativeCallToActionLabel.trim() || undefined,
          callToActionUrl: creativeCallToActionUrl.trim() || undefined,
        }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload.error || `Failed to schedule creative autopost (${response.status})`)
      }

      const entry = unwrapAutopostPayload(payload)
      setCreativeResponse(entry)
      if (entry) {
        const details = mergeAutopostDetails(entry)
        const scheduled = details?.scheduledAt ?? entry.scheduledAt
        setInfoMessage(
          scheduled
            ? `Creative autopost scheduled for ${formatDateTime(scheduled)}.`
            : 'Creative autopost scheduled.',
        )
      } else {
        setInfoMessage('Creative autopost scheduled.')
      }

      setCreativeTitle('')
      setCreativeSummary('')
      setCreativeInspirations('')
      setCreativeHashtagsInput('')
      setCreativeAssetUrl('')
      setCreativePosterUrl('')
      setCreativeDurationSeconds('')
      setCreativeDelaySeconds('3600')
      setCreativeCallToActionLabel('')
      setCreativeCallToActionUrl('')
      await loadQueue()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to schedule creative autopost')
    } finally {
      setCreativeSubmitting(false)
    }
  }

  const handleReleaseDue = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!releaseUntilLocal.trim()) {
      setError('Choose a release cutoff before sweeping due entries.')
      return
    }

    const releaseDate = new Date(releaseUntilLocal)
    if (Number.isNaN(releaseDate.getTime())) {
      setError('Choose a valid timestamp to release due autoposts.')
      return
    }

    setReleasing(true)
    setError(null)
    setInfoMessage(null)

    try {
      const releaseIso = releaseDate.toISOString()
      const response = await fetch(`${apiBaseUrl}/api/autoposts/release-due`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ releaseUntil: releaseIso }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload.error || `Failed to release due autoposts (${response.status})`)
      }
      const releasedEntries: AutopostEntry[] = Array.isArray(payload.autoposts)
        ? payload.autoposts
        : Array.isArray(payload.released)
          ? payload.released
          : []
      const releasedCount = releasedEntries.length
      setInfoMessage(
        releasedCount > 0
          ? `Released ${releasedCount} autopost${releasedCount === 1 ? '' : 's'} due before ${formatDateTime(releaseIso)}.`
          : 'No autoposts were ready to release yet.',
      )
      setReleaseUntilLocal(defaultReleaseLocal())
      await loadQueue()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to release due autoposts')
    } finally {
      setReleasing(false)
    }
  }

  const publishNow = async (entry: AutopostEntry) => {
    setError(null)
    setInfoMessage(null)
    try {
      const response = await fetch(`${apiBaseUrl}/api/autoposts/${entry.id}/publish`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ publishedAt: new Date().toISOString() }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload.error || `Failed to publish autopost (${response.status})`)
      }
      const updated = unwrapAutopostPayload(payload)
      const outcome = updated?.status === 'published' ? 'published' : 'queued for publish'
      setInfoMessage(`Autopost ${entry.id} ${outcome}.`)
      await loadQueue()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to publish autopost')
    }
  }

  return (
    <section className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-[#101737]/80 p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-[0.65rem] uppercase tracking-[0.32em] text-brand-mist/70">Campaign autoposting</p>
          <h2 className="text-2xl font-semibold text-white">Autopost queue</h2>
          <p className="text-sm text-brand-mist/70">
            Review scheduled drops, monitor connection dreams, and push a story live when the feed is ready.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.3em] text-brand-mist/70">
            Filter queue
            <select
              value={statusOption}
              onChange={(event) => handleStatusChange(event.target.value as AutopostStatus | 'all')}
              className="rounded-full border border-white/10 bg-[#0b1126] px-3 py-2 text-sm font-semibold text-white focus:border-brand-magnolia/50 focus:outline-none"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => void loadQueue()}
            className="inline-flex items-center justify-center rounded-md border border-white/10 bg-[#161f3e] px-4 py-2 text-sm font-semibold text-white transition hover:border-brand-magnolia/50 hover:text-brand-magnolia"
          >
            Refresh queue
          </button>
        </div>
      </header>

      {infoMessage ? (
        <p className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">{infoMessage}</p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-white/10 bg-[#0d142c]/70 p-6">
          <h3 className="text-lg font-semibold text-white">Schedule a generic autopost</h3>
          <label className="flex flex-col gap-2 text-sm text-brand-mist">
            Body
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Share how your connection evolved…"
              className="min-h-[120px] rounded-xl border border-white/10 bg-[#0b1126] p-3 text-sm text-white placeholder:text-brand-mist/50 focus:border-brand-magnolia/50 focus:outline-none"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-brand-mist">
              Mood (optional)
              <input
                type="text"
                value={mood}
                onChange={(event) => setMood(event.target.value)}
                className="rounded-full border border-white/10 bg-[#0b1126] px-3 py-2 text-sm text-white placeholder:text-brand-mist/50 focus:border-brand-magnolia/50 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-brand-mist">
              Audience
              <select
                value={audience}
                onChange={(event) => setAudience(event.target.value as AutopostAudience)}
                className="rounded-full border border-white/10 bg-[#0b1126] px-3 py-2 text-sm text-white focus:border-brand-magnolia/50 focus:outline-none"
              >
                <option value="public">Public</option>
                <option value="friends">Friends</option>
                <option value="private">Private</option>
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-2 text-sm text-brand-mist">
            Scheduled for
            <input
              type="datetime-local"
              value={scheduledLocal}
              onChange={(event) => setScheduledLocal(event.target.value)}
              className="rounded-full border border-white/10 bg-[#0b1126] px-3 py-2 text-sm text-white focus:border-brand-magnolia/50 focus:outline-none"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-brand-mist">
              Media URL (optional)
              <input
                type="url"
                value={mediaUrl}
                onChange={(event) => setMediaUrl(event.target.value)}
                placeholder="https://cdn.example.com/video.mp4"
                className="rounded-full border border-white/10 bg-[#0b1126] px-3 py-2 text-sm text-white placeholder:text-brand-mist/50 focus:border-brand-magnolia/50 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-brand-mist">
              Poster URL (optional)
              <input
                type="url"
                value={posterUrl}
                onChange={(event) => setPosterUrl(event.target.value)}
                placeholder="https://cdn.example.com/preview.jpg"
                className="rounded-full border border-white/10 bg-[#0b1126] px-3 py-2 text-sm text-white placeholder:text-brand-mist/50 focus:border-brand-magnolia/50 focus:outline-none"
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-brand-mist">
              Hashtags
              <input
                type="text"
                value={hashtagsInput}
                onChange={(event) => setHashtagsInput(event.target.value)}
                placeholder="#connection #dreamstate"
                className="rounded-full border border-white/10 bg-[#0b1126] px-3 py-2 text-sm text-white placeholder:text-brand-mist/50 focus:border-brand-magnolia/50 focus:outline-none"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-brand-mist">
                CTA label
                <input
                  type="text"
                  value={callToActionLabel}
                  onChange={(event) => setCallToActionLabel(event.target.value)}
                  placeholder="Watch now"
                  className="rounded-full border border-white/10 bg-[#0b1126] px-3 py-2 text-sm text-white placeholder:text-brand-mist/50 focus:border-brand-magnolia/50 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-brand-mist">
                CTA URL
                <input
                  type="url"
                  value={callToActionUrl}
                  onChange={(event) => setCallToActionUrl(event.target.value)}
                  placeholder="https://mirai.ai/drop"
                  className="rounded-full border border-white/10 bg-[#0b1126] px-3 py-2 text-sm text-white placeholder:text-brand-mist/50 focus:border-brand-magnolia/50 focus:outline-none"
                />
              </label>
            </div>
          </div>
          <label className="flex flex-col gap-2 text-sm text-brand-mist">
            Metadata (JSON)
            <textarea
              value={metadataRaw}
              onChange={(event) => setMetadataRaw(event.target.value)}
              className="min-h-[120px] rounded-xl border border-white/10 bg-[#0b1126] p-3 font-mono text-xs text-brand-mist focus:border-brand-magnolia/50 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-md bg-brand-magnolia/80 px-4 py-2 text-sm font-semibold text-[#0b1022] transition hover:bg-brand-magnolia disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Scheduling…' : 'Schedule autopost'}
          </button>
        </form>

        <div className="space-y-6">
          <form onSubmit={handleCreativeSubmit} className="grid gap-4 rounded-2xl border border-white/10 bg-[#0d142c]/70 p-6">
            <h3 className="text-lg font-semibold text-white">Launch a creative drop</h3>
            <label className="flex flex-col gap-2 text-sm text-brand-mist">
              Creative type
              <select
                value={creativeType}
                onChange={(event) => setCreativeType(event.target.value as CreativeType)}
                className="rounded-full border border-white/10 bg-[#0b1126] px-3 py-2 text-sm text-white focus:border-brand-magnolia/50 focus:outline-none"
              >
                <option value="poem">Poem</option>
                <option value="story">Story</option>
                <option value="dreamVideo">Dream video</option>
                <option value="imageArt">Image art</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm text-brand-mist">
              Title
              <input
                type="text"
                value={creativeTitle}
                onChange={(event) => setCreativeTitle(event.target.value)}
                placeholder="Connection dream: Midnight analog"
                className="rounded-full border border-white/10 bg-[#0b1126] px-3 py-2 text-sm text-white placeholder:text-brand-mist/50 focus:border-brand-magnolia/50 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-brand-mist">
              Summary
              <textarea
                value={creativeSummary}
                onChange={(event) => setCreativeSummary(event.target.value)}
                placeholder="Describe the drop so the adaptive profile knows how to position it."
                className="min-h-[120px] rounded-xl border border-white/10 bg-[#0b1126] p-3 text-sm text-white placeholder:text-brand-mist/50 focus:border-brand-magnolia/50 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-brand-mist">
              Inspirations (comma or newline separated)
              <textarea
                value={creativeInspirations}
                onChange={(event) => setCreativeInspirations(event.target.value)}
                placeholder="Analog dreams, Federation meet, Shared tempo"
                className="min-h-[100px] rounded-xl border border-white/10 bg-[#0b1126] p-3 text-sm text-white placeholder:text-brand-mist/50 focus:border-brand-magnolia/50 focus:outline-none"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-brand-mist">
                Delay seconds
                <input
                  type="number"
                  min={0}
                  value={creativeDelaySeconds}
                  onChange={(event) => setCreativeDelaySeconds(event.target.value)}
                  className="rounded-full border border-white/10 bg-[#0b1126] px-3 py-2 text-sm text-white focus:border-brand-magnolia/50 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-brand-mist">
                Audience
                <select
                  value={creativeAudience}
                  onChange={(event) => setCreativeAudience(event.target.value as AutopostAudience)}
                  className="rounded-full border border-white/10 bg-[#0b1126] px-3 py-2 text-sm text-white focus:border-brand-magnolia/50 focus:outline-none"
                >
                  <option value="public">Public</option>
                  <option value="friends">Friends</option>
                  <option value="private">Private</option>
                </select>
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-brand-mist">
                Duration seconds (optional)
                <input
                  type="number"
                  min={1}
                  value={creativeDurationSeconds}
                  onChange={(event) => setCreativeDurationSeconds(event.target.value)}
                  className="rounded-full border border-white/10 bg-[#0b1126] px-3 py-2 text-sm text-white focus:border-brand-magnolia/50 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-brand-mist">
                Hashtags
                <input
                  type="text"
                  value={creativeHashtagsInput}
                  onChange={(event) => setCreativeHashtagsInput(event.target.value)}
                  placeholder="#dreamlink #federation"
                  className="rounded-full border border-white/10 bg-[#0b1126] px-3 py-2 text-sm text-white placeholder:text-brand-mist/50 focus:border-brand-magnolia/50 focus:outline-none"
                />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-brand-mist">
                Asset URL (optional)
                <input
                  type="url"
                  value={creativeAssetUrl}
                  onChange={(event) => setCreativeAssetUrl(event.target.value)}
                  placeholder="https://cdn.example.com/dream.mp4"
                  className="rounded-full border border-white/10 bg-[#0b1126] px-3 py-2 text-sm text-white placeholder:text-brand-mist/50 focus:border-brand-magnolia/50 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-brand-mist">
                Poster URL (optional)
                <input
                  type="url"
                  value={creativePosterUrl}
                  onChange={(event) => setCreativePosterUrl(event.target.value)}
                  placeholder="https://cdn.example.com/dream.jpg"
                  className="rounded-full border border-white/10 bg-[#0b1126] px-3 py-2 text-sm text-white placeholder:text-brand-mist/50 focus:border-brand-magnolia/50 focus:outline-none"
                />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-brand-mist">
                CTA label
                <input
                  type="text"
                  value={creativeCallToActionLabel}
                  onChange={(event) => setCreativeCallToActionLabel(event.target.value)}
                  placeholder="Experience"
                  className="rounded-full border border-white/10 bg-[#0b1126] px-3 py-2 text-sm text-white placeholder:text-brand-mist/50 focus:border-brand-magnolia/50 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-brand-mist">
                CTA URL
                <input
                  type="url"
                  value={creativeCallToActionUrl}
                  onChange={(event) => setCreativeCallToActionUrl(event.target.value)}
                  placeholder="https://mirai.ai/dream"
                  className="rounded-full border border-white/10 bg-[#0b1126] px-3 py-2 text-sm text-white placeholder:text-brand-mist/50 focus:border-brand-magnolia/50 focus:outline-none"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={creativeSubmitting}
              className="inline-flex items-center justify-center rounded-md bg-brand-magnolia/80 px-4 py-2 text-sm font-semibold text-[#0b1022] transition hover:bg-brand-magnolia disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creativeSubmitting ? 'Scheduling…' : 'Schedule creative drop'}
            </button>
          </form>

          {creativeResponse ? (
            <article className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0d142c]/70 p-5">
              <div className="flex flex-col gap-1">
                <span className="text-[0.65rem] uppercase tracking-[0.32em] text-brand-mist/60">Latest creative response</span>
                <h4 className="text-lg font-semibold text-white">Autopost #{creativeResponse.id}</h4>
                <p className="text-xs text-brand-mist/70">
                  Scheduled {formatDateTime(creativeResponseDetails?.scheduledAt ?? creativeResponse.scheduledAt)}
                </p>
              </div>
              <AutopostMetadataView entry={creativeResponse} />
            </article>
          ) : null}
        </div>
      </div>

      <form
        onSubmit={handleReleaseDue}
        className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0d142c]/70 p-6 text-sm text-brand-mist"
      >
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-white">Release due autoposts</h3>
          <p className="text-sm text-brand-mist/70">
            Sweep everything scheduled up to the timestamp you choose. Use this when a campaign needs to accelerate.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-2 text-sm text-brand-mist">
            Release entries due before
            <input
              type="datetime-local"
              value={releaseUntilLocal}
              onChange={(event) => setReleaseUntilLocal(event.target.value)}
              className="rounded-full border border-white/10 bg-[#0b1126] px-3 py-2 text-sm text-white focus:border-brand-magnolia/50 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={releasing}
            className="inline-flex items-center justify-center rounded-md bg-emerald-400/90 px-4 py-2 text-sm font-semibold text-[#03161f] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {releasing ? 'Releasing…' : 'Release due drops'}
          </button>
        </div>
      </form>

      <div className="grid gap-4">
        {loading ? <p className="text-sm text-brand-mist/70">Loading autopost queue…</p> : null}
        {!loading && queue.length === 0 ? (
          <p className="text-sm text-brand-mist/70">No autoposts yet. Schedule one above to get started.</p>
        ) : null}
        {queue.map((entry) => (
          <article key={entry.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0d142c]/70 p-5">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[0.65rem] uppercase tracking-[0.32em] text-brand-mist/60">Autopost #{entry.id}</span>
                <h4 className="text-lg font-semibold text-white">{entry.title || entry.summary || entry.body}</h4>
              </div>
              <span className="inline-flex items-center justify-center rounded-full border border-white/10 bg-[#16204b] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-brand-mist">
                {entry.status}
              </span>
            </header>
            <dl className="grid gap-2 text-xs text-brand-mist/80 sm:grid-cols-2">
              <div className="flex flex-col">
                <dt className="font-semibold text-brand-mist">Scheduled</dt>
                <dd>{formatDateTime(entry.scheduledAt)}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="font-semibold text-brand-mist">Last updated</dt>
                <dd>{formatDateTime(entry.updatedAt)}</dd>
              </div>
              {entry.mediaUrl || entry.assetUrl ? (
                <div className="flex flex-col">
                  <dt className="font-semibold text-brand-mist">Media</dt>
                  <dd className="break-all text-brand-magnolia">{entry.mediaUrl ?? entry.assetUrl}</dd>
                </div>
              ) : null}
              {entry.posterUrl ? (
                <div className="flex flex-col">
                  <dt className="font-semibold text-brand-mist">Poster</dt>
                  <dd className="break-all text-brand-magnolia">{entry.posterUrl}</dd>
                </div>
              ) : null}
            </dl>
            <AutopostMetadataView entry={entry} />
            {entry.publishedPost ? (
              <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-[#101737]/80 p-3">
                <p className="text-[0.65rem] uppercase tracking-[0.32em] text-brand-mist/60">Published post</p>
                <p className="text-sm text-brand-mist">{entry.publishedPost.body}</p>
              </div>
            ) : null}
            {entry.status === 'scheduled' ? (
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => void publishNow(entry)}
                  className="inline-flex items-center justify-center rounded-md bg-emerald-400/90 px-4 py-2 text-sm font-semibold text-[#03161f] transition hover:bg-emerald-300"
                >
                  Publish now
                </button>
              </div>
            ) : null}
          </article>
        ))}
      </div>

      {nextCursor ? (
        <button
          type="button"
          onClick={() => void loadQueue({ cursor: nextCursor })}
          disabled={loadingMore}
          className="self-center rounded-full border border-white/10 bg-[#161f3e] px-4 py-2 text-sm font-semibold text-white transition hover:border-brand-magnolia/50 hover:text-brand-magnolia disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingMore ? 'Loading…' : 'Load more'}
        </button>
      ) : null}
    </section>
  )
}

export default AutopostPanel
