'use client'

import Image from 'next/image'
import { useMemo } from 'react'
import SentimentBadge from '@/components/business/SentimentBadge'
import type { AutopostQueueEntry } from '@/types/business'

interface PromotedPostCardProps {
  entry: AutopostQueueEntry
}

const formatDateTime = (iso: string) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return 'Soon'
  }
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const pickSentiment = (entry: AutopostQueueEntry) => entry.sentimentSignals[0] ?? null

export default function PromotedPostCard({ entry }: PromotedPostCardProps) {
  const details = entry.details
  const sentiment = pickSentiment(entry)

  const mediaUrl = useMemo(() => {
    if (details?.posterUrl) return details.posterUrl
    if (entry.posterUrl) return entry.posterUrl
    if (details?.assetUrl) return details.assetUrl
    if (entry.assetUrl) return entry.assetUrl
    return null
  }, [details?.assetUrl, details?.posterUrl, entry.assetUrl, entry.posterUrl])

  return (
    <article className="group rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-white/20 hover:bg-white/10">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-emerald-200">
          <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-[0.7rem] font-semibold">
            Promoted
          </span>
          <span>{entry.feedHints?.campaignId ?? 'campaign'}</span>
        </div>
        <span className="text-xs text-slate-400">{formatDateTime(entry.scheduledAt)}</span>
      </div>
      <h3 className="mt-4 text-xl font-semibold text-white">{details?.title ?? entry.title ?? 'Untitled drop'}</h3>
      <p className="mt-2 text-sm text-slate-300">
        {details?.summary ?? entry.summary ?? entry.body.slice(0, 160)}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
        {details?.hashtags?.map((tag) => (
          <span key={tag} className="rounded-full bg-slate-900/70 px-3 py-1 text-slate-200">
            {tag}
          </span>
        ))}
        {sentiment && <SentimentBadge label={sentiment.label} confidence={sentiment.confidence} />}
      </div>
      {mediaUrl && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
          <Image
            src={mediaUrl}
            alt={details?.title ?? 'Campaign visual'}
            width={1200}
            height={675}
            className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      )}
      {details?.callToAction?.label && (
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Call to action</p>
            <p className="text-sm font-semibold text-emerald-200">{details.callToAction.label}</p>
          </div>
          {details.callToAction.url && (
            <a
              href={details.callToAction.url}
              className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/20"
            >
              Preview landing page
            </a>
          )}
        </div>
      )}
    </article>
  )
}
