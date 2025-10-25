'use client'

import { useMoaStore } from '@/lib/store'
import MiraiCharacter from '@/components/MiraiCharacter'

export default function AvatarPage() {
  const { personality } = useMoaStore()

  return (
    <div className="flex flex-col items-center min-h-screen gap-8 p-6">
      <h1 className="text-4xl font-bold text-center">Your Mirai Character</h1>

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
