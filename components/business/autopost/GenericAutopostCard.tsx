'use client'

import { Compass } from 'lucide-react'
import SentimentBadge from '@/components/business/SentimentBadge'
import {
  collectHashtags,
  getCallToAction,
  getPrimarySentiment,
  isSafeExternalUrl,
} from '@/components/business/autopost/utils'
import type { AutopostQueueEntry } from '@/types/business'

interface GenericAutopostCardProps {
  entry: AutopostQueueEntry
}

export default function GenericAutopostCard({ entry }: GenericAutopostCardProps) {
  const details = entry.details
  const sentiment = getPrimarySentiment(entry)
  const callToAction = getCallToAction(entry, details)
  const hashtags = collectHashtags(entry)
  const summary = details?.summary ?? entry.summary ?? entry.body

  return (
    <article className="group rounded-3xl border border-white/10 bg-white/5 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.35em] text-emerald-200">
          <Compass className="h-4 w-4" />
          <span>Autopost</span>
        </div>
        {sentiment ? (
          <SentimentBadge label={sentiment.label} confidence={sentiment.confidence} />
        ) : (
          <SentimentBadge label="calibrating" confidence={0.4} muted />
        )}
      </header>

      <div className="mt-4 space-y-4">
        <div>
          <h3 className="text-2xl font-semibold text-white">{details?.title ?? entry.title ?? 'Upcoming drop'}</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{summary}</p>
        </div>

        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs text-emerald-200">
            {hashtags.map((tag) => (
              <span key={tag} className="rounded-full bg-emerald-500/10 px-3 py-1">
                {tag}
              </span>
            ))}
          </div>
        )}

        {callToAction?.label && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Call to action</p>
              <p className="text-sm font-semibold text-emerald-200">{callToAction.label}</p>
            </div>
            {callToAction.url && isSafeExternalUrl(callToAction.url) && (
              <a
                href={callToAction.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-200 transition hover:bg-emerald-500/20"
              >
                Learn more
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
