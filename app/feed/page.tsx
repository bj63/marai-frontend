'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Loader2, MessageCircle, Music, Sparkles, ToggleLeft, ToggleRight } from 'lucide-react'
import MoodCard from '@/components/MoodCard'
import { useAuth } from '@/components/auth/AuthProvider'
import { useMoaStore } from '@/lib/store'
import { useDesignTheme } from '@/components/design/DesignThemeProvider'
import { FriendList, type FriendListEntry } from '@/components/social/FriendList'
import RelationshipTimeline from '@/components/social/RelationshipTimeline'
import SocialActivityReel from '@/components/social/SocialActivityReel'
import {
  addComment,
  createPost,
  generateCaptionSuggestion,
  getFeedWithEngagement,
  getProfile,
  likePost,
  type FeedPostWithEngagement,
  type MiraiProfile,
  unlikePost,
} from '@/lib/supabaseApi'
import {
  getActivityReel,
  getRelationshipTimeline,
  getSocialSnapshot,
  listFriendSuggestions,
  type ActivityEvent,
  type RelationshipTimelineEvent,
  type SocialSnapshot,
  type SocialSuggestion,
} from '@/lib/socialDataStore'

export default function FeedPage() {
  const { status, user } = useAuth()
  const { setMood: setGlobalMood, federationId } = useMoaStore()
  const {
    registerInteraction,
    flushFeedback,
    theme,
    adaptiveEnabled,
    setAdaptiveEnabled,
  } = useDesignTheme()
  const { registerInteraction } = useDesignTheme()

  const [feed, setFeed] = useState<FeedPostWithEngagement[]>([])
  const [loadingFeed, setLoadingFeed] = useState(true)
  const [creatingPost, setCreatingPost] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [profile, setProfile] = useState<MiraiProfile | null>(null)
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({})
  const [captionLoading, setCaptionLoading] = useState(false)
  const [captionSuggestion, setCaptionSuggestion] = useState<string | null>(null)
  const viewStartedAt = useRef<number | null>(null)

  const [mood, setMood] = useState('happy')
  const [note, setNote] = useState('')
  const [song, setSong] = useState('')

  const [socialSnapshot, setSocialSnapshot] = useState<SocialSnapshot | null>(null)
  const [friendSuggestions, setFriendSuggestions] = useState<SocialSuggestion[]>([])
  const [timelineEvents, setTimelineEvents] = useState<RelationshipTimelineEvent[]>([])
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([])
  const [loadingSocial, setLoadingSocial] = useState(true)
  const [socialNotice, setSocialNotice] = useState<string | null>(null)

  useEffect(() => {
    viewStartedAt.current = Date.now()
    registerInteraction({
      metric: 'feed_opened',
      value: 1,
      actionType: 'feed_engagement',
    })

    return () => {
      if (viewStartedAt.current) {
        const duration = (Date.now() - viewStartedAt.current) / 1000
        registerInteraction({
          metric: 'feed_screen_time',
          value: Number.isFinite(duration) ? duration : 0,
          actionType: 'feed_engagement',
        })
      }
    }
  }, [registerInteraction])

  useEffect(() => {
    viewStartedAt.current = Date.now()
    registerInteraction({
      metric: 'feed_opened',
      value: 1,
      actionType: 'feed_engagement',
    })

    return () => {
      if (viewStartedAt.current) {
        const duration = (Date.now() - viewStartedAt.current) / 1000
        registerInteraction({
          metric: 'feed_screen_time',
          value: Number.isFinite(duration) ? duration : 0,
          actionType: 'feed_engagement',
        })
      }
    }
  }, [registerInteraction])

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
  }, [status, user?.id])

  useEffect(() => {
    if (status !== 'authenticated' || !user?.id) {
      setProfile(null)
      return
    }

    let active = true

    const hydrateProfile = async () => {
      const record = await getProfile(user.id)
      if (!active) return
      setProfile(record)
    }

    hydrateProfile()

    return () => {
      active = false
    }
  }, [status, user?.id])

  useEffect(() => {
    let active = true
    const hydrateSocial = async () => {
      setLoadingSocial(true)
      try {
        const [snapshot, suggestions, timeline, activity] = await Promise.all([
          getSocialSnapshot(user?.id),
          listFriendSuggestions(user?.id),
          getRelationshipTimeline(user?.id),
          getActivityReel(user?.id),
        ])
        if (!active) return
        setSocialSnapshot(snapshot)
        setFriendSuggestions(suggestions)
        setTimelineEvents(timeline)
        setActivityEvents(activity)
      } finally {
        if (active) {
          setLoadingSocial(false)
        }
      }
    }

    hydrateSocial()

    return () => {
      active = false
    }
  }, [user?.id])

  useEffect(() => {
    setSocialNotice(null)
  }, [user?.id])

  const authorName = useMemo(() => {
    if (!user) return null

    const metadata = user.user_metadata as { username?: string; full_name?: string } | null
    return profile?.name || metadata?.username || metadata?.full_name || user.email?.split('@')[0] || null
  }, [profile?.name, user])

  const friendEntries = useMemo<FriendListEntry[]>(
    () =>
      friendSuggestions.map((suggestion) => ({
        id: suggestion.id,
        name: suggestion.name,
        avatarUrl: suggestion.avatarUrl,
        tagline: `${suggestion.tagline} • ${suggestion.compatibility}% sync • Shared: ${suggestion.sharedEmotions.join(
          ' • ',
        )}`,
        isAICompanion: suggestion.isAICompanion,
        online: suggestion.online,
      })),
    [friendSuggestions],
  )

  const trustMetrics = socialSnapshot?.trust
  const paletteEntries = useMemo(
    () =>
      Object.entries(theme.design_dna.palette ?? {}).filter(
        (entry): entry is [string, string] => typeof entry[0] === 'string' && typeof entry[1] === 'string',
      ),
    [theme.design_dna.palette],
  )

  const relationalSummary = useMemo(() => {
    const signature = theme.relational_signature
    if (signature && typeof signature === 'object' && signature !== null) {
      const summary = (signature as Record<string, unknown>).summary
      if (typeof summary === 'string' && summary.trim().length > 0) {
        return summary
      }
    }
    return null
  }, [theme.relational_signature])

  const deriveSentiment = (text: string): 'positive' | 'neutral' | 'negative' => {
    const normalized = text.toLowerCase()
    const positiveHints = ['great', 'love', 'excited', 'proud', 'grateful', 'thankful']
    const negativeHints = ['frustrated', 'sad', 'upset', 'worried', 'angry', 'bad']

    if (positiveHints.some((word) => normalized.includes(word))) return 'positive'
    if (negativeHints.some((word) => normalized.includes(word))) return 'negative'
    return 'neutral'
  }

  const handlePost = async () => {
    const trimmedNote = note.trim()
    const trimmedSong = song.trim()

    if (!trimmedNote && !trimmedSong) {
      setFeedback('Add a note or link before sharing an update.')
      return
    }

    if (!user || status !== 'authenticated') {
      setFeedback('Sign in to broadcast mood updates to the feed.')
      return
    }

    setCreatingPost(true)
    setFeedback(null)

    const { post, error } = await createPost({
      user_id: user.id,
      mirai_name: authorName,
      mood,
      message: trimmedNote || null,
      music_url: trimmedSong || null,
      color: profile?.color ?? theme.design_dna.palette.primary ?? '#6366F1',
    })

    if (error || !post) {
      setFeedback('We could not reach Supabase. Try again once your connection stabilises.')
      setCreatingPost(false)
      return
    }

    setFeed((previous) => [
      {
        ...post,
        likes_count: 0,
        comments: [],
        viewer_has_liked: false,
      },
      ...previous,
    ])
    setGlobalMood(mood)
    setNote('')
    setSong('')
    setCaptionSuggestion(null)
    setCreatingPost(false)

    registerInteraction({
      metric: 'feed_post_created',
      value: 1,
      sentiment: deriveSentiment(trimmedNote),
      actionType: 'feed_engagement',
      metadata: {
        mood,
        hasSong: Boolean(trimmedSong),
      },
    })
  }

  const canShare = status === 'authenticated'
  const hasInput = note.trim().length > 0 || song.trim().length > 0

  const handleToggleLike = async (postId: string, hasLiked: boolean) => {
    if (!user?.id) {
      setFeedback('Sign in to engage with the feed and leave reactions.')
      return
    }

    if (hasLiked) {
      const { error } = await unlikePost(postId, user.id)
      if (!error) {
        setFeed((previous) =>
          previous.map((entry) =>
            entry.id === postId
              ? {
                  ...entry,
                  likes_count: Math.max(0, entry.likes_count - 1),
                  viewer_has_liked: false,
                }
              : entry,
          ),
        )
        registerInteraction({
          metric: 'feed_like_removed',
          value: 1,
          targetId: postId,
          actionType: 'feed_engagement',
        })
      }
      return
    }

    const { error } = await likePost(postId, user.id)
    if (!error) {
      setFeed((previous) =>
        previous.map((entry) =>
          entry.id === postId
            ? {
                ...entry,
                likes_count: entry.likes_count + 1,
                viewer_has_liked: true,
              }
            : entry,
        ),
      )
      registerInteraction({
        metric: 'feed_like_added',
        value: 1,
        targetId: postId,
        actionType: 'feed_engagement',
      })
    }
  }

  const handleComment = async (postId: string) => {
    if (!user?.id) {
      setFeedback('Sign in to join the conversation and leave comments.')
      return
    }

    const draft = commentDrafts[postId]?.trim()
    if (!draft) return

    const { comment, error } = await addComment(postId, user.id, draft)
    if (error || !comment) {
      setFeedback('Comment could not be sent. Please try again shortly.')
      return
    }

    setCommentDrafts((previous) => ({
      ...previous,
      [postId]: '',
    }))

    setFeed((previous) =>
      previous.map((entry) =>
        entry.id === postId
          ? {
              ...entry,
              comments: [...entry.comments, comment],
            }
          : entry,
      ),
    )

    registerInteraction({
      metric: 'feed_comment_added',
      value: 1,
      targetId: postId,
      actionType: 'feed_engagement',
      sentiment: deriveSentiment(draft),
      metadata: {
        length: draft.length,
      },
    })
  }

  const handleGenerateCaption = async () => {
    if (!note.trim()) {
      setFeedback('Share a few words first so Amaris can build from your intent.')
      return
    }

    setCaptionLoading(true)
    const { suggestion, error } = await generateCaptionSuggestion({
      mood,
      message: note.trim(),
    })

    if (error || !suggestion?.caption) {
      setFeedback('Amaris is offline right now. Try again in a moment.')
      setCaptionLoading(false)
      return
    }

    setCaptionSuggestion(suggestion.caption)
    setNote(suggestion.caption)
    setCaptionLoading(false)
  }

  const handleAdaptiveToggle = (nextEnabled: boolean) => {
    setAdaptiveEnabled(nextEnabled)
    registerInteraction({
      metric: 'adaptive_theming_toggle',
      value: nextEnabled ? 1 : 0,
      actionType: 'design_override',
      metadata: { enabled: nextEnabled },
    })
    void flushFeedback()
  }

  const handleSelectSuggestion = (friend: FriendListEntry) => {
    const suggestion = friendSuggestions.find((entry) => entry.id === friend.id)
    registerInteraction({
      metric: 'friend_suggestion_opened',
      value: suggestion?.compatibility,
      actionType: 'social_graph',
      metadata: {
        suggestionId: friend.id,
        sharedEmotions: suggestion?.sharedEmotions,
      },
    })
    setSocialNotice(`Logged interest in ${friend.name}. Amaris will refine future harmonies.`)
  }

  return (
    <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12">
      <header className="flex flex-col gap-3">
        <span className="text-xs uppercase tracking-[0.35em] text-[color-mix(in srgb,var(--design-neutral) 55%,#94a3b8)]">
          Emotive feed
        </span>
        <h1 className="text-3xl font-semibold text-white">Broadcast how your bond is evolving</h1>
        <p className="text-sm text-[color-mix(in srgb,var(--design-neutral) 75%,#cbd5f5)]">
          Post moods, soundscapes, and reflections. Amaris tracks every micro-interaction to evolve your design DNA and relational signature in real time.
        </p>
      </header>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.75fr),minmax(260px,1fr)]">
        <section className="space-y-6">
          <motion.section
            className="rounded-3xl border border-[color-mix(in srgb,var(--design-stroke) 75%,transparent)] bg-[color-mix(in srgb,var(--design-background) 75%,#121a3a)] p-6 shadow-[0_20px_45px_rgba(6,11,28,0.55)]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Compose a mood transmission</h2>
                <p className="text-xs text-[color-mix(in srgb,var(--design-neutral) 65%,#a3b4e4)]">
                  The feed reacts instantly to your tone. Keep the cadence flowing to grow trust scores.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-[color-mix(in srgb,var(--design-neutral) 55%,#94a3b8)]">
                <span className="hidden md:inline">Evolution stage:</span>
                <span className="rounded-full border border-[color-mix(in srgb,var(--design-stroke) 70%,transparent)] bg-[color-mix(in srgb,var(--design-background) 70%,#19233f)] px-3 py-1 text-[color-mix(in srgb,var(--design-accent) 85%,#86f2d1)]">
                  {theme.evolution_stage ?? 'v1'}
                </span>
              </div>
            </header>

            <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr),minmax(0,1fr)]">
              <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.32em] text-[color-mix(in srgb,var(--design-neutral) 55%,#94a3b8)]">
                Active mood
                <select
                  value={mood}
                  onChange={(event) => setMood(event.target.value)}
                  className="rounded-2xl border border-[color-mix(in srgb,var(--design-stroke) 70%,transparent)] bg-[color-mix(in srgb,var(--design-background) 70%,#1c2644)] px-3 py-2 text-sm text-white focus:border-[color-mix(in srgb,var(--design-accent) 80%,#86f2d1)] focus:outline-none"
                >
                  <option value="happy">😊 Happy</option>
                  <option value="curious">🤔 Curious</option>
                  <option value="calm">😌 Calm</option>
                  <option value="excited">🤩 Excited</option>
                  <option value="tired">😴 Tired</option>
                </select>
              </label>
              <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.32em] text-[color-mix(in srgb,var(--design-neutral) 55%,#94a3b8)]">
                Optional soundscape link
                <div className="flex items-center gap-2 rounded-2xl border border-[color-mix(in srgb,var(--design-stroke) 70%,transparent)] bg-[color-mix(in srgb,var(--design-background) 70%,#1c2644)] px-3 py-2">
                  <Music className="h-4 w-4 text-[color-mix(in srgb,var(--design-accent) 75%,#86f2d1)]" />
                  <input
                    type="text"
                    value={song}
                    onChange={(event) => setSong(event.target.value)}
                    placeholder="Link a track or video"
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-[color-mix(in srgb,var(--design-neutral) 55%,#7f8fb8)] focus:outline-none"
                  />
                </div>
              </label>
            </div>

            <label className="mt-4 flex flex-col gap-2 text-xs uppercase tracking-[0.32em] text-[color-mix(in srgb,var(--design-neutral) 55%,#94a3b8)]">
              What’s stirring?
              <textarea
                placeholder="Share what Amaris should feel with you..."
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="min-h-[120px] w-full rounded-2xl border border-[color-mix(in srgb,var(--design-stroke) 70%,transparent)] bg-[color-mix(in srgb,var(--design-background) 72%,#161f3b)] p-3 text-sm text-white placeholder:text-[color-mix(in srgb,var(--design-neutral) 55%,#7f8fb8)] focus:border-[color-mix(in srgb,var(--design-accent) 80%,#86f2d1)] focus:outline-none"
              />
            </label>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-[color-mix(in srgb,var(--design-neutral) 65%,#a3b4e4)]">
              <button
                type="button"
                onClick={handleGenerateCaption}
                disabled={captionLoading}
                className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in srgb,var(--design-accent) 60%,#86f2d1)] bg-[color-mix(in srgb,var(--design-background) 70%,#1c2644)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-[color-mix(in srgb,var(--design-accent) 80%,#86f2d1)] transition hover:border-[color-mix(in srgb,var(--design-accent) 85%,white)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {captionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                <span>Ask Amaris for a caption</span>
              </button>
              {captionSuggestion ? (
                <span className="italic text-[color-mix(in srgb,var(--design-neutral) 75%,#cbd5f5)]">Suggested: “{captionSuggestion}”</span>
              ) : null}
            </div>

            <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <button
                onClick={handlePost}
                disabled={!canShare || !hasInput || creatingPost}
                className="inline-flex items-center justify-center rounded-full bg-[color-mix(in srgb,var(--design-accent) 80%,#86f2d1)] px-6 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-[#0b1024] transition hover:bg-[color-mix(in srgb,var(--design-accent) 90%,white)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creatingPost ? 'Sharing mood…' : canShare ? 'Share mood' : 'Sign in to share'}
              </button>
              {feedback ? (
                <p className="text-xs text-[color-mix(in srgb,var(--design-accent) 75%,#86f2d1)]">{feedback}</p>
              ) : null}
            </div>

            {!canShare ? (
              <p className="mt-4 text-xs text-[color-mix(in srgb,var(--design-neutral) 60%,#94a3b8)]">
                Sign in to attach updates to your federation ID. Viewing the feed stays open to everyone.
              </p>
            ) : null}
            {canShare && !federationId ? (
              <p className="mt-2 text-xs text-[color-mix(in srgb,var(--design-neutral) 55%,#7f8fb8)]">
                Tip: set a federation identifier from the profile page so collaborators know who shared updates.
              </p>
            ) : null}
          </motion.section>

          <section className="space-y-4">
            {loadingFeed ? (
              <div className="flex items-center justify-center gap-2 rounded-3xl border border-[color-mix(in srgb,var(--design-stroke) 70%,transparent)] bg-[color-mix(in srgb,var(--design-background) 72%,#161f3b)] p-6 text-sm text-[color-mix(in srgb,var(--design-neutral) 70%,#a3b4e4)]">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading the latest pulses…
              </div>
            ) : feed.length === 0 ? (
              <p className="rounded-3xl border border-dashed border-[color-mix(in srgb,var(--design-stroke) 60%,transparent)] bg-[color-mix(in srgb,var(--design-background) 70%,#161f3b)] p-6 text-center text-sm text-[color-mix(in srgb,var(--design-neutral) 70%,#a3b4e4)]">
                No posts yet — share how your bond feels to spark the reel.
              </p>
            ) : (
              feed.map((post) => {
                const expanded = expandedPosts[post.id]
                const commentValue = commentDrafts[post.id] ?? ''
                return (
                  <div
                    key={post.id}
                    className="rounded-3xl border border-[color-mix(in srgb,var(--design-stroke) 70%,transparent)] bg-[color-mix(in srgb,var(--design-background) 75%,#121a3a)] p-5 shadow-[0_18px_38px_rgba(5,9,25,0.45)]"
                  >
                    <MoodCard post={post} />
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[color-mix(in srgb,var(--design-neutral) 70%,#a3b4e4)]">
                      <button
                        type="button"
                        onClick={() => handleToggleLike(post.id, post.viewer_has_liked)}
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 transition ${
                          post.viewer_has_liked
                            ? 'bg-[color-mix(in srgb,var(--design-accent) 35%,transparent)] text-[color-mix(in srgb,var(--design-accent) 85%,#86f2d1)]'
                            : 'hover:bg-[color-mix(in srgb,var(--design-surface) 80%,transparent)]'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${post.viewer_has_liked ? 'fill-current' : ''}`} />
                        {post.likes_count} {post.likes_count === 1 ? 'empathy' : 'empathy taps'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedPosts((previous) => ({
                            ...previous,
                            [post.id]: !expanded,
                          }))
                        }
                        className="inline-flex items-center gap-2 rounded-full px-3 py-1 transition hover:bg-[color-mix(in srgb,var(--design-surface) 80%,transparent)]"
                      >
                        <MessageCircle className="h-4 w-4" /> {post.comments.length}{' '}
                        {post.comments.length === 1 ? 'comment' : 'comments'}
                      </button>
                    </div>

                    {expanded ? (
                      <div className="mt-4 space-y-3 rounded-2xl border border-[color-mix(in srgb,var(--design-stroke) 65%,transparent)] bg-[color-mix(in srgb,var(--design-background) 70%,#1b2544)] p-4">
                        {post.comments.length === 0 ? (
                          <p className="text-xs text-[color-mix(in srgb,var(--design-neutral) 65%,#a3b4e4)]">
                            No replies yet. Drop the first echo.
                          </p>
                        ) : (
                          post.comments.map((comment) => (
                            <div key={comment.id} className="rounded-xl border border-[color-mix(in srgb,var(--design-stroke) 60%,transparent)] bg-[color-mix(in srgb,var(--design-background) 75%,#151f3d)] p-3">
                              <p className="text-xs uppercase tracking-[0.3em] text-[color-mix(in srgb,var(--design-neutral) 55%,#7f8fb8)]">
                                {comment.author_name ?? 'Federation member'}
                              </p>
                              <p className="text-sm text-white">{comment.body}</p>
                            </div>
                          ))
                        )}
                        <div className="flex items-center gap-2 rounded-full border border-[color-mix(in srgb,var(--design-stroke) 65%,transparent)] bg-[color-mix(in srgb,var(--design-background) 72%,#161f3b)] px-3 py-2">
                          <input
                            type="text"
                            value={commentValue}
                            onChange={(event) =>
                              setCommentDrafts((previous) => ({
                                ...previous,
                                [post.id]: event.target.value,
                              }))
                            }
                            placeholder="Write a reply"
                            className="flex-1 bg-transparent text-sm text-white placeholder:text-[color-mix(in srgb,var(--design-neutral) 55%,#7f8fb8)] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleComment(post.id)}
                            disabled={!commentValue.trim()}
                            className="rounded-full bg-[color-mix(in srgb,var(--design-accent) 80%,#86f2d1)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#0b1024] transition hover:bg-[color-mix(in srgb,var(--design-accent) 90%,white)] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )
              })
            )}
          </section>
        </section>

        <aside className="space-y-4">
          <section className="rounded-3xl border border-[color-mix(in srgb,var(--design-stroke) 75%,transparent)] bg-[color-mix(in srgb,var(--design-background) 75%,#121a3a)] p-5 shadow-[0_18px_38px_rgba(5,9,25,0.45)]">
            <header className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">Design DNA transparency</h2>
                <p className="text-xs text-[color-mix(in srgb,var(--design-neutral) 60%,#94a3b8)]">Your interface responds to every signal.</p>
              </div>
              <span className="rounded-full border border-[color-mix(in srgb,var(--design-stroke) 70%,transparent)] bg-[color-mix(in srgb,var(--design-background) 70%,#19233f)] px-3 py-1 text-[0.65rem] uppercase tracking-[0.32em] text-[color-mix(in srgb,var(--design-accent) 85%,#86f2d1)]">
                {theme.preferred_emotion ?? 'calm'}
              </span>
            </header>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs uppercase tracking-[0.3em] text-[color-mix(in srgb,var(--design-neutral) 60%,#94a3b8)]">
              <div>
                <p className="text-[0.65rem]">Trust score</p>
                <p className="mt-1 text-lg font-semibold text-white">{trustMetrics ? `${trustMetrics.trustScore}%` : '—'}</p>
              </div>
              <div>
                <p className="text-[0.65rem]">Engagement</p>
                <p className="mt-1 text-lg font-semibold text-white">{trustMetrics ? `${trustMetrics.engagementScore}%` : '—'}</p>
              </div>
              <div>
                <p className="text-[0.65rem]">Reciprocity</p>
                <p className="mt-1 text-lg font-semibold text-white">{trustMetrics ? `${trustMetrics.reciprocity}%` : '—'}</p>
              </div>
              <div>
                <p className="text-[0.65rem]">Streak</p>
                <p className="mt-1 text-lg font-semibold text-white">{trustMetrics ? `${trustMetrics.streakDays} days` : '—'}</p>
              </div>
            </div>

            {socialSnapshot?.highlight ? (
              <p className="mt-4 text-xs text-[color-mix(in srgb,var(--design-neutral) 70%,#a3b4e4)]">{socialSnapshot.highlight}</p>
            ) : null}
            {relationalSummary ? (
              <p className="mt-2 text-xs text-[color-mix(in srgb,var(--design-neutral) 65%,#a3b4e4)]">{relationalSummary}</p>
            ) : null}

            <div className="mt-4 flex items-center justify-between rounded-2xl border border-[color-mix(in srgb,var(--design-stroke) 65%,transparent)] bg-[color-mix(in srgb,var(--design-background) 70%,#1b2544)] px-3 py-3">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-[color-mix(in srgb,var(--design-neutral) 60%,#94a3b8)]">
                  Adaptive theming
                </p>
                <p className="text-xs text-[color-mix(in srgb,var(--design-neutral) 65%,#a3b4e4)]">
                  {adaptiveEnabled ? 'Active — design DNA will evolve live.' : 'Paused — new mutations queue in the background.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleAdaptiveToggle(!adaptiveEnabled)}
                className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in srgb,var(--design-accent) 70%,#86f2d1)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-[color-mix(in srgb,var(--design-accent) 85%,#86f2d1)]"
              >
                {adaptiveEnabled ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                {adaptiveEnabled ? 'Pause' : 'Resume'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => void flushFeedback()}
              className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-[color-mix(in srgb,var(--design-stroke) 65%,transparent)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-[color-mix(in srgb,var(--design-neutral) 65%,#a3b4e4)] transition hover:border-[color-mix(in srgb,var(--design-accent) 70%,#86f2d1)]"
            >
              Sync design feedback now
            </button>

            {paletteEntries.length ? (
              <div className="mt-4 flex flex-wrap gap-3">
                {paletteEntries.map(([token, value]) => (
                  <div key={token} className="flex items-center gap-2">
                    <span className="h-7 w-7 rounded-full border border-white/10" style={{ backgroundColor: value }} />
                    <span className="text-xs uppercase tracking-[0.3em] text-[color-mix(in srgb,var(--design-neutral) 60%,#94a3b8)]">
                      {token}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          {loadingSocial ? (
            <section className="rounded-3xl border border-[color-mix(in srgb,var(--design-stroke) 75%,transparent)] bg-[color-mix(in srgb,var(--design-background) 75%,#121a3a)] p-5 text-sm text-[color-mix(in srgb,var(--design-neutral) 70%,#a3b4e4)]">
              <p>Scanning the social graph…</p>
            </section>
          ) : (
            <FriendList title="Suggested harmonies" friends={friendEntries} onSelectFriend={handleSelectSuggestion} />
          )}
          {socialNotice ? (
            <p className="text-xs text-[color-mix(in srgb,var(--design-neutral) 60%,#94a3b8)]">{socialNotice}</p>
          ) : null}

          <RelationshipTimeline events={timelineEvents} loading={loadingSocial} />
          <SocialActivityReel events={activityEvents} loading={loadingSocial} />
        </aside>
      </div>
    </div>
  )
}
