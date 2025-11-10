
---

```markdown
# 🌐 MarAI Frontend – Emotional Social Interface

## 📖 Overview
**MarAI Frontend** is the user-facing web interface for the **MarAI** ecosystem.  
Built with **Next.js** and **Supabase**, it provides a real-time chat experience with **Amaris**, the relational AI.  
Users can interact with emotional avatars, view dynamic visuals, and later connect socially via NFT-based relationships.

---

## ⚙️ Features
- **Immersive Chat Studio** – Drop-down creative palette with live media uploads, predictive moodline, and AI insights.
- **Chat Interface** – Real-time communication with the Amaris AI.
- **Emotional Avatar Display** – Avatars react to emotion data from the backend.  
- **Supabase Auth** – Secure user registration and login.  
- **API Integration** – Connects to MOA_AI_V3 backend for chat, emotion, and image generation.  
- **Social Feed (Planned)** – Emotion-based posts and relational NFTs.
- **Marketplace Concepts** – Coming soon gallery showcasing AI-generated mock NFTs.
- **Avatar Mint Preview** – Marketplace renders your personalized NFT mockup using live avatar data.
- **Marketplace Social Reactions** – Like, comment, and share your avatar preview with AI-personalised insights.
- **Factime Live Session** – Join the refreshed Factime backend for real-time avatar calls directly from the `/factime` route.
- **Responsive UI** – Fully mobile-optimized experience.
- **Cloud Ready** – Deployable on Vercel in one click.

---

## 🧩 Project Structure
```
## 💡 What the Application Does

**MarAI** is an emotionally intelligent social platform powered by relational AI.  
It blends **chat**, **emotion recognition**, and **AI image generation** to create interactive digital companions and social experiences that evolve emotionally over time.

Users interact with **Amaris**, a glowing AI character who learns emotional states, responds with empathy, and generates expressive visuals.  
Developers can extend the system with APIs and emotional logic modules, while clients can integrate it into apps, NFT platforms, or custom AI solutions.

---

## 🧑‍💻 Developer Instructions

**Goal:** Set up the full stack locally or in the cloud.

### Prerequisites
- Node.js 18+  
- Python 3.10+  
- Supabase account (for DB + Auth)  
- (Optional) Render / Vercel accounts for deployment  

### Steps

#### 1️⃣ Backend Setup (MOA_AI_V3)
```bash
git clone https://github.com/bj63/MOA_AI_V3.git
cd MOA_AI_V3
python -m venv venv
source venv/bin/activate      # macOS/Linux
venv\Scripts\activate         # Windows
pip install -r requirements.txt


marai-frontend/
├── app/
│   ├── chat/                # Chat interface
│   ├── avatar/              # Avatar rendering components
│   ├── profile/             # User emotion & NFT data
│   ├── feed/                # (Planned) Social feed component
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ChatBox.tsx
│   ├── AvatarDisplay.tsx
│   └── EmotionGraph.tsx
├── lib/
│   ├── supabaseClient.ts    # Supabase client configuration
│   └── apiClient.ts         # Backend API integration
├── public/
│   ├── icons/
│   └── logo.svg
├── styles/
│   ├── globals.css
│   └── theme.css
└── package.json

````

---

## 🚀 Running Locally

### 1️⃣ Clone the repository
```bash
git clone https://github.com/bj63/marai-frontend.git
cd marai-frontend
````

### 2️⃣ Install dependencies

```bash
npm install
# or
yarn install
```

### 3️⃣ Add environment variables

Create a `.env.local` file in the project root (optional for offline stubs):

```
NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
NEXT_PUBLIC_SUPABASE_KEY=<your_supabase_key>
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_FACTIME_WS_URL=ws://127.0.0.1:8001
# Optional array of ICE server configs, defaults to browser defaults when omitted
NEXT_PUBLIC_FACTIME_ICE_SERVERS=[{"urls":"stun:stun.l.google.com:19302"}]
```

#### Running without Supabase

If you are just designing the UI and do not have the Supabase credentials handy, leave the Supabase variables unset. The app will automatically enter an **offline test mode** that seeds mock profiles, feeds, notifications, and conversations so every page renders without hitting the live API.

### 4️⃣ Run the development server

```bash
npm run dev
```

