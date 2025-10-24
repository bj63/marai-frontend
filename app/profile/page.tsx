'use client'
import { useMoaStore } from '@/lib/store'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Save } from 'lucide-react'

export default function ProfilePage() {
    const { personality, growTrait, federationId } = useMoaStore()
    const [moaName, setMoaName] = useState('Moa')
    const [color, setColor] = useState('#6366F1')
    const [avatar, setAvatar] = useState('🐱')
    const [copied, setCopied] = useState(false)

    const handleSave = () => {
        alert(`Profile updated! Your Moa: ${moaName}`)
    }

    const handleCopyFederationId = async () => {
        if (!federationId) return

        try {
            await navigator.clipboard.writeText(federationId)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        } catch (error) {
            console.error('Failed to copy federation identifier', error)
        }
    }

    const emojis = ['🐱', '🐰', '🐻', '🐉', '🦊', '🐧', '🐼']

    const handleTraitChange = (trait: keyof typeof personality, val: number) => {
        growTrait(trait, val - (personality[trait] || 0))
    }

    return (
        <div className="flex flex-col items-center min-h-screen p-6">
            <motion.h1
                className="text-4xl font-bold text-indigo-700 mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                Your Moa Profile
            </motion.h1>

            <div className="bg-white/80 p-6 rounded-xl shadow-md w-full max-w-lg">
                <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-6">
                    <div>
                        <p className="text-xs text-indigo-500 uppercase tracking-wide">Federation Identity</p>
                        <p className="text-sm font-mono text-indigo-700 break-all">
                            {federationId || 'Generating...'}
                        </p>
                    </div>
                    <button
                        onClick={handleCopyFederationId}
                        disabled={!federationId}
                        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Copy size={14} />
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>

                {/* Avatar Picker */}
                <label className="block mb-4">
                    <span className="text-sm text-gray-600">Choose Avatar</span>
                    <div className="flex gap-2 mt-2">
                        {emojis.map((emo) => (
                            <button
                                key={emo}
                                onClick={() => setAvatar(emo)}
                                className={`text-2xl p-2 rounded-lg transition ${
                                    avatar === emo ? 'bg-indigo-100 border border-indigo-400' : 'bg-gray-50 border border-gray-200'
                                }`}
                            >
                                {emo}
                            </button>
                        ))}
                    </div>
                </label>

                {/* Name */}
                <label className="block mb-4">
                    <span className="text-sm text-gray-600">Moa’s Name</span>
                    <input
                        type="text"
                        value={moaName}
                        onChange={(e) => setMoaName(e.target.value)}
                        className="w-full p-2 mt-1 border border-gray-300 rounded-md"
                    />
                </label>

                {/* Theme Color */}
                <label className="block mb-4">
                    <span className="text-sm text-gray-600">Accent Color</span>
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-full h-10 mt-1 border border-gray-200 rounded-md"
                    />
                </label>

                {/* Trait Adjustment */}
                <div className="mt-6">
                    <span className="text-sm text-gray-600">Adjust Traits</span>
                    <div className="space-y-3 mt-2">
                        {Object.keys(personality).map((trait) => (
                            <div key={trait}>
                                <label className="flex justify-between text-sm text-gray-700 capitalize">
                                    <span>{trait}</span>
                                    <span>{Math.round(personality[trait as keyof typeof personality] * 100)}%</span>
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={personality[trait as keyof typeof personality]}
                                    onChange={(e) => handleTraitChange(trait as keyof typeof personality, parseFloat(e.target.value))}
                                    className="w-full accent-indigo-500"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    className="flex items-center justify-center gap-2 w-full mt-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition"
                >
                    <Save size={16} /> Save Profile
                </button>
            </div>

            {/* Moa Preview */}
            <motion.div
                className="mt-8 p-6 bg-white/70 rounded-xl shadow-md text-center"
                style={{ borderTop: `4px solid ${color}` }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="text-5xl mb-2">{avatar}</div>
                <h2 className="text-2xl font-bold" style={{ color }}>{moaName}</h2>
                <p className="text-gray-600 text-sm mt-1">is feeling {personality.empathy > 0.6 ? 'supportive' : 'reflective'} today 💫</p>
            </motion.div>
        </div>
    )
}
