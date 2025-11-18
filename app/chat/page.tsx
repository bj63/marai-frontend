'use client'

import { useState } from 'react'
import { Video } from 'lucide-react'
import Factime from '@/components/Factime'

export default function MarAIChatInterface() {
  const [isFactimeVisible, setIsFactimeVisible] = useState(false)

  // TODO: Replace with the actual user ID from the auth context
  const userId = 'placeholder-user-id'

  return (
    <div className="relative mx-auto flex h-screen max-w-md flex-col overflow-hidden bg-background-light dark:bg-background-dark">
      {isFactimeVisible && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
          <Factime userId={userId} onDisconnect={() => setIsFactimeVisible(false)} />
        </div>
      )}
      {/* Header Bar */}
      <header className="flex shrink-0 items-center justify-between border-b border-white/10 p-4">
        <button className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10">
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <div className="flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-full bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDNJY8Bsi6NEnqe9C0GeUxssuw3eg6dlXtRkHuWQcafPk_wpv5F5NdlkAilugub6117vgs6x-fwu1tRtJe-lvOwONsJZ1LFEaz3rthoN1NBJJMUrW2v9qNmrDdeiO3AqjMpLqmy1qNroZdlKmlpOFvZn3tzbzZ7FGdNBZprIziJXFc52fXDpiHFvd5i9B5D592P1JYKLs1uKN1uHWgL3XM05Xw-VZnh66zt4aD5-mSdHsyipMn931OuPOLn8_waHsrldQxmj9Yp_3Kf')",
            }}
          ></div>
          <h1 className="text-xl font-bold text-white">MarAI</h1>
        </div>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10"
          onClick={() => setIsFactimeVisible(true)}
        >
          <Video className="h-6 w-6" />
        </button>
      </header>
      {/* Main Content Area */}
      <main className="flex flex-1 flex-col overflow-y-auto p-4">
        {/* AI Companion Avatar */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div
              className="h-32 w-32 rounded-full bg-cover bg-center ring-4 ring-primary/50 glow-shadow"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC5uWoZe0F-N8gu0ljHwcssuYYxgg6N9NSD1zpNROyy9mDjtbT8R86gI-A5nRb5qrsaSbuJ7XjRVxcHm3v7sbEIMlJ5winjVKaCIVCED_uSB0wF8SJvEsRwW9BjAoTEeq81Wr49_5HCk0E1XsfaqpORYSmFpUHUEwfIvkxxTk41vGrCDRTn2UPYF7iLVaPsMvN4owTApPrqJ31R44wT8IWc6xFXLmSm7NZH7VgqMLh_365iLOkrzMucQlAWFYuprGI1SWxP-62EmawD')",
              }}
            ></div>
            <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-background-dark bg-green-400"></div>
          </div>
        </div>
        {/* Chat Log Area */}
        <div className="flex flex-1 flex-col justify-end space-y-4">
          {/* AI Welcome Message */}
          <div className="flex items-end gap-3">
            <div
              className="h-10 w-10 shrink-0 rounded-full bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBTGh6GH-th-pCZPIsq8oEDVqC12cywqpycZannNA9fkpHKgBEcNJ9_uoLVxjh9aSKbROT5Qw9c1JkA9XWQz9pxPmpz5zKbGAOxDei708ZidSIx4CVilkWHeU-tAnJ_09ZxGUUzG5qdCrcmr3ZCaapcA2nOjdq0SF9wPJhqoCb0HgQ9hPb-J-R5Ns5sw67d7qZRDPhgWqoC5pX3iIN9lPu9bk2IErpHimWPaFMapsim-1gspxeIbIySXkr3Pb1Gba7VF79yJMxKNYuH')",
              }}
            ></div>
            <div className="flex flex-1 flex-col items-start gap-1">
              <p className="max-w-[360px] text-sm text-white/50">MarAI</p>
              <p className="flex max-w-[360px] rounded-xl rounded-bl-none bg-[#2A2A4E] px-4 py-3 text-base font-normal leading-normal text-white">
                Hello! I'm MarAI, your personal companion. Feel free to ask me anything or try one
                of the actions below. How are you feeling today?
              </p>
            </div>
          </div>
          {/* User Message Example */}
          <div className="flex items-end justify-end gap-3">
            <div className="flex flex-1 flex-col items-end gap-1">
              <p className="max-w-[360px] text-right text-sm text-white/50">You</p>
              <p className="flex max-w-[360px] rounded-xl rounded-br-none bg-primary px-4 py-3 text-base font-normal leading-normal text-white">
                Hey MarAI! I'm doing great, thanks for asking.
              </p>
            </div>
            <div
              className="h-10 w-10 shrink-0 rounded-full bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAtNsJMrukg3ZcMIIX0oVWcRbBf496ersS559SaUPythQgEI6rk31SwUyxIDeKn60ZctKb0XGx0zSgRFaP_bZOlS5WEeOVoBTnN3PiDl2dDeb4pL_xN21FoOoiKihZh5O00W1HhvIBvtpomhUuZpuIS2J5Q1Jfuk-CLOpPTE1FJeKCtYhXMCxq2wVChltpBBpvR_nC7s_41gTZpejVxkJ8mVUXSbgvQlQi8E1MzVKpeO2bqt1QX5ja9ykiteiwtWR7sQqYt4aRdSCNC')",
              }}
            ></div>
          </div>
          {/* AI Typing Indicator */}
          <div className="flex items-end gap-3">
            <div
              className="h-10 w-10 shrink-0 rounded-full bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCplSQXGju7kxE-4SvywldfwAjVf6eAojKHWqtss2-GjV-oz5v3ZywM0O-eqquFXpeANb5MoBuECU16la6wtehW0Ke05ljSqIDEsdviasfkcvpJ7enD4keOfRgZg_OFIX5SXq8TCAHfYnl7KDr_yi3hYXcJ4NBGLY-aDqkIpY5h7HlyhSWHP-Mqzs5ubZUXMfRteJEB3KkyY80fASOmI8qX7jF_vQ4ljVTqyWRGIwEC_PuyIFaAczZrA9jM2zKSA6tIw1HBl71CNDts')",
              }}
            ></div>
            <div className="flex flex-1 flex-col items-start gap-1">
              <p className="max-w-[360px] text-sm text-white/50">MarAI</p>
              <div className="flex max-w-[360px] items-center space-x-1 rounded-xl rounded-bl-none bg-[#2A2A4E] px-4 py-3">
                <span className="h-2 w-2 animate-pulse rounded-full bg-white/40 [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 animate-pulse rounded-full bg-white/40 [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 animate-pulse rounded-full bg-white/40"></span>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Footer with Input and Actions */}
      <footer className="shrink-0 space-y-3 bg-background-dark/80 p-4 pt-2 backdrop-blur-sm">
        {/* Quick Action Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#2A2A4E] px-4 text-sm font-medium text-white transition-colors hover:bg-primary/80">
            ✨ Generate Scene
          </button>
          <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#2A2A4E] px-4 text-sm font-medium text-white transition-colors hover:bg-primary/80">
            ❤️ Ask about mood
          </button>
          <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#2A2A4E] px-4 text-sm font-medium text-white transition-colors hover:bg-primary/80">
            🎲 Suggest topic
          </button>
          <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#2A2A4E] px-4 text-sm font-medium text-white transition-colors hover:bg-primary/80">
            🎨 Create Image
          </button>
        </div>
        {/* Text Input Bar */}
        <div className="flex items-center gap-2">
          <button className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#2A2A4E] text-white/70 transition-colors hover:bg-primary/80">
            <span className="material-symbols-outlined text-2xl">add_circle</span>
          </button>
          <div className="relative flex flex-1 items-center">
            <input
              className="h-12 w-full rounded-full border-0 bg-[#2A2A4E] pl-12 pr-4 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-dark"
              placeholder="Message MarAI..."
              type="text"
            />
            <div className="absolute left-4">
              <span className="material-symbols-outlined text-2xl text-white/50">mood</span>
            </div>
          </div>
          <button className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary/80">
            <span className="material-symbols-outlined text-2xl">send</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
