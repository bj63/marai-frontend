import type { Metadata } from 'next'
import AuthFlow from '@/components/auth/AuthFlow'

export const metadata: Metadata = {
  title: 'Access Mirai',
  description:
    'Choose the right authentication path for founders, admins, and collaborators so every teammate lands where they need to.',
}

export default function AuthPage() {
  return (
    <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-12 text-brand-mist/80">
      <header className="flex flex-col gap-3 text-white">
        <p className="text-[0.7rem] uppercase tracking-[0.4em] text-brand-mist/60">Account access</p>
        <h1 className="text-3xl font-semibold">Sign in, invite, and stay secure</h1>
        <p className="max-w-2xl text-sm text-brand-mist/70">
          Mirai supports credentials, Google SSO, magic links, and wallets. Pick the flow that mirrors how your team
          actually works, then hand off admin duties with confidence.
        </p>
      </header>

      <AuthFlow />
    </div>
  )
}
