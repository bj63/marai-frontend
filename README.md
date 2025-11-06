
---

```markdown
# 🌐 MarAI Frontend – Emotional Social Interface

## 📖 Overview
**MarAI Frontend** is the user-facing web interface for the **MarAI** ecosystem.  
Built with **Next.js** and **Supabase**, it provides a real-time chat experience with **Amaris**, the relational AI.  
Users can interact with emotional avatars, view dynamic visuals, and later connect socially via NFT-based relationships.

---

## ⚙️ Features
- **Chat Interface** – Real-time communication with the Amaris AI.  
- **Emotional Avatar Display** – Avatars react to emotion data from the backend.  
- **Supabase Auth** – Secure user registration and login.  
- **API Integration** – Connects to MOA_AI_V3 backend for chat, emotion, and image generation.  
- **Social Feed (Planned)** – Emotion-based posts and relational NFTs.
- **Marketplace Concepts** – Coming soon gallery showcasing AI-generated mock NFTs.
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
> The project depends on scoped packages such as `@nomicfoundation/hardhat-toolbox`. If `npm install` returns a `403` from the npm registry, double-check that the npm account in use has verified its email address and is pointing at the public registry. Additional remediation steps are documented in [docs/npm-troubleshooting.md](./docs/npm-troubleshooting.md).

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

* 🎨 Marketplace page now showcases concept art while the feature is in development
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
