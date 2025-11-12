'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { extractAutopostDetails, parseFeedHints } from '@/lib/autopost'
import type { AutopostQueueEntry, AutopostStatus, SentimentSignal } from '@/types/business'

interface ApiAutopostResponse {
  autoposts: RawAutopostEntry[]
  nextCursor: string | null
}

export interface RawAutopostEntry {
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
  creativeType?: string | null
  title?: string | null
  summary?: string | null
  inspirations?: string[] | null
  audience?: string | null
  hashtags?: string[] | null
  callToAction?: { label?: string | null; url?: string | null } | null
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
}

interface UseAutopostQueueOptions {
  status?: AutopostStatus | 'all'
  limit?: number
  refreshIntervalMs?: number
}

interface UseAutopostQueueResult {
  entries: AutopostQueueEntry[]
  loading: boolean
  error: string | null
  nextCursor: string | null
  refresh: () => void
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const normaliseSentiment = (emotionState?: Record<string, unknown> | null): SentimentSignal[] => {
  if (!emotionState || !isRecord(emotionState)) {
    return []
  }

  const aggregate = emotionState.aggregate
  if (Array.isArray(aggregate)) {
    return aggregate
      .map((entry) => {
        if (!entry || typeof entry !== 'object') return null
        const record = entry as Record<string, unknown>
        const label = typeof record.label === 'string' ? record.label : null
        const confidence = typeof record.confidence === 'number' ? record.confidence : null
        if (!label || confidence === null || Number.isNaN(confidence)) {
          return null
        }
        return {
          label,
          confidence: Math.max(0, Math.min(1, confidence)),
        }
      })
      .filter((entry): entry is SentimentSignal => Boolean(entry))
  }

  const label = typeof emotionState.label === 'string' ? emotionState.label : null
  const confidenceRaw = emotionState.confidence
  const confidence =
    typeof confidenceRaw === 'number' && Number.isFinite(confidenceRaw) ? confidenceRaw : null

  if (!label) {
    return []
  }

  return [
    {
      label,
      confidence: confidence !== null ? Math.max(0, Math.min(1, confidence)) : 0.5,
    },
  ]
}

export const mapAutopostEntry = (entry: RawAutopostEntry): AutopostQueueEntry => {
  const details = extractAutopostDetails(entry.metadata ?? null)
  const feedHints =
    details?.feedHints ??
    parseFeedHints(
      entry.metadata && isRecord(entry.metadata)
        ? (entry.metadata.feedHints ?? (entry.metadata as Record<string, unknown>).feed_hints ?? null)
        : null,
    )

  return {
    ...entry,
    details,
    feedHints,
    isPromoted: Boolean(feedHints?.isPromoted),
    sentimentSignals: normaliseSentiment(entry.emotionState),
  }
}

export function useAutopostQueue(options?: UseAutopostQueueOptions): UseAutopostQueueResult {
  const [entries, setEntries] = useState<AutopostQueueEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const refreshTokenRef = useRef(0)

  const status = options?.status ?? 'all'
  const limit = options?.limit
  const refreshIntervalMs = options?.refreshIntervalMs ?? 60_000

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const url = new URL('/api/autoposts', window.location.origin)
      if (status && status !== 'all') {
        url.searchParams.set('status', status)
      }
      if (limit && Number.isFinite(limit)) {
        url.searchParams.set('limit', String(limit))
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      })
      if (!response.ok) {
        throw new Error(`Failed to load autopost queue (${response.status})`)
      }

      const payload = (await response.json()) as ApiAutopostResponse
      const mapped = Array.isArray(payload.autoposts)
        ? payload.autoposts.map(mapAutopostEntry)
        : []
      setEntries(mapped)
      setNextCursor(payload.nextCursor ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load autoposts')
      setEntries([])
      setNextCursor(null)
    } finally {
      setLoading(false)
    }
  }, [limit, status])

  useEffect(() => {
    let active = true
    fetchEntries()

    const handle = setInterval(() => {
      if (!active) return
      fetchEntries()
    }, refreshIntervalMs)

    return () => {
      active = false
      clearInterval(handle)
    }
  }, [fetchEntries, refreshIntervalMs, refreshTokenRef.current])

  const refresh = useCallback(() => {
    refreshTokenRef.current += 1
    fetchEntries()
  }, [fetchEntries])

  return useMemo(
    () => ({
      entries,
      loading,
      error,
      nextCursor,
      refresh,
    }),
    [entries, error, loading, nextCursor, refresh],
  )
}
