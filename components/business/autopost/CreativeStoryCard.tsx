'use client'

import { BookOpen, Bookmark } from 'lucide-react'
import SentimentBadge from '@/components/business/SentimentBadge'
import {
  collectHashtags,
  getCallToAction,
  getPrimarySentiment,
  isRecord,
  mergeFeedHints,
  pickString,
  isSafeExternalUrl,
} from '@/components/business/autopost/utils'
import type { AutopostQueueEntry } from '@/types/business'

interface CreativeStoryCardProps {
  entry: AutopostQueueEntry
}

const parseParagraphs = (body: string): string[] => {
  if (!body) return []
  return body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)
}

export default function CreativeStoryCard({ entry }: CreativeStoryCardProps) {
  const details = entry.details
  const metadataRecord = isRecord(entry.metadata) ? (entry.metadata as Record<string, unknown>) : null
  const feedHints = mergeFeedHints(entry, details)
  const sentiment = getPrimarySentiment(entry)
  const callToAction = getCallToAction(entry, details)
  const hashtags = collectHashtags(entry)
  const categories = feedHints?.categories ?? []
  const creativeMedium =
    feedHints?.creativeMedium ?? pickString(metadataRecord, 'creativeMedium', 'creative_medium')

  const title = details?.title ?? entry.title ?? 'Narrative concept'
  const summary = details?.summary ?? entry.summary
  const body = details?.body ?? entry.body ?? ''
  const paragraphs = parseParagraphs(body)

  return (
    <article className="group rounded-3xl border border-white/10 bg-white/5 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.35em] text-emerald-200">
          <BookOpen className="h-4 w-4" />
          <span>Story draft</span>
        </div>
        {sentiment ? (
          <SentimentBadge label={sentiment.label} confidence={sentiment.confidence} />
        ) : (
          <SentimentBadge label="calibrating" confidence={0.38} muted />
        )}
      </header>

      <div className="mt-4 space-y-5">
        <div>
          <h3 className="text-2xl font-semibold text-white">{title}</h3>
          {summary && <p className="mt-2 text-sm text-slate-300">{summary}</p>}
        </div>

        {creativeMedium && (
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
            <Bookmark className="h-3.5 w-3.5" />
            {creativeMedium}
          </span>
        )}

        <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/60 px-6 py-6">
          {paragraphs.length > 0 ? (
            paragraphs.map((paragraph, index) => (
              <p key={index} className="text-sm leading-relaxed text-slate-200">
                {paragraph}
              </p>
            ))
          ) : (
            <p className="text-sm text-slate-300">{body || 'No narrative copy provided yet.'}</p>
          )}
        </div>

        {(categories.length > 0 || hashtags.length > 0) && (
          <div className="flex flex-wrap gap-2 text-xs">
            {categories.map((category) => (
              <span key={category} className="rounded-full border border-white/10 px-3 py-1 text-slate-200">
                {category}
              </span>
            ))}
            {hashtags.map((tag) => (
              <span key={tag} className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-200">
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
                Read more
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
