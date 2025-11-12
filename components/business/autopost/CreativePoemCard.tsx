'use client'

import { Feather, Quote } from 'lucide-react'
import SentimentBadge from '@/components/business/SentimentBadge'
import {
  collectHashtags,
  collectInspirations,
  getCallToAction,
  getPrimarySentiment,
  isSafeExternalUrl,
} from '@/components/business/autopost/utils'
import type { AutopostQueueEntry } from '@/types/business'

interface CreativePoemCardProps {
  entry: AutopostQueueEntry
}

const parseStanzas = (body: string): string[][] => {
  if (!body) return []
  return body
    .trim()
    .split(/\n{2,}/)
    .map((stanza) => stanza.split(/\n+/).map((line) => line.trim()).filter((line) => line.length > 0))
    .filter((lines) => lines.length > 0)
}

export default function CreativePoemCard({ entry }: CreativePoemCardProps) {
  const details = entry.details
  const sentiment = getPrimarySentiment(entry)
  const callToAction = getCallToAction(entry, details)
  const inspirations = collectInspirations(details)
  const hashtags = collectHashtags(entry)

  const body = details?.body ?? entry.body ?? ''
  const summary = details?.summary ?? entry.summary
  const stanzas = parseStanzas(body)

  return (
    <article className="group rounded-3xl border border-white/10 bg-slate-950/80 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.35em] text-emerald-200">
          <Feather className="h-4 w-4" />
          <span>Creative poem</span>
        </div>
        {sentiment ? (
          <SentimentBadge label={sentiment.label} confidence={sentiment.confidence} />
        ) : (
          <SentimentBadge label="calibrating" confidence={0.4} muted />
        )}
      </header>

      <div className="mt-4 space-y-4">
        <div>
          <h3 className="text-2xl font-semibold text-white">{details?.title ?? entry.title ?? 'Poetic drop'}</h3>
          {summary && <p className="mt-2 text-sm text-slate-300">{summary}</p>}
        </div>

        <div className="space-y-6 rounded-3xl border border-white/10 bg-black/40 px-6 py-6 text-slate-100">
          {stanzas.length > 0 ? (
            stanzas.map((lines, index) => (
              <div key={index} className="relative pl-6">
                <Quote className="absolute left-0 top-1 h-4 w-4 text-emerald-200" />
                <p className="whitespace-pre-wrap text-base leading-relaxed">
                  {lines.map((line, lineIndex) => (
                    <span key={lineIndex} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-300">{body || 'Awaiting AI verse…'}</p>
          )}
        </div>

        {(inspirations.length > 0 || hashtags.length > 0) && (
          <div className="flex flex-wrap gap-3 text-xs">
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
                Explore
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
