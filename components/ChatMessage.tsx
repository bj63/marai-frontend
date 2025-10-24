'use client'
import { motion } from 'framer-motion'
import type { Message } from '@/lib/store'

interface ChatMessageProps {
    message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
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
                {message.federationId && (
                    <span className={`block mt-1 text-[10px] uppercase tracking-wide ${
                        isUser ? 'text-indigo-200' : 'text-indigo-400'
                    }`}>
                        {message.federationId}
                    </span>
                )}
            </div>
        </motion.div>
    )
}
