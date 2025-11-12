'use client'

import { Film, Sparkle } from 'lucide-react'
import SentimentBadge from '@/components/business/SentimentBadge'
import AutopostMedia from '@/components/business/autopost/AutopostMedia'
import {
  collectHashtags,
  collectInspirations,
  getCallToAction,
  getPrimarySentiment,
  isRecord,
  mergeFeedHints,
  pickRecord,
  pickString,
  pickStringArray,
  isSafeExternalUrl,
} from '@/components/business/autopost/utils'
import type { AutopostQueueEntry } from '@/types/business'

interface CreativeDreamVideoCardProps {
  entry: AutopostQueueEntry
  metadata: Record<string, unknown> | null
}

const renderAdaptiveSignals = (profile: Record<string, unknown> | null) => {
  if (!profile) return null
  const entries = Object.entries(profile)
    .filter(([_, value]) => typeof value === 'string' || typeof value === 'number')
    .slice(0, 4)
  if (entries.length === 0) return null
  return (
    <div className="mt-4 space-y-1 text-xs text-slate-300">
      <p className="uppercase tracking-[0.3em] text-slate-500">Adaptive signals</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {entries.map(([key, value]) => (
          <div
            key={key}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[0.8rem] text-white/80"
          >
            <span className="font-semibold text-white">{key}</span>
            <span className="ml-2 text-slate-300">{String(value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CreativeDreamVideoCard({ entry, metadata }: CreativeDreamVideoCardProps) {
  const details = entry.details
  const sentiment = getPrimarySentiment(entry)
  const callToAction = getCallToAction(entry, details)
  const feedHints = mergeFeedHints(entry, details)
  const relationalHooks = feedHints?.relationalHooks ?? pickStringArray(metadata, 'relationalHooks', 'relational_hooks')
  const inspirations = collectInspirations(details)
  const hashtags = collectHashtags(entry)
  const adaptiveProfile =
    (details?.adaptiveProfile && isRecord(details.adaptiveProfile) ? details.adaptiveProfile : null) ??
    pickRecord(metadata, 'adaptiveProfile', 'adaptive_profile')
  const creativeTitle = details?.title ?? entry.title ?? 'Dream video concept'
  const creativeSummary = details?.summary ?? entry.summary ?? entry.body
  const placement = feedHints?.placement ?? pickString(metadata, 'placement')

  return (
    <article className="group rounded-3xl border border-white/10 bg-white/5 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.35em] text-emerald-200">
          <Film className="h-4 w-4" />
          <span>Dream video</span>
        </div>
        {placement && <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">{placement}</span>}
        {sentiment ? (
          <SentimentBadge label={sentiment.label} confidence={sentiment.confidence} />
        ) : (
          <SentimentBadge label="calibrating" confidence={0.45} muted />
        )}
      </header>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1.2fr_minmax(0,1fr)]">
        <div className="space-y-4">
          <div>
            <h3 className="text-2xl font-semibold text-white">{creativeTitle}</h3>
            <p className="mt-2 text-sm text-slate-300">{creativeSummary}</p>
          </div>

          {(relationalHooks.length > 0 || inspirations.length > 0 || hashtags.length > 0) && (
            <div className="space-y-2 text-xs">
              {relationalHooks.length > 0 && (
                <div className="flex flex-wrap gap-2 text-emerald-200">
                  {relationalHooks.map((hook) => (
                    <span key={hook} className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1">
                      <Sparkle className="h-3 w-3" />
                      {hook}
                    </span>
                  ))}
                </div>
              )}
              {inspirations.length > 0 && (
                <div className="flex flex-wrap gap-2 text-slate-200">
                  {inspirations.map((chip) => (
                    <span key={chip} className="rounded-full border border-white/10 px-3 py-1">
                      Inspired by {chip}
                    </span>
                  ))}
                </div>
              )}
              {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2 text-emerald-200">
                  {hashtags.map((tag) => (
                    <span key={tag} className="rounded-full bg-emerald-500/10 px-3 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {callToAction?.label && (
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm">
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
                  Preview
                </a>
              )}
            </div>
          )}

          {renderAdaptiveSignals(adaptiveProfile)}
        </div>

        <div>
          <AutopostMedia
            mediaUrl={details?.mediaUrl ?? entry.mediaUrl ?? entry.assetUrl ?? null}
            posterUrl={details?.posterUrl ?? entry.posterUrl ?? null}
            creativeType={details?.creativeType ?? entry.creativeType ?? null}
          />
        </div>
      </div>
    </article>
  )
}
