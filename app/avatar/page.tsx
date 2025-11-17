'use client'

import Link from 'next/link'
import { useMoaStore } from '@/lib/store'
import MiraiCharacter from '@/components/MiraiCharacter'

export default function AvatarPage() {
  const { personality, mood } = useMoaStore()

  return (
    <div className="flex flex-col items-center min-h-screen gap-8 p-6">
      <h1 className="text-4xl font-bold text-center">Your Mirai Character</h1>
      <p className="max-w-2xl text-center text-brand-mist/70">
        Tune Mirai&apos;s aura, then send the glow directly to Planner or the feed to keep the emotional UI consistent across every surface.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2 text-[0.65rem] uppercase tracking-[0.35em] text-brand-mist/60">
        <Link
          href={`/feed?prefillMood=${encodeURIComponent(mood)}`}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-white hover:border-brand-magnolia/40"
        >
          Preview in feed
        </Link>
        <Link
          href="/business/planner"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-white hover:border-brand-magnolia/40"
        >
          Send to planner
        </Link>
        <Link
          href="/business/assets"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-white hover:border-brand-magnolia/40"
        >
          Open media engine
        </Link>
      </div>

      <div className="grid w-full max-w-5xl gap-6 md:grid-cols-2">
        <div className="glass rounded-xl p-4">
          <h3 className="mb-2 text-lg font-semibold">Current State</h3>
          <MiraiCharacter personality={personality} size={300} animated intensity={0.6} />
        </div>

        <div className="glass rounded-xl p-4">
          <h3 className="mb-2 text-lg font-semibold">Max Empathy</h3>
          <MiraiCharacter
            personality={{ ...personality, empathy: 1, energy: 0.3 }}
            size={300}
            intensity={0.3}
          />
        </div>

        <div className="glass rounded-xl p-4">
          <h3 className="mb-2 text-lg font-semibold">Max Energy</h3>
          <MiraiCharacter
            personality={{ ...personality, energy: 1, humor: Math.min(1, personality.humor + 0.2) }}
            size={300}
            intensity={0.9}
            animated
          />
        </div>

        <div className="glass rounded-xl p-4">
          <h3 className="mb-2 text-lg font-semibold">Max Creativity</h3>
          <MiraiCharacter
            personality={{ ...personality, creativity: 1, confidence: Math.min(1, personality.confidence + 0.2) }}
            size={300}
            intensity={0.7}
          />
        </div>
      </div>
    </div>
  )
}
