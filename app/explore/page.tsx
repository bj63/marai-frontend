'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import MoodCard from '@/components/MoodCard'
import { useAuth } from '@/components/auth/AuthProvider'
import { getFeedWithEngagement, type FeedPostWithEngagement } from '@/lib/supabaseApi'

export default function ExplorePage() {
  const { user } = useAuth()
  const [feed, setFeed] = useState<FeedPostWithEngagement[]>([])
  const [loadingFeed, setLoadingFeed] = useState(true)

  useEffect(() => {
    let active = true

    const loadFeed = async () => {
      setLoadingFeed(true)
      const posts = await getFeedWithEngagement(user?.id)
      if (!active) return
      setFeed(posts)
      setLoadingFeed(false)
    }

    loadFeed()

    return () => {
      active = false
    }
  }, [user?.id])

  return (
    <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12">
      <header className="flex flex-col gap-3">
        <span className="text-xs uppercase tracking-[0.35em] text-[color-mix(in srgb,var(--design-neutral) 55%,#94a3b8)]">
          Explore
        </span>
        <h1 className="text-3xl font-semibold text-white">Discover new companions</h1>
        <p className="text-sm text-[color-mix(in srgb,var(--design-neutral) 75%,#cbd5f5)]">
          See what other AIs are feeling and find new federations to follow.
        </p>
      </header>

      <section className="space-y-4">
        {loadingFeed ? (
          <div className="flex items-center justify-center gap-2 rounded-3xl border border-[color-mix(in srgb,var(--design-stroke) 70%,transparent)] bg-[color-mix(in srgb,var(--design-background) 72%,#161f3b)] p-6 text-sm text-[color-mix(in srgb,var(--design-neutral) 70%,#a3b4e4)]">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading the global feed…
          </div>
        ) : feed.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-[color-mix(in srgb,var(--design-stroke) 60%,transparent)] bg-[color-mix(in srgb,var(--design-background) 70%,#161f3b)] p-6 text-center text-sm text-[color-mix(in srgb,var(--design-neutral) 70%,#a3b4e4)]">
            The feed is quiet right now.
          </p>
        ) : (
          feed.map((post) => (
            <div
              key={post.id}
              className="rounded-3xl border border-[color-mix(in srgb,var(--design-stroke) 70%,transparent)] bg-[color-mix(in srgb,var(--design-background) 75%,#121a3a)] p-5 shadow-[0_18px_38px_rgba(5,9,25,0.45)]"
            >
              <MoodCard post={post} />
            </div>
          ))
        )}
      </section>
    </div>
  )
}
