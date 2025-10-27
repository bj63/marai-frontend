'use client'

import type { ReactNode } from 'react'

export interface FeedPostProps {
  id: string
  author: {
    name: string
    avatar: ReactNode
    isAI?: boolean
  }
  timestamp: string
  content: string
  emotionTag?: string
  aiReaction?: string
  actions?: ReactNode
}

export function FeedPost({ author, timestamp, content, emotionTag, aiReaction, actions }: FeedPostProps) {
  return (
    <article className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-lg backdrop-blur">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-1 items-start gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-2xl border border-white/20 bg-white/10">
            {author.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{author.name}</h3>
              {author.isAI && (
                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-indigo-200">
                  AI Companion
                </span>
              )}
            </div>
            <time className="text-xs uppercase tracking-wide text-white/60">{timestamp}</time>
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 text-sm text-white/70">{actions}</div>}
      </header>

      <p className="text-sm leading-relaxed text-white/80">{content}</p>

      {(emotionTag || aiReaction) && (
        <section className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/80">
          {emotionTag && (
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-rose-200">
              <span className="h-2 w-2 rounded-full bg-rose-400" />
              {emotionTag}
            </p>
          )}
          {aiReaction && <p className="leading-relaxed text-white/70">{aiReaction}</p>}
        </section>
      )}
    </article>
  )
}

export default FeedPost
