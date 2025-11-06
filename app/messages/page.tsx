'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, MessageCircle, Send } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useDesignTheme } from '@/components/design/DesignThemeProvider'
import {
  getConversationMessages,
  getConversations,
  sendMessage,
  type ConversationSummary,
  type DirectMessage,
} from '@/lib/supabaseApi'

export default function MessagesPage() {
  const { status, user } = useAuth()
  const { registerInteraction, flushFeedback, theme } = useDesignTheme()
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<DirectMessage[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [draft, setDraft] = useState('')
  const conversationStartRef = useRef<number | null>(null)
  const activeConversationRef = useRef<string | null>(null)

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
      if (conversationStartRef.current && activeConversationRef.current) {
        const duration = (Date.now() - conversationStartRef.current) / 1000
        registerInteraction({
          metric: 'conversation_screen_time',
          value: Number.isFinite(duration) ? duration : 0,
          targetId: activeConversationRef.current,
          actionType: 'conversation_engagement',
        })
        conversationStartRef.current = null
        activeConversationRef.current = null
      }
      setMessages([])
      return
    }

    if (activeConversationRef.current && conversationStartRef.current) {
      const duration = (Date.now() - conversationStartRef.current) / 1000
      registerInteraction({
        metric: 'conversation_screen_time',
        value: Number.isFinite(duration) ? duration : 0,
        targetId: activeConversationRef.current,
        actionType: 'conversation_engagement',
      })
    }

    conversationStartRef.current = Date.now()
    activeConversationRef.current = selectedId
    registerInteraction({
      metric: 'conversation_opened',
      value: 1,
      targetId: selectedId,
      actionType: 'conversation_engagement',
    })

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

  useEffect(() => {
    return () => {
      if (conversationStartRef.current && activeConversationRef.current) {
        const duration = (Date.now() - conversationStartRef.current) / 1000
        registerInteraction({
          metric: 'conversation_screen_time',
          value: Number.isFinite(duration) ? duration : 0,
          targetId: activeConversationRef.current,
          actionType: 'conversation_engagement',
        })
      }
      conversationStartRef.current = null
      activeConversationRef.current = null
      void flushFeedback()
    }
  }, [flushFeedback, registerInteraction])

  const relationalSignature = useMemo(() => theme.relational_signature ?? null, [theme.relational_signature])

  const deriveSentiment = (text: string): 'positive' | 'neutral' | 'negative' => {
    const normalized = text.toLowerCase()
    const positiveHints = ['thank', 'great', 'appreciate', 'awesome', 'excited', 'love', 'glad']
    const negativeHints = ['frustrated', 'angry', 'upset', 'worried', 'sad', 'problem', 'issue']

    if (positiveHints.some((word) => normalized.includes(word))) return 'positive'
    if (negativeHints.some((word) => normalized.includes(word))) return 'negative'
    return 'neutral'
  }

  const handleSend = async () => {
    if (!user?.id || !selectedId || !draft.trim()) return

    setSending(true)
    const { message, error } = await sendMessage(selectedId, user.id, draft.trim())
    if (!error && message) {
      setMessages((previous) => [...previous, message])
      setDraft('')
      registerInteraction({
        metric: 'direct_message_sent',
        value: 1,
        sentiment: deriveSentiment(message.body),
        targetId: selectedId,
        actionType: 'conversation_engagement',
        relationshipContext: {
          target_user_id: selectedId,
          connection_type: 'conversation',
        },
        metadata: {
          length: message.body.length,
        },
      })
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
    <div className="page-shell" data-width="wide">
      <header className="section-header text-white">
        <p className="section-label text-brand-mist/60">Messages</p>
        <h1 className="section-title text-3xl">Coordinate with your collaborators</h1>
        <p className="section-description text-brand-mist/70">Share context, drop quick updates, and align on decisions alongside Amaris.</p>
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
              {relationalSignature ? (
                <div className="border-b border-white/10 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.32em] text-brand-mist/60">
                  <span className="block text-[0.65rem] font-semibold text-brand-mist/70">Relational harmony active</span>
                  {'summary' in relationalSignature && typeof relationalSignature.summary === 'string' ? (
                    <span className="mt-1 block text-[0.6rem] normal-case tracking-normal text-brand-mist/70">
                      {relationalSignature.summary}
                    </span>
                  ) : null}
                </div>
              ) : null}
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
