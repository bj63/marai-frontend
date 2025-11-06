'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'

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

export interface AutopostEntry {
  id: number
  ownerId: string
  body: string
  mood?: string | null
  emotionState?: Record<string, unknown> | null
  assetUrl?: string | null
  posterUrl?: string | null
  durationSeconds?: number | null
  metadata?: Record<string, unknown> | null
  status: 'scheduled' | 'publishing' | 'published'
  scheduledAt: string
  publishedPostId?: number | null
  createdAt: string
  updatedAt: string
  publishedPost?: FeedPost | null
}

export interface AutopostPanelProps {
  apiBaseUrl: string
  authToken: string
  statusFilter?: 'scheduled' | 'publishing' | 'published'
}

const DEFAULT_METADATA = '{\n  "type": "custom"\n}'

const formatDateTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleString()
  } catch (error) {
    return iso
  }
}

const defaultScheduledLocal = () => {
  const now = new Date()
  now.setMinutes(now.getMinutes() + 30)
  const pad = (value: number) => `${value}`.padStart(2, '0')
  const year = now.getFullYear()
  const month = pad(now.getMonth() + 1)
  const day = pad(now.getDate())
  const hours = pad(now.getHours())
  const minutes = pad(now.getMinutes())
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const buildHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
})

export function AutopostPanel({ apiBaseUrl, authToken, statusFilter }: AutopostPanelProps) {
  const [queue, setQueue] = useState<AutopostEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [body, setBody] = useState('')
  const [mood, setMood] = useState('dreamy')
  const [mediaUrl, setMediaUrl] = useState('')
  const [posterUrl, setPosterUrl] = useState('')
  const [scheduledLocal, setScheduledLocal] = useState(defaultScheduledLocal())
  const [metadataRaw, setMetadataRaw] = useState(DEFAULT_METADATA)
  const [submitting, setSubmitting] = useState(false)

  const headers = useMemo(() => buildHeaders(authToken), [authToken])

  const loadQueue = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (statusFilter) {
        params.set('status', statusFilter)
      }
      const response = await fetch(
        `${apiBaseUrl}/api/autoposts${params.toString() ? `?${params.toString()}` : ''}`,
        {
          method: 'GET',
          headers,
        },
      )
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error || `Failed to load autoposts (${response.status})`)
      }
      const payload = await response.json()
      setQueue(Array.isArray(payload.autoposts) ? payload.autoposts : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error loading autoposts')
    } finally {
      setLoading(false)
    }
  }, [apiBaseUrl, headers, statusFilter])

  useEffect(() => {
    void loadQueue()
  }, [loadQueue])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!body.trim()) {
      setError('Please provide a post body before scheduling.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const scheduledIso = new Date(scheduledLocal).toISOString()
      let metadata: Record<string, unknown> | undefined
      try {
        metadata = JSON.parse(metadataRaw)
      } catch (parseError) {
        throw new Error('Metadata must be valid JSON')
      }

      const response = await fetch(`${apiBaseUrl}/api/autoposts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          body,
          mood,
          mediaUrl: mediaUrl.trim() || undefined,
          posterUrl: posterUrl.trim() || undefined,
          metadata,
          scheduledAt: scheduledIso,
        }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error || `Failed to schedule autopost (${response.status})`)
      }
      setBody('')
      setMediaUrl('')
      setPosterUrl('')
      setMetadataRaw(DEFAULT_METADATA)
      setScheduledLocal(defaultScheduledLocal())
      await loadQueue()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to schedule autopost')
    } finally {
      setSubmitting(false)
    }
  }

  const publishNow = async (entry: AutopostEntry) => {
    setError(null)
    try {
      const response = await fetch(`${apiBaseUrl}/api/autoposts/${entry.id}/publish`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ publishedAt: new Date().toISOString() }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error || `Failed to publish autopost (${response.status})`)
      }
      await loadQueue()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to publish autopost')
    }
  }

  return (
    <section className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-[#101737]/80 p-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-[0.65rem] uppercase tracking-[0.32em] text-brand-mist/70">Campaign autoposting</p>
          <h2 className="text-2xl font-semibold text-white">Autopost queue</h2>
          <p className="text-sm text-brand-mist/70">
            Review scheduled drops, tweak metadata, and push a story live when you are ready for the feed.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadQueue()}
          className="inline-flex items-center justify-center rounded-md border border-white/10 bg-[#161f3e] px-4 py-2 text-sm font-semibold text-white transition hover:border-brand-magnolia/50 hover:text-brand-magnolia"
        >
          Refresh queue
        </button>
      </header>

      {error ? (
        <p className="rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>
      ) : null}

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-white/10 bg-[#0d142c]/70 p-6">
        <h3 className="text-lg font-semibold text-white">Schedule a new autopost</h3>
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
            Scheduled for
            <input
              type="datetime-local"
              value={scheduledLocal}
              onChange={(event) => setScheduledLocal(event.target.value)}
              className="rounded-full border border-white/10 bg-[#0b1126] px-3 py-2 text-sm text-white focus:border-brand-magnolia/50 focus:outline-none"
            />
          </label>
        </div>

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
                <h4 className="text-lg font-semibold text-white">{entry.body}</h4>
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
              {entry.assetUrl ? (
                <div className="flex flex-col">
                  <dt className="font-semibold text-brand-mist">Media</dt>
                  <dd className="break-all text-brand-magnolia">{entry.assetUrl}</dd>
                </div>
              ) : null}
              {entry.posterUrl ? (
                <div className="flex flex-col">
                  <dt className="font-semibold text-brand-mist">Poster</dt>
                  <dd className="break-all text-brand-magnolia">{entry.posterUrl}</dd>
                </div>
              ) : null}
              {entry.metadata ? (
                <div className="flex flex-col sm:col-span-2">
                  <dt className="font-semibold text-brand-mist">Metadata</dt>
                  <dd>
                    <pre className="max-h-60 overflow-auto rounded-xl border border-white/10 bg-[#0b1126] p-3 text-xs text-brand-mist">{JSON.stringify(entry.metadata, null, 2)}</pre>
                  </dd>
                </div>
              ) : null}
              {entry.publishedPost ? (
                <div className="flex flex-col sm:col-span-2">
                  <dt className="font-semibold text-brand-mist">Published post</dt>
                  <dd className="rounded-xl border border-white/10 bg-[#101737]/80 p-3 text-sm text-brand-mist">
                    {entry.publishedPost.body}
                  </dd>
                </div>
              ) : null}
            </dl>
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
    </section>
  )
}

export default AutopostPanel
