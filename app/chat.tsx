'use client'
import { useState } from 'react'
import { useMoaStore } from '@/lib/store'
import ChatMessage from '@/components/ChatMessage'
import ChatInput from '@/components/ChatInput'
import TypingIndicator from '@/components/TypingIndicator'
import AvatarDisplay from '@/components/AvatarDisplay'
import { motion } from 'framer-motion'

export default function ChatPage() {
    const { messages, addMessage, mood, federationId } = useMoaStore()
    const [isTyping, setIsTyping] = useState(false)

    const handleSend = async (text: string) => {
        if (!text.trim()) return

        addMessage({ from: 'user', text, federationId })
        setIsTyping(true)

        // Fake delay for typing animation
        setTimeout(() => {
            addMessage({
                from: 'moa',
                text: `I'm thinking about that... "${text}" sounds interesting 💭`,
                federationId: 'moa-ai-v3',
            })
            setIsTyping(false)
        }, 1500)
    }

    return (
        <div className="flex flex-col min-h-screen items-center justify-between p-4">
            <div className="w-full max-w-2xl flex flex-col items-center gap-2">
                <AvatarDisplay mood={mood} />
                <span className="text-xs text-gray-500">
                    Federation ID: {federationId || 'generating…'}
                </span>
            </div>
            <motion.div
                className="flex-1 w-full max-w-2xl overflow-y-auto space-y-4 mt-4 p-4 bg-white/60 rounded-xl backdrop-blur-md shadow-inner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                {messages.map((msg, i) => (
                    <ChatMessage key={i} message={msg} />
                ))}
                {isTyping && <TypingIndicator />}
            </motion.div>
            <ChatInput onSend={handleSend} />
        </div>
    )
}
