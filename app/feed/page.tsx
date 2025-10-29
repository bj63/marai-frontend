'use client'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Music } from 'lucide-react'
import MoodCard from '@/components/MoodCard'
import { useAuth } from '@/components/auth/AuthProvider'
import { useMoaStore } from '@/lib/store'
import { createPost, getFeed, getProfile, type FeedPost, type MiraiProfile } from '@/lib/supabaseApi'

export default function FeedPage() {
    const { status, user } = useAuth()
    const { setMood: setGlobalMood, federationId } = useMoaStore()

    const [feed, setFeed] = useState<FeedPost[]>([])
    const [loadingFeed, setLoadingFeed] = useState(true)
    const [creatingPost, setCreatingPost] = useState(false)
    const [feedback, setFeedback] = useState<string | null>(null)
    const [profile, setProfile] = useState<MiraiProfile | null>(null)

    const [mood, setMood] = useState('happy')
    const [note, setNote] = useState('')
    const [song, setSong] = useState('')

    useEffect(() => {
        let active = true

        const loadFeed = async () => {
            setLoadingFeed(true)
            const posts = await getFeed()
            if (!active) return
            setFeed(posts)
            setLoadingFeed(false)
        }

        loadFeed()

        return () => {
            active = false
        }
    }, [])

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

        setFeed((previous) => [post, ...previous])
        setGlobalMood(mood)
        setNote('')
        setSong('')
        setCreatingPost(false)
    }

    const canShare = status === 'authenticated'
    const hasInput = note.trim().length > 0 || song.trim().length > 0

    return (
        <div className="flex min-h-screen flex-col items-center p-6">
            <motion.h1
                className="mb-4 text-4xl font-bold text-indigo-700"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                Moa AI Feed
            </motion.h1>

            <div className="mb-6 w-full max-w-xl rounded-xl bg-white/80 p-4 shadow-md">
                <div className="mb-3 flex items-center justify-between">
                    <select
                        value={mood}
                        onChange={(event) => setMood(event.target.value)}
                        className="flex-1 rounded-md border border-gray-300 bg-white p-2"
                    >
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
                    {creatingPost
                        ? 'Sharing mood…'
                        : canShare
                        ? 'Share Mood'
                        : 'Sign in to share'}
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
                    feed.map((post) => <MoodCard key={post.id} post={post} />)
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
