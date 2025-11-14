'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import SentimentBadge from '@/components/business/SentimentBadge'
import { mapAutopostEntry, type RawAutopostEntry } from '@/lib/hooks/useAutopostQueue'
import type { AutopostQueueEntry, SentimentSignal } from '@/types/business'

interface CampaignBriefFormProps {
  onCreativeGenerated: (entry: AutopostQueueEntry) => void
  duplicateEntry?: AutopostQueueEntry | null
  onClearDuplicate?: () => void
}

interface SentimentOption extends SentimentSignal {
  description: string
}

const SENTIMENT_OPTIONS: SentimentOption[] = [
  { label: 'confident', confidence: 0.82, description: 'Bold, certain, and inspiring action.' },
  { label: 'uplifted', confidence: 0.74, description: 'Light, optimistic, and celebratory.' },
  { label: 'focused', confidence: 0.68, description: 'Precise, intentional, and grounded.' },
  { label: 'playful', confidence: 0.71, description: 'Vibrant, experimental, and social.' },
]

export default function CampaignBriefForm({ onCreativeGenerated, duplicateEntry, onClearDuplicate }: CampaignBriefFormProps) {
  const [objective, setObjective] = useState('awareness')
  const [audience, setAudience] = useState('public')
  const [mood, setMood] = useState('confident')
  const [reflection, setReflection] = useState('Our team is energized to share our latest release.')
  const [title, setTitle] = useState('Launch the Resonance Suite')
  const [summary, setSummary] = useState('Bring the team together around emotionally intelligent campaign rituals.')
  const [ctaLabel, setCtaLabel] = useState('Explore Resonance Suite')
  const [ctaUrl, setCtaUrl] = useState('https://marai.studio/resonance')
  const [hashtags, setHashtags] = useState('#marai #campaign #emotion #automation')
  const [delaySeconds, setDelaySeconds] = useState('3600')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedSentiment = useMemo(
    () => SENTIMENT_OPTIONS.find((option) => option.label === mood) ?? SENTIMENT_OPTIONS[0],
    [mood],
  )

  useEffect(() => {
    if (!duplicateEntry) return
    const sentimentLabel = duplicateEntry.sentimentSignals[0]?.label ?? duplicateEntry.mood ?? 'confident'
    setObjective(duplicateEntry.feedHints?.objective ?? duplicateEntry.details?.feedHints?.objective ?? 'awareness')
    setAudience(duplicateEntry.details?.audience ?? duplicateEntry.audience ?? 'public')
    setMood(sentimentLabel)
    setReflection(duplicateEntry.details?.body ?? duplicateEntry.body ?? 'Our team is energized to share our latest release.')
    setTitle(duplicateEntry.details?.title ?? duplicateEntry.title ?? 'Duplicated drop')
    setSummary(duplicateEntry.details?.summary ?? duplicateEntry.summary ?? 'Preview this variant before publishing.')
    setCtaLabel(duplicateEntry.details?.callToAction?.label ?? duplicateEntry.callToAction?.label ?? 'Open drop')
    setCtaUrl(duplicateEntry.details?.callToAction?.url ?? duplicateEntry.callToAction?.url ?? 'https://marai.studio')
    const tags = duplicateEntry.details?.hashtags ?? duplicateEntry.hashtags ?? []
    setHashtags(tags.length ? tags.join(' ') : '#marai #campaign')
    setDelaySeconds(String(duplicateEntry.delaySeconds ?? duplicateEntry.details?.durationSeconds ?? 3600))
  }, [duplicateEntry])

  const buildPayload = () => {
    const inspirationList = hashtags
      .split(/[#,\s]+/)
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)
      .map((entry) => `#${entry.replace(/^#/, '')}`)

    return {
      creativeType: 'story',
      title,
      summary,
      body: reflection,
      inspirations: ['team reflections', 'campaign rituals'],
      hashtags: inspirationList,
      assetUrl: null,
      posterUrl: null,
      mediaUrl: null,
      durationSeconds: null,
      delaySeconds: Number(delaySeconds) || 3600,
      audience,
      callToActionLabel: ctaLabel,
      callToActionUrl: ctaUrl,
      brandName: 'MarAI Business',
      campaignId: `cmp-${objective}-${Date.now()}`,
      objective,
      sentiment: {
        label: selectedSentiment.label,
        confidence: selectedSentiment.confidence,
      },
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const payload = buildPayload()
      const response = await fetch('/api/autoposts/creative', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Unable to generate creative drop')
      }

      const normalised = mapAutopostEntry(data.autopost as RawAutopostEntry)
      onCreativeGenerated(normalised)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Campaign brief intake</h2>
          <p className="mt-1 text-sm text-slate-400">
            Feed the AI autopost builder with your objective, audience, and team reflections.
          </p>
        </div>
        <SentimentBadge label={selectedSentiment.label} confidence={selectedSentiment.confidence} />
      </div>
      {duplicateEntry ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-100">
          <p>
            Duplicating drop #{duplicateEntry.id}. Update any details before scheduling a new variant.
          </p>
          {onClearDuplicate ? (
            <button
              type="button"
              onClick={onClearDuplicate}
              className="rounded-full border border-emerald-300/40 px-3 py-1 font-semibold uppercase tracking-[0.3em] text-emerald-100"
            >
              Reset handoff
            </button>
          ) : null}
        </div>
      ) : null}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Objective</span>
          <select
            value={objective}
            onChange={(event) => setObjective(event.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white focus:border-white/30 focus:outline-none"
          >
            <option value="awareness">Awareness</option>
            <option value="engagement">Engagement</option>
            <option value="conversion">Conversion</option>
            <option value="retention">Retention</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Audience</span>
          <select
            value={audience}
            onChange={(event) => setAudience(event.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white focus:border-white/30 focus:outline-none"
          >
            <option value="public">Public</option>
            <option value="friends">Followers</option>
            <option value="private">Private</option>
          </select>
        </label>
        <div className="md:col-span-2">
          <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Sentiment palette</span>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SENTIMENT_OPTIONS.map((option) => {
              const isActive = option.label === selectedSentiment.label
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setMood(option.label)}
                  className={`flex flex-col gap-2 rounded-2xl border px-4 py-3 text-left transition ${
                    isActive
                      ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-100'
                      : 'border-white/10 bg-slate-950/70 text-slate-300 hover:border-white/20 hover:bg-slate-900'
                  }`}
                >
                  <span className="text-sm font-semibold capitalize">{option.label}</span>
                  <p className="text-xs text-slate-400">{option.description}</p>
                  <SentimentBadge label={option.label} confidence={option.confidence} muted={!isActive} />
                </button>
              )
            })}
          </div>
        </div>
        <label className="flex flex-col gap-2 text-sm md:col-span-2">
          <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Team reflection</span>
          <textarea
            value={reflection}
            onChange={(event) => setReflection(event.target.value)}
            rows={3}
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white focus:border-white/30 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Campaign title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white focus:border-white/30 focus:outline-none"
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Summary</span>
          <input
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white focus:border-white/30 focus:outline-none"
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-xs uppercase tracking-[0.3em] text-slate-500">CTA label</span>
          <input
            value={ctaLabel}
            onChange={(event) => setCtaLabel(event.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white focus:border-white/30 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-xs uppercase tracking-[0.3em] text-slate-500">CTA URL</span>
          <input
            value={ctaUrl}
            onChange={(event) => setCtaUrl(event.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white focus:border-white/30 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Hashtags</span>
          <input
            value={hashtags}
            onChange={(event) => setHashtags(event.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white focus:border-white/30 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Schedule in (seconds)</span>
          <input
            value={delaySeconds}
            onChange={(event) => setDelaySeconds(event.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white focus:border-white/30 focus:outline-none"
          />
        </label>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Sparkles className="h-4 w-4" />
          <span>AI builder will respect pro-mode metadata and CTA contracts.</span>
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-6 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/20"
          disabled={loading}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Generate creative drop
        </button>
      </div>
      {error && <p className="mt-4 text-sm text-rose-200">{error}</p>}
    </form>
  )
}
