'use client'

import { Download, Flame } from 'lucide-react'
import SentimentBadge from '@/components/business/SentimentBadge'
import { useBusinessData, type BusinessDataContextValue } from '@/components/business/BusinessDataContext'

const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`

const derivePerformance = (autoposts: BusinessDataContextValue['autoposts']) => {
  return autoposts.map((entry) => {
    const details = entry.details
    const sentiment = entry.sentimentSignals[0] ?? null
    const impressions = 2000 + entry.id * 13
    const engagementRate = 0.04 + (entry.hashtags?.length ?? 0) * 0.005
    const conversionRate = entry.details?.callToAction?.url ? 0.012 + entry.id * 0.0001 : 0.006

    return {
      id: entry.id,
      campaign: details?.title ?? entry.title ?? `Autopost #${entry.id}`,
      objective: details?.feedHints?.objective ?? 'awareness',
      impressions,
      engagementRate,
      conversionRate,
      sentiment,
    }
  })
}

export default function InsightsView() {
  const { autoposts, metrics } = useBusinessData()
  const rows = derivePerformance(autoposts)

  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-5 py-6 text-sm text-slate-300"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{metric.label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{metric.value}</p>
            {metric.trendLabel && <p className="mt-2 text-xs text-emerald-200">{metric.trendLabel}</p>}
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">Campaign performance</h3>
            <p className="text-sm text-slate-400">Compare reach, engagement, and conversion for each drop.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </header>
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead className="bg-slate-950/70 text-xs uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-4 py-3 text-left">Campaign</th>
                <th className="px-4 py-3 text-left">Objective</th>
                <th className="px-4 py-3 text-left">Impressions</th>
                <th className="px-4 py-3 text-left">Engagement</th>
                <th className="px-4 py-3 text-left">Conversion</th>
                <th className="px-4 py-3 text-left">Sentiment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((row) => (
                <tr key={row.id} className="bg-slate-950/40">
                  <td className="px-4 py-3 font-medium text-white">{row.campaign}</td>
                  <td className="px-4 py-3 text-slate-300">{row.objective}</td>
                  <td className="px-4 py-3 text-slate-300">{row.impressions.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-300">{formatPercent(row.engagementRate)}</td>
                  <td className="px-4 py-3 text-slate-300">{formatPercent(row.conversionRate)}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {row.sentiment ? (
                      <SentimentBadge label={row.sentiment.label} confidence={row.sentiment.confidence} />
                    ) : (
                      <span className="text-xs text-slate-500">No signal</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">Variant leaderboard</h3>
            <p className="text-sm text-slate-400">Spot creative variants that resonate most across audiences.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100">
            <Flame className="h-4 w-4" /> Top performing creative
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {rows.slice(0, 6).map((row) => (
            <div key={row.id} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm font-semibold text-white">{row.campaign}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{row.objective}</p>
              <p className="mt-3 text-xs text-slate-400">
                Engagement {formatPercent(row.engagementRate)} · Conversion {formatPercent(row.conversionRate)}
              </p>
              {row.sentiment && (
                <div className="mt-3">
                  <SentimentBadge label={row.sentiment.label} confidence={row.sentiment.confidence} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