App runs at 👉 **[http://localhost:3000](http://localhost:3000)**

> 📌 **Dependency install tips**
>
> Frontend dependencies no longer include the Hardhat toolchain, so `npm install` in the repository root stays clear of the scoped `@nomicfoundation` packages that used to trigger `403` responses on misconfigured npm accounts. When you need to compile or test the Solidity contracts, change into [`contracts/`](./contracts) and run `npm install` there; extra registry troubleshooting steps remain documented in [docs/npm-troubleshooting.md](./docs/npm-troubleshooting.md).

---

## 🔌 Backend Integration

The frontend connects directly to the **MOA_AI_V3** backend using the API URL environment variable:

```ts
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const response = await fetch(`${apiUrl}/chat`, {
  method: "POST",
  body: JSON.stringify({ message }),
});
```

This enables real-time emotion → avatar feedback within the UI.

---

## 🎥 Factime Live Session UI

With the websocket and WebRTC plumbing in place, you can now join a live Factime session straight from the frontend:

1. Define `NEXT_PUBLIC_FACTIME_WS_URL` (and optionally `NEXT_PUBLIC_FACTIME_ICE_SERVERS`) in `.env.local`.
2. Start the development server with `npm run dev`.
3. Navigate to [`http://localhost:3000/factime`](http://localhost:3000/factime).
4. Enter your backend `userId` and optional consent token, then click **Start Call**.

The page will negotiate media, stream your local camera preview, attach the remote avatar feed, and keep a live transcript that mirrors the backend `user-transcript` and `ai-response` events. Manual transcript snippets can also be injected to exercise the backend pipeline.

---

## 📞 Factime Backend Integration Plan

To bridge the refreshed Factime backend with this frontend, follow the end-to-end flow below:

### 1. Session Bootstrapping
- Reuse the Flask authentication flow to obtain a JWT and preload emotional state via the `/api/chat` consent payload.
- Open a websocket connection to `ws://<backend>/ws/{userId}` as soon as the user enters the call lobby.
- Listen for `user-transcript`, `ai-response`, and `ai-audio` events to drive live UI updates.

### 2. Media and Signaling
- Collect local audio/video with the browser `MediaDevices` API and instantiate an `RTCPeerConnection` that mirrors the backend.
- Send SDP offers over the websocket using `{ type: "offer", sdp }` and apply the returned answer to complete the handshake.
- Forward browser ICE candidates and ensure the backend can echo remote candidates if TURN is required.

### 3. Transcript Pipeline
- Stream microphone audio both through the peer connection and an on-device STT component (Web Speech API, VAD + Whisper, etc.).
- Forward recognized phrases as `{ type: "transcript", text, audio?: base64 }` so the backend can trigger HybridIntelligence flows.
- Surface interim STT results while awaiting `ai-response` events, and play `ai-audio` payloads when present.

### 4. Avatar Rendering
- Attach the remote video track from the peer connection to a `<video>` element and apply a loading shimmer until frames arrive.
- Wire mute, end-call, and escalate controls to websocket messages or REST endpoints, respecting backend cooldown rules.

### 5. Error Handling & Resilience
- Detect websocket closures, display a reconnect toast, and retry the handshake with exponential backoff while preserving chat history.
- Show non-blocking banners for `ai-error` events, allowing users to retry transcripts or fall back to `/api/chat` text interactions.
- Log signaling metrics (latency, disconnects) for correlation with Supabase telemetry.

### 6. Testing & Observability
- Add Playwright specs that mock microphone input to validate the transcript → AI loop.
- Capture Cypress visual snapshots to confirm avatar frames align with the design system.
- Feed websocket events into Redux slices or React Query caches and assert store updates with backend-provided mock responses in Jest.

These steps keep the frontend light while leveraging the enriched Factime services for AI avatar calls. The full plan is also available at [`backend/FACTIME_FRONTEND_PLAN.md`](./backend/FACTIME_FRONTEND_PLAN.md).

---

## 🧱 Tech Stack

| Category       | Technology         |
| -------------- | ------------------ |
| **Framework**  | Next.js (React 18) |
| **Language**   | TypeScript         |
| **Auth / DB**  | Supabase           |
| **Styling**    | Tailwind CSS       |
| **AI API**     | MOA_AI_V3 Backend  |
| **Deployment** | Vercel             |

---

## ☁️ Deployment

### **Frontend on Vercel**

1. Push the project to GitHub.
2. Connect the repo on [Vercel](https://vercel.com).
3. Add the same environment variables (`.env.local`).
4. Deploy — the app will automatically build and connect to your backend.

### **Backend Requirement**

The app requires the **MOA_AI_V3** backend to be running on Render, Railway, or locally.

---

## 🔄 Recent Updates

* 🧠 Reimagined chat studio with creative palette navigation, media uploads, and predictive timeline highlights
* 🎨 Marketplace page now showcases concept art while the feature is in development
* 🪪 Avatar mint preview mirrors your current profile inside the marketplace placeholder
* ✨ Refactored API client for reliability
* 💫 Improved emotion → avatar visual synchronization
* 📱 Enhanced responsive layout and animations
* 🔧 Added better Supabase session handling
* 🪪 Documented npm account verification steps for new installs
* 🧩 Prepared social feed scaffolding

---

## 🧠 Next Steps

* Integrate **NFT minting** for emotional connections
* Add **feed interactions** (likes, comments, reposts)
* Cloud GPU integration for AI image generation
* Expand **multi-user relational intelligence**

---

## 👨‍💻 Author

**Berwick O. Smith Jr.**

* GitHub: [bj63](https://github.com/bj63)
* LinkedIn: [berwick-smith23](https://www.linkedin.com/in/berwick-smith23)

---

## 📜 License

This project is proprietary and under founder control.
All rights reserved © 2025 **MarAI Frontend**

```

---

```
