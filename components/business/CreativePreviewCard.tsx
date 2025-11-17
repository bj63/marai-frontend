'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, MessageCircle, Send, Sparkles } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import SentimentBadge from '@/components/business/SentimentBadge'
import type { AutopostQueueEntry } from '@/types/business'
import AuthControls from '@/components/navigation/AuthControls'

interface CreativePreviewCardProps {
  entry: AutopostQueueEntry | null
}

export default function CreativePreviewCard({ entry }: CreativePreviewCardProps) {
  const { user } = useAuth()

  const displayName = (() => {
    const username = user?.user_metadata?.username
    if (typeof username === 'string' && username.trim().length > 0) {
      return username.trim()
    }

    const fullName = user?.user_metadata?.full_name ?? user?.user_metadata?.name
    if (typeof fullName === 'string' && fullName.trim().length > 0) {
      return fullName.trim()
    }

    return user?.email ?? 'MarAI User'
  })()

  if (!entry) {
    return (
      <div className="flex h-full min-h-[480px] items-center justify-center rounded-3xl border border-dashed border-white/20 bg-slate-950/50 p-10 text-center text-sm text-slate-400">
        <div className="mx-auto flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
            <Sparkles className="h-6 w-6" />
          </div>
          <p className="mt-4 font-semibold text-white">Preview your AI creative</p>
          <p className="mt-2 text-sm text-slate-400">
            Generate a campaign brief to see copy, CTA, and metadata before it hits the queue.
          </p>
        </div>
      </div>
    )
  }

  const details = entry.details
  const sentiment = entry.sentimentSignals[0]
  const poster = details?.posterUrl ?? entry.posterUrl ?? details?.assetUrl ?? entry.assetUrl ?? null

  return (
    <div className="relative aspect-[9/16] w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
      {poster ? (
        <Image
          src={poster}
          alt={details?.title ?? 'Campaign poster'}
          fill
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-slate-800">
          <p className="text-sm text-slate-400">No media asset</p>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

      <div className="absolute inset-x-0 top-0 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AuthControls />
            <span className="text-sm font-semibold text-white">{displayName}</span>
          </div>
          {sentiment && <SentimentBadge label={sentiment.label} confidence={sentiment.confidence} />}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <h3 className="text-lg font-bold">{details?.title ?? entry.title}</h3>
        <p className="mt-1 text-sm">{entry.body}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          {details?.hashtags?.map((tag) => (
            <span key={tag} className="rounded-full bg-white/10 px-2 py-1">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2">
              <Heart className="h-6 w-6" />
              <span className="text-sm">1.2k</span>
            </button>
            <button className="flex items-center gap-2">
              <MessageCircle className="h-6 w-6" />
              <span className="text-sm">241</span>
            </button>
            <button>
              <Send className="h-6 w-6" />
            </button>
          </div>
          {details?.callToAction?.url && (
            <a
              href={details.callToAction.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white px-4 py-2 text-sm font-bold text-black"
            >
              {details?.callToAction?.label ?? entry.callToAction?.label ?? 'Learn More'}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
