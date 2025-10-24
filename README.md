🌸 Mirai — Emotional AI Companion

Mirai is a creative AI friend and social platform where users build emotional bonds with evolving digital companions. Each Mirai grows, adapts, and develops its own personality, visual style, and emotional intelligence based on your interactions.

🚀 Project Overview

Mirai’s front-end is built using Next.js + Tailwind + Supabase + Framer Motion, providing:

Real-time chat with personality-based responses

A living avatar that changes mood, style, and emotion

A personality dashboard (radar charts, trust, empathy, curiosity stats)

Music, mood, and story-sharing social feed

PWA-ready mobile experience

🧱 Tech Stack
Layer	Tool	Purpose
Frontend Framework	Next.js (React)	Modern UI + routing
Styling	Tailwind CSS + shadcn/ui	Clean, fast styling
Animation	Framer Motion	Dynamic chat & emotion transitions
Charts	Recharts	Personality visualizations
State	Zustand	Lightweight global store
Backend	Supabase	Auth, data, and real-time events
Deployment	Vercel	Simple production deployment
🧠 Key Features
💬 Chat Interface

Animated message bubbles with mood effects

Personality-driven typing indicators

Avatar mood changes and expressions

🌈 Personality Dashboard

Radar and progress charts for traits

Live updates during chats

History and “growth” timeline

🎧 Social Feed

Share music, moods, or AI stories

Users can view others’ Mirai companions

Embedded YouTube Music or Spotify previews

🧍 Mirai Entity System

Each Mirai has:

A genetic signature (unique color + traits)

A learning memory (based on conversation context)

Optional visual fashion layer (avatar styling tied to user interests)

⚙️ Setup Guide (Rider)
1️⃣ Clone the Repository
git clone https://github.com/bj63/mirai-frontend.git
cd mirai-frontend

2️⃣ Install Dependencies
npm install

3️⃣ Add Environment Variables

Create a .env.local file:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

4️⃣ Run the App
npm run dev


Then open http://localhost:3000

📁 Folder Structure
mirai-frontend/
├── app/
│   ├── chat/              # Chat interface
│   ├── feed/              # Music & story posts
│   ├── profile/           # User settings
│   ├── layout.tsx
│   └── page.tsx
├── components/            # Reusable UI
├── lib/                   # Supabase + helpers
├── styles/                # Global styles
└── package.json

🧩 Next Steps

Build /chat/page.tsx — interactive chat page

Add personality dashboard (Recharts + Zustand)

Add /feed with YouTube Music integration

Deploy on Vercel (vercel --prod)

🌍 Vision

Mirai is more than chat — it’s a digital world of emotional AI companions, blending:

AI personality growth

Visual identity evolution

Social connection & creativity
