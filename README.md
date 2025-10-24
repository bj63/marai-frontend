## Moa AI v3 Frontend

This repository contains the Next.js experience for **Moa AI v3**, our adaptive companion that blends conversational memory, mood tracking, and personality growth.

### Features

- **Chat** — exchange real-time messages with Moa and watch the typing indicator animate while she crafts responses.
- **Mood Feed** — capture daily mood notes and curated tracks that influence Moa’s emotional state.
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
