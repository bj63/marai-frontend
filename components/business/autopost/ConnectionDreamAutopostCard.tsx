'use client'

import { HeartHandshake, Sparkles } from 'lucide-react'
import SentimentBadge from '@/components/business/SentimentBadge'
import AutopostMedia from '@/components/business/autopost/AutopostMedia'
import {
  collectHashtags,
  collectInspirations,
  getCallToAction,
  getPrimarySentiment,
  isRecord,
  mergeFeedHints,
  pickNumber,
  pickRecord,
  pickString,
  pickStringArray,
  normaliseHashtags,
  isSafeExternalUrl,
} from '@/components/business/autopost/utils'
import type { AutopostQueueEntry } from '@/types/business'

interface ConnectionDreamAutopostCardProps {
  entry: AutopostQueueEntry
  metadata: Record<string, unknown> | null
}

const formatConfidence = (value: number | null) => {
  if (value === null || Number.isNaN(value)) {
    return null
  }
  return `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`
}

export default function ConnectionDreamAutopostCard({ entry, metadata }: ConnectionDreamAutopostCardProps) {
  const details = entry.details
  const dreamRecord =
    (details?.connectionDream && isRecord(details.connectionDream) ? details.connectionDream : null) ??
    pickRecord(metadata, 'connectionDream', 'dream')
  const partnerRecord = pickRecord(dreamRecord ?? metadata, 'partner', 'partnerProfile')
  const partnerName =
    pickString(dreamRecord, 'partnerName', 'partner_name', 'name') ??
    pickString(partnerRecord, 'name', 'displayName') ??
    pickString(metadata, 'partnerName', 'partner_name')
  const partnerId =
    pickString(dreamRecord, 'partnerId', 'partner_id') ??
    pickString(partnerRecord, 'id', 'partnerId')
  const tone = pickString(dreamRecord, 'tone', 'mood')
  const highlightedEmotion = pickString(dreamRecord, 'highlightedEmotion', 'highlighted_emotion')
  const dreamConfidence = pickNumber(dreamRecord, 'confidence', 'score')
  const callToAction = getCallToAction(entry, details)
  const feedHints = mergeFeedHints(entry, details)
  const categories = feedHints?.categories ?? []
  const relationalHooks = feedHints?.relationalHooks ?? pickStringArray(metadata, 'relationalHooks', 'relational_hooks')
  const inspirations = collectInspirations(details)
  const hashtags = collectHashtags(entry)
  const sentiment = getPrimarySentiment(entry)

  const summary = details?.summary ?? entry.summary ?? entry.body
  const title = details?.title ?? entry.title ?? 'Connection dream drop'

  const dreamBadges = normaliseHashtags([...categories, ...relationalHooks])

  return (
    <article className="group rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.35em] text-emerald-200">
          <HeartHandshake className="h-4 w-4" />
          <span>Connection dream</span>
        </div>
        {sentiment ? (
          <SentimentBadge label={sentiment.label} confidence={sentiment.confidence} />
        ) : (
          <SentimentBadge label="calibrating" confidence={0.42} muted />
        )}
      </header>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row">
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-2xl font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm text-slate-300">{summary}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
            {partnerName && (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1">
                <Sparkles className="h-3.5 w-3.5 text-emerald-200" />
                <span className="font-medium">{partnerName}</span>
                {partnerId && <span className="text-white/50">#{partnerId}</span>}
              </span>
            )}
            {tone && <span className="rounded-full border border-white/10 px-3 py-1 text-white/70">Tone: {tone}</span>}
            {highlightedEmotion && (
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-emerald-200">
                Emotion: {highlightedEmotion}
              </span>
            )}
            {formatConfidence(dreamConfidence) && (
              <span className="rounded-full border border-white/10 px-3 py-1 text-white/60">
                Confidence {formatConfidence(dreamConfidence)}
              </span>
            )}
          </div>

          {(dreamBadges.length > 0 || inspirations.length > 0 || hashtags.length > 0) && (
            <div className="space-y-2 text-xs">
              {dreamBadges.length > 0 && (
                <div className="flex flex-wrap gap-2 text-slate-300">
                  {dreamBadges.map((badge) => (
                    <span key={badge} className="rounded-full border border-white/20 px-3 py-1">
                      {badge}
                    </span>
                  ))}
                </div>
              )}
              {inspirations.length > 0 && (
                <div className="flex flex-wrap gap-2 text-slate-300">
                  {inspirations.map((chip) => (
                    <span key={chip} className="rounded-full bg-white/10 px-3 py-1 text-white/80">
                      Inspiration: {chip}
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
            <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
              <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Call to action</span>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-semibold text-emerald-200">{callToAction.label}</span>
                {callToAction.url && isSafeExternalUrl(callToAction.url) && (
                  <a
                    href={callToAction.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-200 transition hover:bg-emerald-500/20"
                  >
                    Open ritual
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-full max-w-md flex-none">
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
