'use client'

import { motion } from 'framer-motion'
import type { CSSProperties } from 'react'
import type { AnalyzeTimelineEntry } from '@/lib/api'

export type TimelineEntry = AnalyzeTimelineEntry

interface TimelineCardProps {
  data: TimelineEntry
}

export default function TimelineCard({ data }: TimelineCardProps) {
  const energy = Math.round((data.personality?.energy ?? 0) * 100)
  const creativity = Math.round((data.personality?.creativity ?? 0) * 100)
  const intensity =
    typeof data.intensity === 'number' && Number.isFinite(data.intensity)
      ? Math.round(Math.max(0, Math.min(data.intensity, 1)) * 100)
      : null
  const timestampLabel = data.timestamp ? new Date(data.timestamp).toLocaleString() : null
  const summary = data.summary && data.summary.trim().length > 0 ? data.summary : null

  const style: CSSProperties & { ['--emotion-color']?: string } = {
    '--emotion-color': data.color,
  }

  return (
    <motion.div
      className="card"
      style={style}
      whileHover={{ scale: 1.05, rotateY: 5 }}
    >
      <div className="card-holo" />
      <h3>{data.emotion}</h3>
      <div className="color-swatch" style={{ background: data.color }} />
      {timestampLabel && <p className="text-[0.65rem] uppercase tracking-[0.35em] text-brand-mist/40">{timestampLabel}</p>}
      <p>Energy: {energy}%</p>
      <p>Creativity: {creativity}%</p>
      {intensity !== null && <p>Intensity: {intensity}%</p>}
      {summary && <p className="text-xs leading-snug text-brand-mist/70">{summary}</p>}
    </motion.div>
  )
}
