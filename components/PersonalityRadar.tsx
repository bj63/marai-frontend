'use client'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'

export default function PersonalityRadar({ traits }: { traits: any[] }) {
    return (
        <div className="w-full h-64">
            <ResponsiveContainer>
                <RadarChart data={traits}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="trait" />
                    <Radar
                        name="Personality"
                        dataKey="value"
                        stroke="#6366f1"
                        fill="#6366f1"
                        fillOpacity={0.4}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    )
}
