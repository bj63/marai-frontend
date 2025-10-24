'use client'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'

export default function MoodCard({ post }: { post: any }) {
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

    return (
        <motion.div
            className={`border p-4 rounded-xl shadow-sm ${moodColors[post.mood] || 'bg-gray-50'} backdrop-blur-md`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{emojis[post.mood]}</span>
                    <span className="font-semibold capitalize">{post.mood}</span>
                </div>
                <span className="text-xs text-gray-500">{post.timestamp}</span>
            </div>

            {post.note && <p className="text-gray-700 mb-2">{post.note}</p>}

            {post.song && (
                <a
                    href={post.song}
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
