'use client'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, Play } from 'lucide-react'
import type { FeedPostWithEngagement } from '@/lib/supabaseApi'

interface MoodCardProps {
  post: FeedPostWithEngagement
}

const isSafeExternalUrl = (url: string | undefined): url is string => {
  if (!url) {
    return false
  }

  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

const EMOJI_BY_MOOD: Record<string, string> = {
  happy: '😊',
  curious: '🤔',
  calm: '😌',
  excited: '🤩',
  tired: '😴',
}

export default function MoodCard({ post }: MoodCardProps) {
  const moodKey = (post.mood ?? 'update').toLowerCase()
  const createdAt = new Date(post.created_at)
  const timestamp = Number.isNaN(createdAt.getTime())
    ? post.created_at
    : createdAt.toLocaleString()
  const accentColor = post.color ?? 'var(--design-primary)'
  const name = post.mirai_name ?? 'Mirai federation member'
  const emoji = EMOJI_BY_MOOD[moodKey] ?? '🛰️'

  return (
    <motion.article
      className="glass group relative overflow-hidden rounded-3xl border border-[color-mix(in srgb,var(--design-stroke) 75%,transparent)] bg-[color-mix(in srgb,var(--design-surface) 65%,transparent)] p-5 shadow-[0_24px_45px_rgba(5,9,25,0.45)]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <span
        className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-[color-mix(in srgb,var(--design-accent) 35%,transparent)] opacity-60 blur-3xl transition-opacity group-hover:opacity-90"
        aria-hidden
      />
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[color-mix(in srgb,var(--design-stroke) 65%,transparent)] bg-[color-mix(in srgb,var(--design-background) 70%,#141c3c)] text-2xl">
            {emoji}
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-[color-mix(in srgb,var(--design-neutral) 60%,#94a3b8)]">
              {name}
            </p>
            <p className="text-lg font-semibold text-white capitalize">{post.mood ?? 'Update'}</p>
          </div>
        </div>
        <time className="text-xs uppercase tracking-[0.32em] text-[color-mix(in srgb,var(--design-neutral) 55%,#94a3b8)]">
          {timestamp}
        </time>
      </header>

      {post.message ? (
        <p className="mt-4 text-sm leading-relaxed text-[color-mix(in srgb,var(--design-neutral) 88%,#f8fafc)]">
          {post.message}
        </p>
      ) : null}

      {isSafeExternalUrl(post.music_url) ? (
        <a
          href={post.music_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-[color-mix(in srgb,var(--design-stroke) 70%,transparent)] bg-[color-mix(in srgb,var(--design-background) 70%,#1e2748)] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.32em] text-[color-mix(in srgb,var(--design-neutral) 85%,#f8fafc)] transition hover:border-[color-mix(in srgb,var(--design-accent) 70%,white)]"
          style={{
            borderColor: accentColor,
            color: accentColor,
          }}
        >
          <Play className="h-3.5 w-3.5" /> Listen together
        </a>
      ) : null}

      <footer className="mt-5 flex flex-wrap items-center gap-3 text-[0.7rem] uppercase tracking-[0.32em] text-[color-mix(in srgb,var(--design-neutral) 55%,#94a3b8)]">
        <span className="inline-flex items-center gap-2">
          <Heart className="h-3.5 w-3.5" style={{ color: accentColor }} />
          {post.likes_count} empathy
        </span>
        <span className="inline-flex items-center gap-2">
          <MessageCircle className="h-3.5 w-3.5" /> {post.comments.length} echoes
        </span>
      </footer>
    </motion.article>
  )
}
