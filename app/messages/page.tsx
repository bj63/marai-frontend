'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, MessageCircle, Send } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import {
  getConversationMessages,
  getConversations,
  sendMessage,
  type ConversationSummary,
  type DirectMessage,
} from '@/lib/supabaseApi'

export default function MessagesPage() {
  const { status, user } = useAuth()
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<DirectMessage[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    if (status !== 'authenticated' || !user?.id) {
      setConversations([])
      setSelectedId(null)
      setLoadingList(false)
      return
    }

    let active = true

    const loadConversations = async () => {
      setLoadingList(true)
      const data = await getConversations(user.id)
      if (!active) return
      setConversations(data)
      setSelectedId((previous) => previous ?? data[0]?.id ?? null)
      setLoadingList(false)
    }

    loadConversations()

    return () => {
      active = false
    }
  }, [status, user?.id])

  useEffect(() => {
    if (!selectedId) {
      setMessages([])
      return
    }

    let active = true

    const loadMessages = async () => {
      setLoadingMessages(true)
      const records = await getConversationMessages(selectedId)
      if (!active) return
      setMessages(records)
      setLoadingMessages(false)
    }

    loadMessages()

    return () => {
      active = false
    }
  }, [selectedId])

  const handleSend = async () => {
    if (!user?.id || !selectedId || !draft.trim()) return

    setSending(true)
    const { message, error } = await sendMessage(selectedId, user.id, draft.trim())
    if (!error && message) {
      setMessages((previous) => [...previous, message])
      setDraft('')
    }
    setSending(false)
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
        <MessageCircle className="h-8 w-8 text-brand-magnolia" />
        <h1 className="text-2xl font-semibold text-white">Sign in to access team messages</h1>
        <p className="text-sm text-brand-mist/70">Direct messaging keeps collaborations aligned. Authenticate to sync conversations across devices.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 text-brand-mist/80">
      <header className="flex flex-col gap-2 text-white">
        <p className="text-[0.7rem] uppercase tracking-[0.35em] text-brand-mist/60">Messages</p>
        <h1 className="text-3xl font-semibold">Coordinate with your collaborators</h1>
        <p className="text-sm text-brand-mist/70">Share context, drop quick updates, and align on decisions alongside Amaris.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
        <aside className="flex h-[480px] flex-col rounded-2xl border border-white/10 bg-[#101737]/70">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.32em] text-brand-mist/60">
            <span>Conversations</span>
            {loadingList ? <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-magnolia" /> : null}
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingList ? (
              <div className="flex h-full items-center justify-center text-sm text-brand-mist/70">Loading…</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-sm text-brand-mist/60">No threads yet. Invite teammates or follow other federations to start collaborating.</div>
            ) : (
              conversations.map((conversation) => {
                const isActive = conversation.id === selectedId
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => setSelectedId(conversation.id)}
                    className={`flex w-full flex-col gap-1 border-b border-white/5 px-4 py-3 text-left transition ${
                      isActive ? 'bg-brand-magnolia/10 text-white' : 'hover:bg-[#141d3c] text-brand-mist/70'
                    }`}
                  >
                    <span className="text-sm font-semibold">{conversation.title}</span>
                    <span className="text-xs text-brand-mist/60">{conversation.last_message_preview ?? 'No messages yet'}</span>
                  </button>
                )
              })
            )}
          </div>
        </aside>

        <section className="flex h-[480px] flex-col rounded-2xl border border-white/10 bg-[#0f1737]/70">
          {selectedId ? (
            <>
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.32em] text-brand-mist/60">
                <span>Thread</span>
                {loadingMessages ? <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-magnolia" /> : null}
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {loadingMessages ? (
                  <div className="flex h-full items-center justify-center text-sm text-brand-mist/60">Loading messages…</div>
                ) : messages.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 bg-[#111c3a]/60 p-6 text-center text-sm text-brand-mist/60">
                    Start the conversation with a quick hello.
                  </div>
                ) : (
                  messages.map((message) => (
                    <motion.div
                      key={message.id}
                      layout
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                        message.sender_id === user.id
                          ? 'ml-auto bg-brand-magnolia/20 text-white'
                          : 'bg-[#111c3a] text-brand-mist/80'
                      }`}
                    >
                      <p className="text-xs uppercase tracking-[0.3em] text-brand-mist/50">{message.sender_name ?? 'Federation member'}</p>
                      <p className="text-sm">{message.body}</p>
                      <p className="mt-1 text-[0.65rem] text-brand-mist/50">{new Date(message.created_at).toLocaleTimeString()}</p>
                    </motion.div>
                  ))
                )}
              </div>
              <div className="border-t border-white/10 p-3">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#111c3a] px-4 py-2">
                  <input
                    type="text"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Write a message"
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-brand-mist/50 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={sending || !draft.trim()}
                    className="rounded-full bg-brand-magnolia/80 p-2 text-[#0b1022] transition hover:bg-brand-magnolia disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-brand-mist/60">
              Select a conversation to get started.
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
