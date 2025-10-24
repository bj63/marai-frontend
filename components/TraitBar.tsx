'use client'
import { motion } from 'framer-motion'

export default function TraitBar({ label, value }: { label: string; value: number }) {
    return (
        <div className="my-2">
            <div className="flex justify-between text-sm mb-1">
                <span>{label}</span>
                <span>{Math.round(value * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-indigo-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${value * 100}%` }}
                    transition={{ duration: 0.6 }}
                />
            </div>
        </div>
    )
}
