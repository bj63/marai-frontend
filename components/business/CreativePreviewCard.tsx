'use client'

import Image from 'next/image'
import Link from 'next/link'
import { BadgeCheck, ExternalLink, Sparkles } from 'lucide-react'
import SentimentBadge from '@/components/business/SentimentBadge'
import type { AutopostQueueEntry } from '@/types/business'

interface CreativePreviewCardProps {
  entry: AutopostQueueEntry | null
}

export default function CreativePreviewCard({ entry }: CreativePreviewCardProps) {
  if (!entry) {
    return (
      <div className="rounded-3xl border border-dashed border-white/20 bg-slate-950/50 p-10 text-center text-sm text-slate-400">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
          <Sparkles className="h-6 w-6" />
        </div>
        <p className="mt-4 font-semibold text-white">Preview your AI creative</p>
        <p className="mt-2 text-sm text-slate-400">
          Generate a campaign brief to see copy, CTA, and metadata before it hits the queue.
        </p>
      </div>
    )
  }

  const details = entry.details
  const sentiment = entry.sentimentSignals[0]
  const poster = details?.posterUrl ?? entry.posterUrl ?? details?.assetUrl ?? entry.assetUrl ?? null
  const feedShareParams = new URLSearchParams()
  if (entry.mood ?? sentiment?.label) {
    feedShareParams.set('prefillMood', entry.mood ?? sentiment?.label ?? 'calm')
  }
  if (details?.summary ?? entry.summary) {
    feedShareParams.set('prefillNote', (details?.summary ?? entry.summary ?? '').slice(0, 200))
  }
  const feedPreviewHref = feedShareParams.toString().length ? `/feed?${feedShareParams.toString()}` : '/feed'

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-emerald-200">
            <BadgeCheck className="h-4 w-4" />
            Ready for pro-mode queue
          </div>
          <h3 className="mt-2 text-xl font-semibold text-white">{details?.title ?? entry.title}</h3>
          <p className="mt-1 text-sm text-slate-300">{details?.summary ?? entry.summary}</p>
        </div>
        {sentiment && <SentimentBadge label={sentiment.label} confidence={sentiment.confidence} />}
      </header>
      {poster && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
          <Image
            src={poster}
            alt={details?.title ?? 'Campaign poster'}
            width={1200}
            height={675}
            className="h-60 w-full object-cover"
          />
        </div>
      )}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-300">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Copy</p>
          <p className="mt-2 text-sm text-white">{entry.body}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-300">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">CTA</p>
          <p className="mt-2 text-sm text-white">{details?.callToAction?.label ?? entry.callToAction?.label ?? 'Set a label'}</p>
          <p className="mt-1 text-xs text-emerald-200">{details?.callToAction?.url ?? entry.callToAction?.url ?? 'Add a destination'}</p>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-400">
        {details?.hashtags?.map((tag) => (
          <span key={tag} className="rounded-full bg-slate-900/70 px-3 py-1 text-slate-200">
            {tag}
          </span>
        ))}
        {details?.feedHints?.campaignId && (
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-slate-200">
            {details.feedHints.campaignId}
          </span>
        )}
        {entry.delaySeconds && (
          <span className="rounded-full border border-white/5 px-3 py-1">Delay {Math.round(entry.delaySeconds / 60)}m</span>
        )}
      </div>
      {details?.callToAction?.url && (
        <a
          href={details.callToAction.url}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/20"
        >
          <ExternalLink className="h-4 w-4" />
          Open landing page
        </a>
      )}
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-200">
        <Link
          href={feedPreviewHref}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 font-semibold uppercase tracking-[0.3em] text-white hover:border-white/40"
        >
          Preview in feed glow
        </Link>
        <Link
          href="/business/assets"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 font-semibold uppercase tracking-[0.3em] text-white hover:border-white/40"
        >
          Open media engine
        </Link>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 font-semibold uppercase tracking-[0.3em] text-white hover:border-white/40"
        >
          Clone variant
        </button>
      </div>
    </div>
  )
}
