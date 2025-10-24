'use client'
import { motion } from 'framer-motion'

const avatarStates: Record<string, string> = {
    happy: '😄',
    curious: '🤔',
    calm: '😌',
    excited: '🤩',
    tired: '😴',
    focused: '🧐',
    playful: '🥰',
    neutral: '🙂',
}

export default function AvatarDisplay({ mood }: { mood: string }) {
    const currentEmoji = avatarStates[mood] || avatarStates['neutral']

    return (
        <motion.div
            className="flex flex-col items-center justify-center mt-4"
            animate={{
                scale: mood === 'excited' ? [1, 1.2, 1] : 1,
                rotate: mood === 'playful' ? [0, 5, -5, 0] : 0,
            }}
            transition={{ duration: 0.5 }}
        >
            <div className="text-7xl">{currentEmoji}</div>
            <p className="mt-2 text-gray-600 capitalize">Moa is feeling {mood}</p>
        </motion.div>
    )
}
