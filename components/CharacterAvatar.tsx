'use client'

import { motion, useMotionValue, useTransform } from 'framer-motion'
import Image from 'next/image'
import { useEffect } from 'react'

export interface CharacterAvatarProps {
  color: string
  intensity: number
}

export default function CharacterAvatar({ color, intensity }: CharacterAvatarProps) {
  const hue = useMotionValue(180)
  const filter = useTransform(hue, (value) => `hue-rotate(${value}deg)`)

  useEffect(() => {
    const match = color.match(/\d+/)
    const fallbackHue = 180
    const nextHue = match ? Number(match[0]) : fallbackHue

    hue.set(Number.isFinite(nextHue) ? nextHue : fallbackHue)
  }, [color, hue])

  const safeIntensity = Number.isFinite(intensity) ? Math.max(0, Math.min(intensity, 1)) : 0.5
  const glowRadius = 15 + safeIntensity * 40
  const transitionDuration = Math.max(0.8, 4 - safeIntensity * 2)

  return (
    <motion.div
      animate={{ scale: [1, 1 + safeIntensity * 0.1, 1] }}
      transition={{ repeat: Infinity, duration: transitionDuration, ease: 'easeInOut' }}
      style={{
        filter,
        boxShadow: `0 0 ${glowRadius}px ${color}`,
        transition: 'filter 0.6s ease',
      }}
      className="avatar-wrapper"
    >
      <Image src="/avatars/mirai.svg" alt="Mirai" width={220} height={220} priority />
    </motion.div>
  )
}
