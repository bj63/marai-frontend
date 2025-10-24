'use client'
import { useState } from 'react'
import MoodCard from '@/components/MoodCard'
import { useMiraiStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { Music, Smile } from 'lucide-react'

interface FeedItem {
    mood: string
    note: string
    song?: string
    timestamp: string
}

export default function FeedPage() {
    const [feed, setFeed] = useState<FeedItem[]>([])
    const [mood, setMood] = useState('happy')
    const [note, setNote] = useState('')
    const [song, setSong] = useState('')
    const { setMood: setGlobalMood } = useMiraiStore()

    const handlePost = () => {
        if (!note.trim() && !song.trim()) return

        const newPost = {
            mood,
            note,
            song,
            timestamp: new Date().toLocaleString(),
        }
        setFeed([newPost, ...feed])
        setGlobalMood(mood)
        setNote('')
        setSong('')
    }

    return (
        <div className="flex flex-col items-center min-h-screen p-6">
            <motion.h1
                className="text-4xl font-bold text-indigo-700 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                Mirai Feed
            </motion.h1>

            <div className="bg-white/80 p-4 rounded-xl shadow-md w-full max-w-xl mb-6">
                <div className="flex gap-2 mb-3">
                    <select
                        value={mood}
                        onChange={(e) => setMood(e.target.value)}
                        className="p-2 rounded-md border border-gray-300 bg-white flex-1"
                    >
                        <option value="happy">😊 Happy</option>
                        <option value="curious">🤔 Curious</option>
                        <option value="calm">😌 Calm</option>
                        <option value="excited">🤩 Excited</option>
                        <option value="tired">😴 Tired</option>
                    </select>
                </div>

                <textarea
                    placeholder="What’s Mirai feeling or doing?"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-md focus:outline-indigo-400 mb-3 resize-none"
                    rows={3}
                />

                <div className="flex items-center gap-2 mb-3">
                    <Music className="text-indigo-500" size={18} />
                    <input
                        type="text"
                        placeholder="Optional: YouTube or song link"
                        value={song}
                        onChange={(e) => setSong(e.target.value)}
                        className="flex-1 p-2 border border-gray-200 rounded-md"
                    />
                </div>

                <button
                    onClick={handlePost}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white w-full py-2 rounded-md transition"
                >
                    Share Mood
                </button>
            </div>

            {/* Feed List */}
            <div className="w-full max-w-xl space-y-4">
                {feed.length === 0 && (
                    <p className="text-gray-500 text-center">No posts yet — share how Mirai feels!</p>
                )}
                {feed.map((post, i) => (
                    <MoodCard key={i} post={post} />
                ))}
            </div>
        </div>
    )
}
