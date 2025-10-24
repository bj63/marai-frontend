'use client'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'

export interface PersonalityTrait {
    trait: string
    value: number
}

interface PersonalityRadarProps {
    traits: PersonalityTrait[]
}

export default function PersonalityRadar({ traits }: PersonalityRadarProps) {
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
