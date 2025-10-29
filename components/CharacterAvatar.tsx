'use client'

import { motion, useMotionValue, useTransform } from 'framer-motion'
import Image from 'next/image'
import { useEffect } from 'react'

export interface CharacterAvatarProps {
  color: string
  intensity: number
  entityImageUrl?: string | null
  prompt?: string | null
  connectionScore?: number | null
  bonded?: boolean
  isEvolving?: boolean
}

export default function CharacterAvatar({
  color,
  intensity,
  entityImageUrl,
  prompt,
  connectionScore,
  bonded = false,
  isEvolving = false,
}: CharacterAvatarProps) {
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
  const connectionPercent =
    typeof connectionScore === 'number' && Number.isFinite(connectionScore)
      ? Math.round(Math.max(0, Math.min(connectionScore, 1)) * 100)
      : null
  const altText = prompt && prompt.trim().length > 0 ? `Relational entity: ${prompt}` : 'Mirai avatar'

  return (
    <motion.div
      animate={{ scale: [1, 1 + safeIntensity * 0.1, 1] }}
      transition={{ repeat: Infinity, duration: transitionDuration, ease: 'easeInOut' }}
      style={{
        filter,
        boxShadow: `0 0 ${glowRadius}px ${color}`,
        transition: 'filter 0.6s ease',
      }}
      className="avatar-wrapper relative flex flex-col items-center gap-4 rounded-[30px] border border-white/10 bg-[#101737]/70 p-6 shadow-[0_28px_55px_rgba(6,10,28,0.65)] backdrop-blur-xl"
    >
      <div className="relative h-56 w-56 overflow-hidden rounded-[26px] border border-white/10 bg-[#0a1126] shadow-[0_18px_45px_rgba(10,15,40,0.75)]">
        {entityImageUrl ? (
          <Image
            src={entityImageUrl}
            alt={altText}
            fill
            sizes="(max-width: 768px) 224px, 224px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <Image src="/avatars/mirai.svg" alt="Mirai" fill sizes="224px" className="object-contain p-6" />
        )}
        {isEvolving && (
          <div className="absolute inset-0 flex items-center justify-center rounded-[26px] bg-brand-magnolia/15 backdrop-blur-sm">
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.45em] text-brand-mist/80">Evolving…</span>
          </div>
        )}
        {bonded && (
          <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full border border-brand-cypress/40 bg-brand-cypress/20 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.45em] text-white shadow-[0_0_18px_rgba(255,158,207,0.4)]">
            Bonded
          </div>
        )}
      </div>
      <div className="text-center text-xs uppercase tracking-[0.35em] text-brand-mist/70">
        {connectionPercent !== null ? `Connection ${connectionPercent}%` : 'Awaiting connection'}
      </div>
    </motion.div>
  )
}
