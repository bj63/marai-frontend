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

  const style: CSSProperties = {
    ['--emotion-color' as const]: data.color,
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
      <p>Energy: {energy}%</p>
      <p>Creativity: {creativity}%</p>
    </motion.div>
  )
}
