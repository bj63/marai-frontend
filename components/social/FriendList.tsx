'use client'

import Image from 'next/image'
import { Loader2 } from 'lucide-react'

export type FriendListEntry = {
  id: string
  name: string
  avatarUrl: string
  tagline?: string
  isAICompanion?: boolean
  online?: boolean
  status?: 'idle' | 'loading' | 'sent' | 'error'
  statusMessage?: string | null
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
              disabled={friend.status === 'loading' || friend.status === 'sent'}
              aria-busy={friend.status === 'loading'}
              className={[
                'group flex w-full flex-col gap-2 rounded-xl border border-transparent bg-white/5 p-3 text-left transition',
                'hover:border-white/20 hover:bg-white/10',
                friend.status === 'sent' ? 'border-emerald-400/30 bg-emerald-400/5' : '',
                friend.status === 'error' ? 'border-rose-400/30 bg-rose-400/5' : '',
                (friend.status === 'loading' || friend.status === 'sent') ? 'cursor-default opacity-90' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className="flex items-center gap-3">
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

                {onSelectFriend && (
                  <span
                    className={[
                      'flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                      friend.status === 'sent'
                        ? 'bg-emerald-400/10 text-emerald-300'
                        : friend.status === 'error'
                          ? 'bg-rose-400/10 text-rose-300'
                          : 'bg-white/10 text-white/80',
                    ].join(' ')}
                  >
                    {friend.status === 'loading' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {friend.status === 'sent'
                      ? 'Request sent'
                      : friend.status === 'loading'
                        ? 'Sending'
                        : friend.status === 'error'
                          ? 'Retry'
                          : 'Connect'}
                  </span>
                )}
              </div>

              {friend.status === 'error' && friend.statusMessage && (
                <p className="text-xs text-rose-200/90">{friend.statusMessage}</p>
              )}
              {friend.status === 'sent' && (
                <p className="text-xs text-emerald-200/90">
                  {friend.statusMessage ?? 'We let them know you want to connect.'}
                </p>
              )}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default FriendList
