'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useAutopostQueue } from '@/lib/hooks/useAutopostQueue'
import type {
  AutopostQueueEntry,
  BusinessMetric,
  BusinessProfile,
  BusinessFeatureFlags,
  SentimentSnapshot,
} from '@/types/business'

export interface BusinessDataContextValue {
  company: BusinessProfile
  autoposts: AutopostQueueEntry[]
  loadingAutoposts: boolean
  autopostError: string | null
  sentiment: SentimentSnapshot
  metrics: BusinessMetric[]
  featureFlags: BusinessFeatureFlags
  refreshAutoposts: () => void
}

const BusinessDataContext = createContext<BusinessDataContextValue | null>(null)

const defaultFeatureFlags: BusinessFeatureFlags = {
  proModeEnabled: true,
  sentimentSharingEnabled: true,
  aiCreativePreview: true,
}

const buildSentimentSnapshot = (entries: AutopostQueueEntry[]): SentimentSnapshot => {
  if (entries.length === 0) {
    return {
      dominant: null,
      aggregate: [],
      trend: [],
      updatedAt: null,
    }
  }

  const signals: Record<string, { label: string; total: number; count: number }> = {}
  const trend: number[] = []

  entries.forEach((entry, index) => {
    const entrySignals = entry.sentimentSignals
    if (entrySignals.length === 0) {
      return
    }

    entrySignals.forEach((signal) => {
      const key = signal.label.toLowerCase()
      if (!signals[key]) {
        signals[key] = { label: signal.label, total: 0, count: 0 }
      }
      signals[key].total += signal.confidence
      signals[key].count += 1
    })

    const primary = entrySignals[0]
    trend.push(Math.round(primary.confidence * 100))

    if (trend.length > 12) {
      trend.shift()
    }
  })

  const aggregate = Object.values(signals)
    .map((value) => ({
      label: value.label,
      confidence: value.total / Math.max(1, value.count),
    }))
    .sort((a, b) => b.confidence - a.confidence)

  return {
    dominant: aggregate[0] ?? null,
    aggregate,
    trend,
    updatedAt: entries[0]?.updatedAt ?? null,
  }
}

const buildMetrics = (entries: AutopostQueueEntry[]): BusinessMetric[] => {
  const totalScheduled = entries.filter((entry) => entry.status === 'scheduled').length
  const totalPublishing = entries.filter((entry) => entry.status === 'publishing').length
  const totalPublished = entries.filter((entry) => entry.status === 'published').length
  const promotedCount = entries.filter((entry) => entry.isPromoted).length

  return [
    {
      id: 'active-campaigns',
      label: 'Active campaigns',
      value: `${promotedCount}`,
      trendLabel: promotedCount > 0 ? 'Running' : 'Spin one up',
      trendDirection: promotedCount > 0 ? 'up' : 'flat',
    },
    {
      id: 'scheduled-drops',
      label: 'Scheduled drops',
      value: `${totalScheduled}`,
      trendLabel: 'Queue health',
      trendDirection: totalScheduled > 3 ? 'up' : 'flat',
    },
    {
      id: 'publishing',
      label: 'Publishing now',
      value: `${totalPublishing}`,
      trendLabel: 'Live in feed',
      trendDirection: totalPublishing > 0 ? 'up' : 'flat',
    },
    {
      id: 'published',
      label: 'Published',
      value: `${totalPublished}`,
      trendLabel: 'Historical',
      trendDirection: 'flat',
    },
  ]
}

interface BusinessDataProviderProps {
  company: BusinessProfile
  children: ReactNode
}

export function BusinessDataProvider({ company, children }: BusinessDataProviderProps) {
  const { entries, loading, error, refresh } = useAutopostQueue({ status: 'all', limit: 50 })

  const sentiment = useMemo(() => buildSentimentSnapshot(entries), [entries])
  const metrics = useMemo(() => buildMetrics(entries), [entries])

  const value = useMemo<BusinessDataContextValue>(
    () => ({
      company,
      autoposts: entries,
      loadingAutoposts: loading,
      autopostError: error,
      sentiment,
      metrics,
      featureFlags: defaultFeatureFlags,
      refreshAutoposts: refresh,
    }),
    [company, entries, error, loading, sentiment, metrics, refresh],
  )

  return <BusinessDataContext.Provider value={value}>{children}</BusinessDataContext.Provider>
}

export const useBusinessData = () => {
  const context = useContext(BusinessDataContext)
  if (!context) {
    throw new Error('useBusinessData must be used within BusinessDataProvider')
  }
  return context
}
