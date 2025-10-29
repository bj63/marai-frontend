'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BellRing, Check, Loader2 } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { getNotifications, markAllNotificationsRead, markNotificationRead, type Notification } from '@/lib/supabaseApi'

export default function NotificationsPage() {
  const { status, user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (status !== 'authenticated' || !user?.id) {
      setNotifications([])
      setLoading(false)
      return
    }

    let active = true

    const loadNotifications = async () => {
      setLoading(true)
      const records = await getNotifications(user.id)
      if (!active) return
      setNotifications(records)
      setLoading(false)
    }

    loadNotifications()

    return () => {
      active = false
    }
  }, [status, user?.id])

  const handleMarkOne = async (id: string) => {
    setUpdating(true)
    const result = await markNotificationRead(id)
    if (!result.error) {
      setNotifications((previous) =>
        previous.map((item) =>
          item.id === id
            ? {
                ...item,
                read_at: new Date().toISOString(),
              }
            : item,
        ),
      )
    }
    setUpdating(false)
  }

  const handleMarkAll = async () => {
    if (!user?.id) return
    setUpdating(true)
    const result = await markAllNotificationsRead(user.id)
    if (!result.error) {
      const timestamp = new Date().toISOString()
      setNotifications((previous) => previous.map((item) => ({ ...item, read_at: timestamp })))
    }
    setUpdating(false)
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-brand-mist/70">
        <Loader2 className="h-5 w-5 animate-spin text-brand-magnolia" />
        <span className="ml-2 text-sm">Checking your session…</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center gap-4 text-center text-brand-mist/80">
        <BellRing className="h-8 w-8 text-brand-magnolia" />
        <h1 className="text-2xl font-semibold text-white">Sign in to view notifications</h1>
        <p className="text-sm text-brand-mist/70">Connect your account to receive feed reactions, roster changes, and collaboration invites.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-12 text-brand-mist/80">
      <header className="flex flex-col gap-2 text-white">
        <p className="text-[0.7rem] uppercase tracking-[0.35em] text-brand-mist/60">Notifications</p>
        <h1 className="text-3xl font-semibold">Stay aligned with your network</h1>
        <p className="text-sm text-brand-mist/70">Mentions, new followers, and admin actions land here so you never miss an important moment.</p>
      </header>

      <div className="flex items-center justify-between text-xs uppercase tracking-[0.32em] text-brand-mist/60">
        <span>{notifications.length} updates</span>
        <button
          type="button"
          onClick={handleMarkAll}
          disabled={updating || notifications.every((item) => item.read_at)}
          className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-1 text-[0.65rem] font-semibold text-brand-mist transition hover:border-brand-magnolia/40 hover:text-brand-magnolia disabled:cursor-not-allowed disabled:opacity-50"
        >
          {updating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Mark all read
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#101737]/70 p-6 text-sm text-brand-mist/70">
            <Loader2 className="h-4 w-4 animate-spin text-brand-magnolia" /> Fetching the latest pings…
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-[#0f1737]/60 p-6 text-center text-sm text-brand-mist/70">
            No notifications yet. Encourage collaborators to follow you or publish feed updates.
          </div>
        ) : (
          notifications.map((notification) => (
            <motion.article
              key={notification.id}
              layout
              className={`flex items-start justify-between gap-4 rounded-2xl border px-4 py-3 text-sm transition ${
                notification.read_at ? 'border-white/10 bg-[#101737]/60' : 'border-brand-magnolia/40 bg-brand-magnolia/10'
              }`}
            >
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-[0.3em] text-brand-mist/60">{notification.type}</span>
                <p className="text-sm text-white">{notification.title}</p>
                <p className="text-xs text-brand-mist/70">{notification.body}</p>
                <p className="text-[0.65rem] text-brand-mist/50">{new Date(notification.created_at).toLocaleString()}</p>
              </div>
              <button
                type="button"
                onClick={() => handleMarkOne(notification.id)}
                disabled={updating || Boolean(notification.read_at)}
                className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-brand-mist transition hover:border-brand-magnolia/40 hover:text-brand-magnolia disabled:cursor-not-allowed disabled:opacity-50"
              >
                {notification.read_at ? 'Acknowledged' : 'Mark read'}
              </button>
            </motion.article>
          ))
        )}
      </div>
    </div>
  )
}
