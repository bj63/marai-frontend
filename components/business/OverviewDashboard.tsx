'use client'

import Image from 'next/image'
import { ArrowUpRight, Users } from 'lucide-react'
import AutopostCard from '@/components/business/autopost/AutopostCard'
import QueueTimeline from '@/components/business/QueueTimeline'
import SentimentBadge from '@/components/business/SentimentBadge'
import { useBusinessData } from '@/components/business/BusinessDataContext'

export default function OverviewDashboard() {
  const { company, metrics, sentiment, autoposts, loadingAutoposts, autopostError } = useBusinessData()
  const heroImage = company.heroImageUrl ?? null
  const promoted = autoposts.filter((entry) => entry.isPromoted)
  const featured = promoted[0] ?? autoposts[0] ?? null

  return (
    <div className="flex flex-col gap-10">
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        <div className="relative h-60 w-full">
          {heroImage ? (
            <Image
              src={heroImage}
              alt={company.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end gap-3 p-10 text-white">
            <div className="flex items-center gap-3 text-sm text-emerald-200">
              <Users className="h-5 w-5" />
              {company.verified ? 'Verified partner' : 'Business workspace'}
            </div>
            <h2 className="text-4xl font-semibold">{company.name}</h2>
            <p className="max-w-xl text-sm text-slate-200">{company.tagline}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-200">
              {company.sectors?.map((sector) => (
                <span key={sector} className="rounded-full border border-white/20 bg-black/30 px-3 py-1">
                  {sector}
                </span>
              ))}
              {sentiment.dominant && (
                <SentimentBadge
                  label={sentiment.dominant.label}
                  confidence={sentiment.dominant.confidence}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-5 py-6 text-sm text-slate-300"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{metric.label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{metric.value}</p>
            {metric.trendLabel && (
              <p className="mt-2 flex items-center gap-2 text-xs text-emerald-200">
                <ArrowUpRight className="h-4 w-4" />
                {metric.trendLabel}
              </p>
            )}
          </div>
        ))}
      </section>

      {featured && (
        <section>
          <h3 className="text-lg font-semibold text-white">Featured campaign</h3>
          <p className="mt-1 text-sm text-slate-400">
            Preview the most recent promoted drop with CTA metadata and sentiment markers.
          </p>
          <div className="mt-4">
            <AutopostCard entry={featured} />
          </div>
        </section>
      )}

      <section>
        <QueueTimeline entries={autoposts} loading={loadingAutoposts} error={autopostError} />
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold text-white">Sentiment trend</h3>
        <p className="mt-1 text-sm text-slate-400">
          Track how employees feel about live campaigns across the last twelve drops.
        </p>
        <div className="mt-6 grid gap-2 sm:grid-cols-12">
          {sentiment.trend.length === 0 && (
            <p className="text-sm text-slate-400">No emotion data yet. Invite teammates to share reflections.</p>
          )}
          {sentiment.trend.map((value, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div className="flex h-24 w-6 items-end overflow-hidden rounded-full bg-slate-900/70">
                <div
                  className="w-full rounded-full bg-emerald-400/70"
                  style={{ height: `${Math.max(10, value)}%` }}
                />
              </div>
              <span className="text-xs text-slate-500">#{index + 1}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
