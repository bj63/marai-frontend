'use client'
import { useState } from 'react'
import { Send } from 'lucide-react'

export default function ChatInput({ onSend }: { onSend: (text: string) => void }) {
    const [text, setText] = useState('')

    const handleSend = () => {
        if (!text.trim()) return
        onSend(text)
        setText('')
    }

    return (
        <div className="w-full max-w-2xl flex items-center gap-2 mt-4 bg-white/70 p-2 rounded-lg shadow-sm">
            <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Share something with Moa..."
                className="flex-1 bg-transparent outline-none p-2 text-gray-800"
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
                onClick={handleSend}
                className="p-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition"
            >
                <Send size={18} />
            </button>
        </div>
    )
}
