import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, HelpCircle, Sparkles } from 'lucide-react'

const quickLinks = [
  { href: '/', label: 'Back home', icon: ArrowLeft },
  { href: '/admin', label: 'Founder help', icon: Sparkles },
]

export default function AuthPageNav() {
  return (
    <nav className="sticky top-0 z-30 border-b border-white/5 bg-slate-950/70 px-4 py-3 text-white backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 text-white transition hover:text-brand-mist">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient/80">
            <Image src="/marai-logo.svg" alt="MarAI" width={28} height={28} className="relative z-10 h-6 w-6" priority />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight">MarAI Access</p>
            <p className="text-xs text-brand-mist/80">Secure login area</p>
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-white/80">
          {quickLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 transition hover:border-white/40 hover:text-white"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          ))}
          <a
            href="mailto:founders@marai.com"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 transition hover:border-white/40 hover:text-white"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            Need support?
          </a>
        </div>
      </div>
    </nav>
  )
}
