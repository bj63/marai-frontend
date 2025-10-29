'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Loader2, MessageCircle, Music, Sparkles } from 'lucide-react'
import MoodCard from '@/components/MoodCard'
import { useAuth } from '@/components/auth/AuthProvider'
import { useMoaStore } from '@/lib/store'
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

export default function FeedPage() {
  const { status, user } = useAuth()
  const { setMood: setGlobalMood, federationId } = useMoaStore()

  const [feed, setFeed] = useState<FeedPostWithEngagement[]>([])
  const [loadingFeed, setLoadingFeed] = useState(true)
  const [creatingPost, setCreatingPost] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [profile, setProfile] = useState<MiraiProfile | null>(null)
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({})
  const [captionLoading, setCaptionLoading] = useState(false)
  const [captionSuggestion, setCaptionSuggestion] = useState<string | null>(null)

  const [mood, setMood] = useState('happy')
  const [note, setNote] = useState('')
  const [song, setSong] = useState('')

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

  const authorName = useMemo(() => {
    if (!user) return null

    const metadata = user.user_metadata as { username?: string; full_name?: string } | null
    return profile?.name || metadata?.username || metadata?.full_name || user.email?.split('@')[0] || null
  }, [profile?.name, user])

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
      color: profile?.color ?? '#6366F1',
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

  return (
    <div className="flex min-h-screen flex-col items-center p-6">
      <motion.h1 className="mb-4 text-4xl font-bold text-indigo-700" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        Moa AI Feed
      </motion.h1>

      <div className="mb-6 w-full max-w-xl rounded-xl bg-white/80 p-4 shadow-md">
        <div className="mb-3 flex items-center justify-between">
          <select value={mood} onChange={(event) => setMood(event.target.value)} className="flex-1 rounded-md border border-gray-300 bg-white p-2">
            <option value="happy">😊 Happy</option>
            <option value="curious">🤔 Curious</option>
            <option value="calm">😌 Calm</option>
            <option value="excited">🤩 Excited</option>
            <option value="tired">😴 Tired</option>
          </select>
        </div>

        <textarea
          placeholder="What’s Moa feeling or doing?"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="mb-3 w-full resize-none rounded-md border border-gray-200 p-3 focus:outline-indigo-400"
          rows={3}
        />

        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
          <button
            type="button"
            onClick={handleGenerateCaption}
            disabled={captionLoading}
            className="inline-flex items-center gap-2 rounded-md border border-indigo-200 bg-white px-3 py-1 text-xs font-semibold text-indigo-600 transition hover:border-indigo-300 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {captionLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <span className="inline-flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                Ask Amaris for a caption
              </span>
            )}
          </button>
          {captionSuggestion ? <span className="italic text-gray-600">Suggested: “{captionSuggestion}”</span> : null}
        </div>

        <div className="mb-3 flex items-center gap-2">
          <Music className="text-indigo-500" size={18} />
          <input
            type="text"
            placeholder="Optional: YouTube or song link"
            value={song}
            onChange={(event) => setSong(event.target.value)}
            className="flex-1 rounded-md border border-gray-200 p-2"
          />
        </div>

        <button
          onClick={handlePost}
          disabled={!canShare || !hasInput || creatingPost}
          className="w-full rounded-md bg-indigo-500 py-2 text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-400"
        >
          {creatingPost ? 'Sharing mood…' : canShare ? 'Share Mood' : 'Sign in to share'}
        </button>
        {feedback ? <p className="mt-2 text-xs text-rose-500">{feedback}</p> : null}
      </div>

      <div className="w-full max-w-xl space-y-4">
        {loadingFeed ? (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-indigo-200 bg-white/60 p-4 text-sm text-indigo-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading the latest pulses…
          </div>
        ) : feed.length === 0 ? (
          <p className="text-center text-gray-500">No posts yet — share how Moa feels!</p>
        ) : (
          feed.map((post) => {
            const expanded = expandedPosts[post.id]
            const commentValue = commentDrafts[post.id] ?? ''
            return (
              <div key={post.id} className="rounded-xl border border-indigo-100 bg-white/90 p-4 shadow-sm">
                <MoodCard post={post} />
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <button
                    type="button"
                    onClick={() => handleToggleLike(post.id, post.viewer_has_liked)}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 transition ${
                      post.viewer_has_liked ? 'bg-rose-100 text-rose-600' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${post.viewer_has_liked ? 'fill-current text-rose-600' : ''}`} />
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
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1 transition hover:bg-gray-100"
                  >
                    <MessageCircle className="h-4 w-4" /> {post.comments.length}{' '}
                    {post.comments.length === 1 ? 'comment' : 'comments'}
                  </button>
                </div>

                {expanded ? (
                  <div className="mt-4 space-y-3 rounded-lg border border-gray-100 bg-gray-50/80 p-3">
                    <div className="space-y-2 text-sm">
                      {post.comments.length === 0 ? (
                        <p className="text-xs text-gray-400">No comments yet — start the conversation.</p>
                      ) : (
                        post.comments.map((comment) => (
                          <div key={comment.id} className="rounded-md bg-white/80 p-2">
                            <p className="text-xs font-semibold text-indigo-600">{comment.author_name ?? 'Federation member'}</p>
                            <p className="text-sm text-gray-700">{comment.body}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <textarea
                        value={commentValue}
                        onChange={(event) =>
                          setCommentDrafts((previous) => ({
                            ...previous,
                            [post.id]: event.target.value,
                          }))
                        }
                        placeholder="Add your reflection"
                        rows={2}
                        className="w-full resize-none rounded-md border border-gray-200 p-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleComment(post.id)}
                        disabled={!commentValue.trim()}
                        className="self-end rounded-md bg-indigo-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-300"
                      >
                        Share comment
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )
          })
        )}
      </div>

      {!canShare ? (
        <p className="mt-6 text-center text-sm text-gray-500">
          Sign in to attach updates to your federation ID. Viewing the feed stays open to everyone.
        </p>
      ) : null}
      {canShare && !federationId ? (
        <p className="mt-3 text-center text-xs text-gray-400">
          Tip: set a federation identifier from the profile page so collaborators know who shared updates.
        </p>
      ) : null}
    </div>
  )
}
