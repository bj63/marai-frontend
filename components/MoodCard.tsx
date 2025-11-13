'use client'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, Play } from 'lucide-react'
import type { FeedPostWithEngagement } from '@/lib/supabaseApi'
import { extractAutopostDetails, type AutopostDetails } from '@/lib/autopost'

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

const CREATIVE_LABELS: Record<string, string> = {
  poem: 'Poetic drop',
  story: 'Story drop',
  dreamvideo: 'Connection dream',
  'dream-video': 'Connection dream',
  imageart: 'Image art drop',
  'image-art': 'Image art drop',
}

const normaliseHashtag = (value: string): string => {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`
}

const toTrimmedString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value.trim() : undefined

const renderObjectPreview = (value: unknown) => {
  if (!value) return null
  try {
    return JSON.stringify(value, null, 2)
  } catch (error) {
    return String(value)
  }
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
  const autopost: AutopostDetails | null = useMemo(() => {
    const base = extractAutopostDetails(post.metadata)
    if (!base) return null
    return {
      ...base,
      body: base.body ?? post.message ?? null,
      hashtags: base.hashtags?.map(normaliseHashtag) ?? [],
    }
  }, [post.metadata, post.message])

  const callToActionLabel = toTrimmedString(autopost?.callToAction?.label)
  const callToActionUrl = toTrimmedString(autopost?.callToAction?.url)
  const creativeType = autopost?.creativeType?.toLowerCase()
  const creativeLabel = creativeType ? CREATIVE_LABELS[creativeType] ?? autopost?.creativeType ?? null : null
  const autopostHashtags = autopost?.hashtags?.map((value) => normaliseHashtag(value)).filter(Boolean) ?? []
  const autopostInspirations = autopost?.inspirations ?? []
  const connectionDreamPreview = renderObjectPreview(autopost?.connectionDream)
  const adaptiveProfilePreview = renderObjectPreview(autopost?.adaptiveProfile)
  const feedHintsPreview = renderObjectPreview(autopost?.feedHints)

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

      {autopost ? (
        <div className="mt-4 space-y-3 rounded-2xl border border-[color-mix(in srgb,var(--design-stroke) 65%,transparent)] bg-[color-mix(in srgb,var(--design-background) 75%,#141c3c)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-[0.32em] text-[color-mix(in srgb,var(--design-neutral) 60%,#94a3b8)]">
            <span className="inline-flex items-center gap-2 font-semibold text-[color-mix(in srgb,var(--design-accent) 80%,#86f2d1)]">
              {creativeLabel ?? 'Creative drop'}
            </span>
            {autopost.audience ? <span>Audience: {autopost.audience}</span> : null}
          </div>
          {autopost.title ? <h3 className="text-lg font-semibold text-white">{autopost.title}</h3> : null}
          {autopost.summary && autopost.summary !== autopost.body ? (
            <p className="text-sm leading-relaxed text-[color-mix(in srgb,var(--design-neutral) 85%,#e2e8f0)]">{autopost.summary}</p>
          ) : null}
          {autopost.body && autopost.summary !== autopost.body ? (
            <p className="text-sm leading-relaxed text-[color-mix(in srgb,var(--design-neutral) 80%,#dbeafe)]">{autopost.body}</p>
          ) : null}

          {autopostInspirations.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[0.7rem] uppercase tracking-[0.32em] text-[color-mix(in srgb,var(--design-neutral) 60%,#94a3b8)]">
                Inspirations
              </p>
              <ul className="flex flex-wrap gap-2 text-sm text-[color-mix(in srgb,var(--design-neutral) 85%,#f8fafc)]">
                {autopostInspirations.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-[color-mix(in srgb,var(--design-stroke) 60%,transparent)] bg-[color-mix(in srgb,var(--design-background) 70%,#1b2544)] px-3 py-1"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {autopostHashtags.length > 0 ? (
            <div className="space-y-1">
              <p className="text-[0.7rem] uppercase tracking-[0.32em] text-[color-mix(in srgb,var(--design-neutral) 60%,#94a3b8)]">
                Hashtags
              </p>
              <div className="flex flex-wrap gap-2 text-sm text-[color-mix(in srgb,var(--design-accent) 80%,#86f2d1)]">
                {autopostHashtags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[color-mix(in srgb,var(--design-stroke) 60%,transparent)] bg-[color-mix(in srgb,var(--design-background) 70%,#1b2544)] px-3 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {adaptiveProfilePreview ? (
            <div className="space-y-1">
              <p className="text-[0.7rem] uppercase tracking-[0.32em] text-[color-mix(in srgb,var(--design-neutral) 60%,#94a3b8)]">
                Adaptive profile
              </p>
              <pre className="max-h-40 overflow-auto rounded-2xl border border-[color-mix(in srgb,var(--design-stroke) 60%,transparent)] bg-[color-mix(in srgb,var(--design-background) 75%,#151f3d)] p-3 text-xs text-[color-mix(in srgb,var(--design-neutral) 80%,#dbeafe)]">
                {adaptiveProfilePreview}
              </pre>
            </div>
          ) : null}

          {feedHintsPreview ? (
            <div className="space-y-1">
              <p className="text-[0.7rem] uppercase tracking-[0.32em] text-[color-mix(in srgb,var(--design-neutral) 60%,#94a3b8)]">
                Feed hints
              </p>
              <pre className="max-h-32 overflow-auto rounded-2xl border border-[color-mix(in srgb,var(--design-stroke) 60%,transparent)] bg-[color-mix(in srgb,var(--design-background) 75%,#151f3d)] p-3 text-xs text-[color-mix(in srgb,var(--design-neutral) 80%,#dbeafe)]">
                {feedHintsPreview}
              </pre>
            </div>
          ) : null}

          {connectionDreamPreview ? (
            <div className="space-y-1">
              <p className="text-[0.7rem] uppercase tracking-[0.32em] text-[color-mix(in srgb,var(--design-neutral) 60%,#94a3b8)]">
                Connection dream
              </p>
              <pre className="max-h-32 overflow-auto rounded-2xl border border-[color-mix(in srgb,var(--design-stroke) 60%,transparent)] bg-[color-mix(in srgb,var(--design-background) 75%,#151f3d)] p-3 text-xs text-[color-mix(in srgb,var(--design-neutral) 80%,#dbeafe)]">
                {connectionDreamPreview}
              </pre>
            </div>
          ) : null}

          {isSafeExternalUrl(autopost?.assetUrl ?? undefined) || isSafeExternalUrl(autopost?.mediaUrl ?? undefined) ? (
            <a
              href={autopost?.assetUrl ?? autopost?.mediaUrl ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center rounded-full border border-[color-mix(in srgb,var(--design-accent) 60%,#86f2d1)] bg-[color-mix(in srgb,var(--design-background) 70%,#1c2644)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-[color-mix(in srgb,var(--design-accent) 80%,#86f2d1)] transition hover:border-[color-mix(in srgb,var(--design-accent) 85%,white)]"
            >
              View creative asset
            </a>
          ) : null}

          {callToActionLabel && isSafeExternalUrl(callToActionUrl ?? undefined) ? (
            <a
              href={callToActionUrl ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center rounded-full bg-[color-mix(in srgb,var(--design-accent) 80%,#86f2d1)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-[#0b1024] transition hover:bg-[color-mix(in srgb,var(--design-accent) 90%,white)]"
            >
              {callToActionLabel}
            </a>
          ) : null}
        </div>
      ) : null}

      {isSafeExternalUrl(post.music_url ?? undefined) ? (
        <a
          href={post.music_url ?? undefined}
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
