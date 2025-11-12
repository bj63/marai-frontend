'use client'

import { ImageIcon, Palette } from 'lucide-react'
import SentimentBadge from '@/components/business/SentimentBadge'
import AutopostMedia from '@/components/business/autopost/AutopostMedia'
import {
  collectHashtags,
  collectInspirations,
  getCallToAction,
  getPrimarySentiment,
  isRecord,
  mergeFeedHints,
  pickString,
  isSafeExternalUrl,
} from '@/components/business/autopost/utils'
import type { AutopostQueueEntry } from '@/types/business'

interface CreativeImageArtCardProps {
  entry: AutopostQueueEntry
}

export default function CreativeImageArtCard({ entry }: CreativeImageArtCardProps) {
  const details = entry.details
  const metadataRecord = isRecord(entry.metadata) ? (entry.metadata as Record<string, unknown>) : null
  const feedHints = mergeFeedHints(entry, details)
  const sentiment = getPrimarySentiment(entry)
  const callToAction = getCallToAction(entry, details)
  const inspirations = collectInspirations(details)
  const hashtags = collectHashtags(entry)
  const creativeMedium =
    feedHints?.creativeMedium ?? pickString(metadataRecord, 'creativeMedium', 'creative_medium', 'style')

  const title = details?.title ?? entry.title ?? 'Image art concept'
  const summary = details?.summary ?? entry.summary ?? entry.body

  return (
    <article className="group rounded-3xl border border-white/10 bg-white/5 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.35em] text-emerald-200">
          <ImageIcon className="h-4 w-4" />
          <span>Image art</span>
        </div>
        {sentiment ? (
          <SentimentBadge label={sentiment.label} confidence={sentiment.confidence} />
        ) : (
          <SentimentBadge label="calibrating" confidence={0.36} muted />
        )}
      </header>

      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_0.9fr]">
        <div className="space-y-4">
          <div>
            <h3 className="text-2xl font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm text-slate-300">{summary}</p>
          </div>

          {creativeMedium && (
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
              <Palette className="h-3.5 w-3.5" />
              {creativeMedium}
            </span>
          )}

          {(inspirations.length > 0 || hashtags.length > 0) && (
            <div className="flex flex-wrap gap-2 text-xs">
              {inspirations.map((chip) => (
                <span key={chip} className="rounded-full border border-white/10 px-3 py-1 text-slate-200">
                  Muse: {chip}
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
                  View gallery
                </a>
              )}
            </div>
          )}
        </div>

        <AutopostMedia
          mediaUrl={details?.mediaUrl ?? entry.mediaUrl ?? entry.assetUrl ?? null}
          posterUrl={details?.posterUrl ?? entry.posterUrl ?? null}
          creativeType={details?.creativeType ?? entry.creativeType ?? null}
        />
      </div>
    </article>
  )
}
