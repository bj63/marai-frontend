'use client'
import { motion } from 'framer-motion'

export default function ChatMessage({ message }: { message: any }) {
    const isUser = message.from === 'user'
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            <div
                className={`px-4 py-2 rounded-2xl max-w-xs text-sm shadow-md ${
                    isUser
                        ? 'bg-indigo-500 text-white rounded-br-none'
                        : 'bg-white text-gray-700 rounded-bl-none'
                }`}
            >
                {message.text}
            </div>
        </motion.div>
    )
}
