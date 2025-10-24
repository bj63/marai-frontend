'use client'
import { motion } from 'framer-motion'

export default function TypingIndicator() {
    return (
        <div className="flex gap-1 items-center ml-4">
            {[0, 1, 2].map((i) => (
                <motion.span
                    key={i}
                    className="w-2 h-2 bg-indigo-400 rounded-full"
                    animate={{ opacity: [0.2, 1, 0.2], y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                />
            ))}
        </div>
    )
}
