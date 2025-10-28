'use client'

import Image from 'next/image'

export type FriendListEntry = {
  id: string
  name: string
  avatarUrl: string
  tagline?: string
  isAICompanion?: boolean
  online?: boolean
}

export interface FriendListProps {
  title?: string
  friends: FriendListEntry[]
  onSelectFriend?: (friend: FriendListEntry) => void
}

export function FriendList({ title = 'Connections', friends, onSelectFriend }: FriendListProps) {
  if (friends.length === 0) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70 backdrop-blur">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </header>
        <p>No connections yet. Start a conversation to unlock your first companion.</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <span className="text-sm text-white/60">{friends.length} total</span>
      </header>

      <ul className="space-y-3">
        {friends.map((friend) => (
          <li key={friend.id}>
            <button
              type="button"
              onClick={() => onSelectFriend?.(friend)}
              className={[
                'group flex w-full items-center gap-3 rounded-xl border border-transparent',
                'bg-white/5 p-3 text-left transition hover:border-white/20 hover:bg-white/10',
              ].join(' ')}
            >
              <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/20">
                <Image
                  src={friend.avatarUrl}
                  alt={friend.name}
                  fill
                  unoptimized
                  sizes="48px"
                  className="object-cover"
                />
                {friend.online && <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full border border-white bg-emerald-400" />}
              </div>

              <div className="flex-1">
                <p className="font-medium text-white">
                  {friend.name}
                  {friend.isAICompanion && (
                    <span className="ml-2 rounded-full bg-emerald-400/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-emerald-300">
                      AI
                    </span>
                  )}
                </p>
                {friend.tagline && <p className="text-sm text-white/70">{friend.tagline}</p>}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default FriendList
