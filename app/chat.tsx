'use client'
import { useState } from 'react'
import { useMiraiStore } from '@/lib/store'
import ChatMessage from '@/components/ChatMessage'
import ChatInput from '@/components/ChatInput'
import TypingIndicator from '@/components/TypingIndicator'
import AvatarDisplay from '@/components/AvatarDisplay'
import { motion } from 'framer-motion'

export default function ChatPage() {
    const { messages, addMessage, mood } = useMiraiStore()
    const [isTyping, setIsTyping] = useState(false)

    const handleSend = async (text: string) => {
        if (!text.trim()) return

        addMessage({ from: 'user', text })
        setIsTyping(true)

        // Fake delay for typing animation
        setTimeout(() => {
            addMessage({
                from: 'mirai',
                text: `I'm thinking about that... "${text}" sounds interesting 💭`,
            })
            setIsTyping(false)
        }, 1500)
    }

    return (
        <div className="flex flex-col min-h-screen items-center justify-between p-4">
            <AvatarDisplay mood={mood} />
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
