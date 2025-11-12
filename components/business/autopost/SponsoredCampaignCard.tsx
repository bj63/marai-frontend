'use client'

import { BadgeDollarSign, Megaphone, Target } from 'lucide-react'
import SentimentBadge from '@/components/business/SentimentBadge'
import AutopostMedia from '@/components/business/autopost/AutopostMedia'
import {
  collectHashtags,
  collectInspirations,
  getCallToAction,
  getPrimarySentiment,
  isSafeExternalUrl,
  mergeFeedHints,
  pickNumber,
  pickRecord,
  pickString,
  pickStringArray,
} from '@/components/business/autopost/utils'
import type { AutopostQueueEntry, SentimentSignal } from '@/types/business'

interface SponsoredCampaignCardProps {
  entry: AutopostQueueEntry
  metadata: Record<string, unknown> | null
}

const parseSentiment = (value: Record<string, unknown> | null): SentimentSignal | null => {
  if (!value) return null
  const labelCandidate = value.label
  const confidenceCandidate = value.confidence
  const label = typeof labelCandidate === 'string' ? labelCandidate : null
  const confidence =
    typeof confidenceCandidate === 'number' && Number.isFinite(confidenceCandidate)
      ? Math.max(0, Math.min(1, confidenceCandidate))
      : null
  if (!label) return null
  return {
    label,
    confidence: confidence ?? 0.5,
  }
}

const formatBudget = (value: number | string | null): string | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    return value
  }
  return null
}

export default function SponsoredCampaignCard({ entry, metadata }: SponsoredCampaignCardProps) {
  const details = entry.details
  const metadataRecord = metadata
  const campaignRecord = pickRecord(metadataRecord, 'adCampaign', 'campaign', 'ad_campaign')
  const companySentimentRecord = pickRecord(metadataRecord, 'companySentiment', 'company_sentiment')
  const sentiment = getPrimarySentiment(entry)
  const companySentiment = parseSentiment(companySentimentRecord)
  const callToAction = getCallToAction(entry, details)
  const feedHints = mergeFeedHints(entry, details)
  const inspirations = collectInspirations(details)
  const hashtags = collectHashtags(entry)

  const campaignId = feedHints?.campaignId ?? pickString(campaignRecord, 'campaignId', 'id')
  const campaignName =
    pickString(campaignRecord, 'campaignName', 'name', 'title') ?? feedHints?.brand ?? details?.title ?? entry.title
  const objective = feedHints?.objective ?? pickString(campaignRecord, 'objective', 'goal')
  const headline = pickString(campaignRecord, 'headline', 'title') ?? details?.title ?? entry.title
  const script = pickString(campaignRecord, 'script', 'body') ?? details?.summary ?? entry.summary ?? entry.body
  const budget =
    formatBudget(pickNumber(campaignRecord, 'budget', 'spend', 'spendCap') ?? pickString(campaignRecord, 'budget'))
  const targetPersonas = pickStringArray(campaignRecord, 'targetPersonas', 'personas', 'targets', 'audience')
  const relationalHooks = feedHints?.relationalHooks ?? pickStringArray(metadataRecord, 'relationalHooks', 'relational_hooks')

  return (
    <article className="group rounded-3xl border border-white/10 bg-white/5 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.35em] text-emerald-200">
          <Megaphone className="h-4 w-4" />
          <span>Sponsored campaign</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {campaignId && (
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">{campaignId}</span>
          )}
          {sentiment ? (
            <SentimentBadge label={sentiment.label} confidence={sentiment.confidence} />
          ) : (
            <SentimentBadge label="calibrating" confidence={0.44} muted />
          )}
        </div>
      </header>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_minmax(0,1fr)]">
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Campaign</p>
            <h3 className="text-2xl font-semibold text-white">{campaignName}</h3>
            {objective && <p className="mt-1 text-xs text-slate-400">Objective: {objective}</p>}
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-5 py-4 text-sm text-slate-200">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Headline</p>
            <p className="mt-2 text-lg font-semibold text-white">{headline ?? 'Untitled drop'}</p>
            <p className="mt-3 whitespace-pre-wrap text-sm text-slate-300">{script}</p>
          </div>

          {(inspirations.length > 0 || relationalHooks.length > 0) && (
            <div className="flex flex-wrap gap-2 text-xs">
              {relationalHooks.map((hook) => (
                <span key={hook} className="rounded-full border border-white/10 px-3 py-1 text-slate-200">
                  {hook}
                </span>
              ))}
              {inspirations.map((chip) => (
                <span key={chip} className="rounded-full bg-white/10 px-3 py-1 text-slate-100">
                  Inspiration: {chip}
                </span>
              ))}
            </div>
          )}

          {(targetPersonas.length > 0 || budget) && (
            <div className="grid gap-3 sm:grid-cols-2">
              {targetPersonas.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-200">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Target className="h-3.5 w-3.5" />
                    Target personas
                  </div>
                  <ul className="mt-2 space-y-1 text-sm text-white">
                    {targetPersonas.map((persona) => (
                      <li key={persona}>{persona}</li>
                    ))}
                  </ul>
                </div>
              )}
              {budget && (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-200">
                  <div className="flex items-center gap-2 text-slate-400">
                    <BadgeDollarSign className="h-3.5 w-3.5" />
                    Budget
                  </div>
                  <p className="mt-2 text-lg font-semibold text-emerald-200">{budget}</p>
                </div>
              )}
            </div>
          )}

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
                  Visit site
                </a>
              )}
            </div>
          )}

          {companySentiment && (
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <span className="uppercase tracking-[0.3em] text-slate-500">Company sentiment</span>
              <SentimentBadge label={companySentiment.label} confidence={companySentiment.confidence} />
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
