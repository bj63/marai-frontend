'use client'

import { Sparkles } from 'lucide-react'

interface SentimentBadgeProps {
  label: string
  confidence: number
  muted?: boolean
}

const formatConfidence = (value: number) => `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`

export default function SentimentBadge({ label, confidence, muted = false }: SentimentBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${
        muted
          ? 'border-slate-600 bg-slate-800/70 text-slate-300'
          : 'border-emerald-400/50 bg-emerald-500/10 text-emerald-200'
      }`}
    >
      <Sparkles className="h-3.5 w-3.5" />
      <span className="font-medium capitalize">{label}</span>
      <span className="text-xs uppercase tracking-wide text-white/70">{formatConfidence(confidence)}</span>
    </span>
  )
}
