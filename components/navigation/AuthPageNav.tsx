import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, HelpCircle, Sparkles } from 'lucide-react'

export default function AuthPageNav() {
  return (
    <nav className="relative z-30 border-b border-white/5 bg-slate-950/70 px-6 py-4 text-white shadow-[0_10px_35px_rgba(2,6,23,0.45)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3 text-white transition hover:text-brand-mist">
          <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gradient/80">
            <span className="absolute inset-0 rounded-2xl bg-brand-gradient blur-lg" aria-hidden />
            <Image src="/marai-logo.svg" alt="MarAI" width={40} height={40} className="relative z-10 h-8 w-8" priority />
          </span>
          <div>
            <p className="font-semibold tracking-tight">MarAI Access</p>
            <p className="text-xs uppercase tracking-[0.3em] text-brand-mist/80">Login control center</p>
          </div>
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-3 text-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-brand-mist transition hover:border-white/30"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back home
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-xl border border-brand-peach/20 bg-brand-peach/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-brand-peach-200 transition hover:border-brand-peach/40"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Founder help
          </Link>
          <a
            href="mailto:founders@marai.com"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white transition hover:border-white/30"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            Support
          </a>
        </div>
      </div>
    </nav>
  )
}
