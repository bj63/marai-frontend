'use client'

import { CalendarRange, Mail, Radar } from 'lucide-react'
import SentimentBadge from '@/components/business/SentimentBadge'
import { useBusinessData } from '@/components/business/BusinessDataContext'

export default function AnalyticsView() {
  const { sentiment, autoposts } = useBusinessData()

  const scheduledReports = [
    {
      id: 'weekly-campaign',
      label: 'Weekly campaign digest',
      cadence: 'Every Monday 8am',
      recipients: ['growth@marai.studio', 'founder@marai.studio'],
    },
    {
      id: 'sentiment-scan',
      label: 'Employee sentiment pulse',
      cadence: 'Daily 6pm',
      recipients: ['people@marai.studio'],
    },
  ]

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold text-white">Emotion analytics</h3>
        <p className="mt-1 text-sm text-slate-400">Aggregate emotion signals across active campaigns.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {sentiment.aggregate.length === 0 && (
            <p className="text-sm text-slate-400">No sentiment captured yet. Publish a campaign to see signals.</p>
          )}
          {sentiment.aggregate.map((signal) => (
            <div key={signal.label} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm font-semibold text-white capitalize">{signal.label}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-500">Dominant signal</p>
              <div className="mt-4">
                <SentimentBadge label={signal.label} confidence={signal.confidence} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">Data destinations</h3>
            <p className="text-sm text-slate-400">
              Mirror queue metadata into dashboards, emails, or external warehouses without schema migrations.
            </p>
          </div>
          <Radar className="h-10 w-10 text-emerald-300" />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
            <h4 className="text-sm font-semibold text-white">Supabase JSON feed</h4>
            <p className="mt-2 text-sm text-slate-300">
              Every autopost stores metadata, CTA, and emotionState in JSON payloads. Fetch them directly for analytics.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-xl bg-black/40 p-4 text-xs text-emerald-200">
{`SELECT metadata->'autopost'->'feedHints' AS feed_hints,
       metadata->'adCampaign' AS campaign,
       emotionState
FROM autopost_queue
ORDER BY createdAt DESC;`}
            </pre>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
            <h4 className="text-sm font-semibold text-white">Scheduled reports</h4>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-slate-300">
              {scheduledReports.map((report) => (
                <li key={report.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{report.label}</p>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{report.cadence}</p>
                    </div>
                    <Mail className="h-4 w-4 text-emerald-300" />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">{report.recipients.join(', ')}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <CalendarRange className="h-5 w-5 text-emerald-300" />
            <h3 className="text-lg font-semibold text-white">Queue release log</h3>
          </div>
          <ul className="flex flex-col gap-3 text-sm text-slate-300">
            {autoposts.slice(0, 8).map((entry) => (
              <li key={entry.id} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{entry.details?.title ?? entry.title ?? `Drop ${entry.id}`}</span>
                  <span className="text-xs text-slate-500">{new Date(entry.scheduledAt).toLocaleString()}</span>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Status: {entry.status} · CTA {entry.details?.callToAction?.label ?? entry.callToAction?.label ?? 'n/a'}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
