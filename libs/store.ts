import { create } from 'zustand'

// Define a TypeScript interface for clarity
interface Message {
    from: 'user' | 'mirai'
    text: string
}

interface Personality {
    empathy: number
    creativity: number
    confidence: number
    curiosity: number
    humor: number
}

interface MiraiState {
    messages: Message[]
    personality: Personality
    mood: string

    // Actions
    addMessage: (msg: Message) => void
    setMood: (mood: string) => void
    growTrait: (trait: keyof Personality, amount: number) => void
    resetConversation: () => void
}

// Zustand global store
export const useMiraiStore = create<MiraiState>((set) => ({
    messages: [],
    personality: {
        empathy: 0.75,
        creativity: 0.65,
        confidence: 0.8,
        curiosity: 0.7,
        humor: 0.6,
    },
    mood: 'neutral',

    addMessage: (msg) => set((state) => ({
        messages: [...state.messages, msg],
    })),

    setMood: (mood) => set({ mood }),

    growTrait: (trait, amount) =>
        set((state) => ({
            personality: {
                ...state.personality,
                [trait]: Math.min(1, (state.personality[trait] || 0.5) + amount),
            },
        })),

    resetConversation: () =>
        set({
            messages: [],
            mood: 'neutral',
        }),
}))
