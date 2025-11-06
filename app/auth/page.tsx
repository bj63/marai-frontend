import type { Metadata } from 'next'
import AuthFlow from '@/components/auth/AuthFlow'

export const metadata: Metadata = {
  title: 'Access Mirai',
  description:
    'Choose the right authentication path for founders, admins, and collaborators so every teammate lands where they need to.',
}

export default function AuthPage() {
  return (
    <div className="page-shell" data-width="wide">
      <header className="section-header text-white">
        <p className="section-label text-brand-mist/60">Account access</p>
        <h1 className="section-title text-3xl">Sign in, invite, and stay secure</h1>
        <p className="section-description max-w-2xl text-brand-mist/70">
          Mirai supports credentials, Google SSO, magic links, and wallets. Pick the flow that mirrors how your team
          actually works, then hand off admin duties with confidence.
        </p>
      </header>

      <AuthFlow />
    </div>
  )
}
