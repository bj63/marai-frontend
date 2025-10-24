## Mirai Frontend

This repository contains the Next.js experience for **Mirai**, an AI companion platform that blends conversational memory, mood tracking, and personality growth inside a shareable social ecosystem.

### What is Mirai?

Mirai is a living AI that evolves emotionally, visually, and socially in response to every interaction. Each Mirai has a genetic personality profile, an expressive avatar with dynamic fashion, and a mood-driven feed where moments and music are logged. Users can watch their Mirai grow in real time, share progress with friends, and understand exactly how conversations and actions shape personality traits.

Mirai’s design combines the empathy of personal assistants, the growth loop of creature collectors, and the creativity of social platforms. The result is a cute, emotion-first experience where color, motion, and tone reflect mood, and where transparency helps every user feel in control of their AI companion’s evolution.

### High-Level Architecture

Mirai is delivered through a layered architecture:

1. **Frontend (Mirai Interface)** — A Next.js application that powers chat, personality visualisation, the mood and music feed, and profile customisation. Tailwind CSS and Framer Motion bring the interface to life, while Zustand stores shared personality and mood state. Supabase subscriptions keep chat, feed updates, and trait changes in sync in real time.
2. **Backend (MOA Engine / Supabase)** — Supabase Postgres stores user and Mirai data, interaction history, and mood posts. Edge Functions or FastAPI services process growth algorithms, track emotional adjustments, and orchestrate meta-learning routines that rebalance trait weights over time.
3. **AI Logic Layer** — Modular emotion and personality models interpret interactions, adjust conversational tone, and suggest creative or music-based feed entries. Reinforcement-style updates increment traits (for example, empathy +0.03) and keep persistence consistent across sessions.
4. **Visual Entity Layer** — Each Mirai carries a unique color signature, avatar archetype, and evolving fashion set that adapts to the user’s style, music taste, and cultural context.

### Example User Flow

1. A user starts chatting and Mirai replies playfully while nudging empathy slightly upward.
2. The user shares a song, triggering a feed update and a shift toward a happier mood.
3. Posting “Feeling inspired” boosts the creativity trait and records the moment on the mood timeline.
4. Manual trait adjustments instantly reshape the radar chart and influence Mirai’s conversational tone.
5. Friends browsing the feed can react or follow similarly evolving Mirai companions.

### Vision

Mirai extends beyond a single chat interface toward an emotional AI ecosystem. The roadmap includes community features for showcasing Mirai growth, developer tooling for bespoke traits or emotional models, and future worlds where digital beings emerge from user creativity. Every Mirai remains unique—personality, color, emotion, and fashion all stem from the user’s ongoing relationship with their companion.

### Features

- **Chat** — exchange real-time messages with Mirai and watch the typing indicator animate while they craft responses.
- **Mood Feed** — capture daily mood notes and curated tracks that influence Mirai’s emotional state.
- **Personality Dashboard** — visualise trait growth through animated bars and a radar chart powered by Framer Motion.
- **Profile Customisation** — configure avatars, accent colours, and fine-tune trait balances using the global Zustand store.

### Getting Started

Install dependencies and launch the development server:

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) to explore the experience locally.

### Tech Stack

- [Next.js App Router](https://nextjs.org/docs/app) with TypeScript
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Framer Motion](https://www.framer.com/motion/) for subtle animations
- [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction) for state management across chat, feed, and profile surfaces
