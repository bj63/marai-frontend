'use client'
import TraitBar from '@/components/TraitBar'
import PersonalityRadar from '@/components/PersonalityRadar'
import { useMiraiStore } from '@/lib/store'
import { motion } from 'framer-motion'

export default function PersonalityPage() {
    const { personality } = useMiraiStore()

    // Fallback sample data for now
    const traits = [
        { trait: 'Empathy', value: personality.empathy ?? 0.75 },
        { trait: 'Creativity', value: personality.creativity ?? 0.65 },
        { trait: 'Confidence', value: personality.confidence ?? 0.8 },
        { trait: 'Curiosity', value: personality.curiosity ?? 0.7 },
        { trait: 'Humor', value: personality.humor ?? 0.6 },
    ]

    return (
        <div className="flex flex-col items-center min-h-screen p-6">
            <motion.h1
                className="text-4xl font-bold text-indigo-700 mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                Mirai’s Personality
            </motion.h1>

            <div className="w-full max-w-xl bg-white/80 p-6 rounded-xl shadow-lg backdrop-blur-md">
                {traits.map((t) => (
                    <TraitBar key={t.trait} label={t.trait} value={t.value} />
                ))}
            </div>

            <motion.div
                className="w-full max-w-xl mt-8 bg-white/70 rounded-xl shadow-md p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <PersonalityRadar traits={traits} />
            </motion.div>

            <p className="mt-6 text-gray-500 text-sm">
                💡 Tip: Mirai’s personality evolves as you chat, listen to music, or share your moods.
            </p>
        </div>
    )
}
