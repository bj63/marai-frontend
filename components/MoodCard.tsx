'use client'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import type { FeedPost } from '@/lib/supabaseApi'

interface MoodCardProps {
    post: FeedPost
}

const isSafeExternalUrl = (url: string | undefined): url is string => {
    if (!url) {
        return false
    }

    try {
        const parsed = new URL(url)
        return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
        return false
    }
}

export default function MoodCard({ post }: MoodCardProps) {
    const moodColors: Record<string, string> = {
        happy: 'bg-yellow-100 border-yellow-300',
        curious: 'bg-blue-100 border-blue-300',
        calm: 'bg-green-100 border-green-300',
        excited: 'bg-pink-100 border-pink-300',
        tired: 'bg-gray-100 border-gray-300',
    }

    const emojis: Record<string, string> = {
        happy: '😊',
        curious: '🤔',
        calm: '😌',
        excited: '🤩',
        tired: '😴',
    }

    const moodKey = (post.mood ?? 'update').toLowerCase()
    const createdAt = new Date(post.created_at)
    const timestamp = Number.isNaN(createdAt.getTime())
        ? post.created_at
        : createdAt.toLocaleString()
    const accentColor = post.color ?? '#6366F1'
    const name = post.mirai_name ?? 'Mirai federation member'

    return (
        <motion.div
            className={`border p-4 rounded-xl shadow-sm ${moodColors[moodKey] || 'bg-gray-50'} backdrop-blur-md`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ borderColor: accentColor }}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{emojis[moodKey] ?? '🛰️'}</span>
                    <span className="font-semibold capitalize">{post.mood ?? 'Update'}</span>
                </div>
                <span className="text-xs text-gray-500">{timestamp}</span>
            </div>

            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">
                Shared by {name}
            </p>
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-2">
                Federation: {post.user_id}
            </p>

            {post.message && <p className="text-gray-700 mb-2">{post.message}</p>}

            {isSafeExternalUrl(post.music_url) && (
                <a
                    href={post.music_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-indigo-600 text-sm hover:underline"
                >
                    <Play size={14} /> Listen
                </a>
            )}
        </motion.div>
    )
}
