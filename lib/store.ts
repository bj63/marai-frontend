import { create } from 'zustand'

// Define a TypeScript interface for clarity
export interface Message {
    from: 'user' | 'moa'
    text: string
    federationId?: string
}

export interface Personality {
    empathy: number
    creativity: number
    confidence: number
    curiosity: number
    humor: number
    energy: number
}

interface MoaState {
    messages: Message[]
    personality: Personality
    mood: string
    federationId: string

    // Actions
    addMessage: (msg: Message) => void
    setMood: (mood: string) => void
    growTrait: (trait: keyof Personality, amount: number) => void
    setPersonality: (personality: Personality) => void
    resetConversation: () => void
    setFederationId: (identifier: string) => void
}

// Zustand global store for Moa AI v3
export const useMoaStore = create<MoaState>((set) => ({
    messages: [],
    personality: {
        empathy: 0.75,
        creativity: 0.65,
        confidence: 0.8,
        curiosity: 0.7,
        humor: 0.6,
        energy: 0.7,
    },
    mood: 'neutral',
    federationId: '',

    addMessage: (msg) =>
        set((state) => {
            const needsFederationId = msg.from === 'user' && !msg.federationId && state.federationId
            const messageWithId = needsFederationId
                ? { ...msg, federationId: state.federationId }
                : msg

            return {
                messages: [...state.messages, messageWithId],
            }
        }),

    setMood: (mood) => set({ mood }),

    growTrait: (trait, amount) =>
        set((state) => ({
            personality: {
                ...state.personality,
                [trait]: Math.min(1, (state.personality[trait] || 0.5) + amount),
            },
        })),

    setPersonality: (personality) =>
        set(() => ({
            personality: { ...personality },
        })),

    resetConversation: () =>
        set({
            messages: [],
            mood: 'neutral',
        }),

    setFederationId: (identifier) =>
        set({
            federationId: identifier,
        }),
}))
