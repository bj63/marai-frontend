'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Loader2,
  LogIn,
  LogOut,
  Mail,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  Wallet,
  WalletMinimal,
} from 'lucide-react'
import {
  useAddress,
  useCoinbaseWallet,
  useDisconnect,
  useMetamask,
  useWalletConnect,
} from '@thirdweb-dev/react'
import { reportError } from '@/lib/observability'
import { useAuth } from './AuthProvider'

interface AuthFeedback {
  tone: 'success' | 'neutral' | 'error'
  message: string
}

export default function AuthFlow() {
  const {
    status,
    user,
    signInWithMagicLink,
    signUpWithCredentials,
    signInWithCredentials,
    signInWithGoogle,
    signOut,
  } = useAuth()
  const address = useAddress()
  const connectWithMetamask = useMetamask()
  const connectWithWalletConnect = useWalletConnect()
  const connectWithCoinbase = useCoinbaseWallet()
  const disconnectWallet = useDisconnect()

  const [magicEmail, setMagicEmail] = useState('')
  const [magicFeedback, setMagicFeedback] = useState<AuthFeedback | null>(null)

  const [credentialMode, setCredentialMode] = useState<'signin' | 'signup'>('signin')
  const [credentialsEmail, setCredentialsEmail] = useState('')
  const [credentialsPassword, setCredentialsPassword] = useState('')
  const [credentialsUsername, setCredentialsUsername] = useState('')
  const [credentialsFeedback, setCredentialsFeedback] = useState<AuthFeedback | null>(null)

  const [googleFeedback, setGoogleFeedback] = useState<AuthFeedback | null>(null)
  const [walletFeedback, setWalletFeedback] = useState<AuthFeedback | null>(null)
  const [pendingAction, setPendingAction] = useState<
    'magic' | 'credentials' | 'google' | 'wallet' | 'signout' | null
  >(null)

  const isLoading = status === 'loading'

  const signedInDescriptor = useMemo(() => {
    if (!user) return null
    const base = user.email ?? user.user_metadata?.username
    if (!base) return 'Signed in'
    return `Signed in as ${base}`
  }, [user])

  const submitMagicLink = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMagicFeedback(null)

    if (!magicEmail) {
      setMagicFeedback({
        tone: 'error',
        message: 'Enter an email to receive a one-click sign-in link.',
      })
      return
    }

    setPendingAction('magic')
    const result = await signInWithMagicLink(magicEmail)

    if (result.error) {
      setMagicFeedback({
        tone: 'error',
        message: 'We could not deliver the link. Double-check the email and try again.',
      })
    } else {
      setMagicFeedback({
        tone: 'success',
        message: 'Link sent! Check the inbox to finish signing in.',
      })
      setMagicEmail('')
    }

    setPendingAction(null)
  }

  const submitCredentials = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCredentialsFeedback(null)

    if (!credentialsEmail || !credentialsPassword) {
      setCredentialsFeedback({
        tone: 'error',
        message: 'Email and password are required to continue.',
      })
      return
    }

    if (credentialMode === 'signup' && !credentialsUsername) {
      setCredentialsFeedback({
        tone: 'error',
        message: 'Pick a username so teammates know who owns the account.',
      })
      return
    }

    setPendingAction('credentials')
    const result =
      credentialMode === 'signin'
        ? await signInWithCredentials(credentialsEmail, credentialsPassword)
        : await signUpWithCredentials(credentialsEmail, credentialsPassword, credentialsUsername)

    if (result.error) {
      setCredentialsFeedback({
        tone: 'error',
        message:
          credentialMode === 'signin'
            ? 'We could not verify those details. Reset the password or try another method.'
            : 'We could not create the account. Confirm the email is unique and try again.',
      })
    } else {
      if (credentialMode === 'signup') {
        setCredentialsFeedback({
          tone: 'success',
          message: 'Account created! Confirm the sign-up email to activate it.',
        })
      } else {
        setCredentialsFeedback(null)
      }
    }

    setPendingAction(null)
  }

  const startGoogle = async () => {
    setGoogleFeedback(null)
    setPendingAction('google')

    const result = await signInWithGoogle()

    if (result.error) {
      setGoogleFeedback({
        tone: 'error',
        message: 'Google rejected the request. Check the Supabase provider configuration and try again.',
      })
      setPendingAction(null)
    }
    // On success Supabase redirects, so keep the pending state for the transition.
  }

  const connectWallet = async (connector: () => Promise<unknown>) => {
    setWalletFeedback(null)
    setPendingAction('wallet')
    try {
      await connector()
      setWalletFeedback({
        tone: 'success',
        message: 'Wallet connected. You can now approve marketplace actions.',
      })
    } catch (error) {
      reportError('AuthFlow.connectWallet', error)
      console.error('connectWallet:', error)
      setWalletFeedback({
        tone: 'error',
        message: 'We could not connect to that wallet. Approve the browser request and try again.',
      })
    } finally {
      setPendingAction(null)
    }
  }

  const disconnectCurrentWallet = async () => {
    setWalletFeedback(null)
    setPendingAction('wallet')
    try {
      await disconnectWallet()
      setWalletFeedback({
        tone: 'neutral',
        message: 'Wallet disconnected from this browser session.',
      })
    } finally {
      setPendingAction(null)
    }
  }

  const handleSignOut = async () => {
    setPendingAction('signout')
    try {
      await signOut()
    } finally {
      setPendingAction(null)
    }
  }

  const renderFeedback = (feedback: AuthFeedback | null) => {
    if (!feedback) return null
    const baseColor =
      feedback.tone === 'success'
        ? 'text-brand-magnolia'
        : feedback.tone === 'error'
        ? 'text-[#ff8fa3]'
        : 'text-brand-mist/70'
    return <p className={`text-[0.68rem] ${baseColor}`}>{feedback.message}</p>
  }

  return (
    <div className="flex flex-col gap-10">
      <section className="rounded-3xl border border-white/10 bg-[#0d142c]/70 p-6 text-sm text-brand-mist/80 shadow-[0_24px_80px_rgba(5,10,36,0.45)]">
        <header className="flex flex-col gap-1 border-b border-white/5 pb-4">
          <h2 className="text-xl font-semibold text-white">Choose how you access Mirai</h2>
          <p className="text-[0.78rem] text-brand-mist/70">
            Founders keep a credentials login for billing and deploys. Admins and collaborators can lean on Google,
            magic links, or wallets depending on their responsibilities.
          </p>
          {signedInDescriptor ? (
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-brand-magnolia/10 px-3 py-1 text-[0.68rem] uppercase tracking-[0.32em] text-brand-magnolia">
              <ShieldCheck className="h-3.5 w-3.5" /> {signedInDescriptor}
            </div>
          ) : null}
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0b1026]/80 p-5">
            <div className="flex items-center gap-2 text-white">
              <Mail className="h-4 w-4 text-brand-mist/70" />
              <h3 className="text-sm font-semibold">Magic link</h3>
            </div>
            <p className="text-[0.75rem] text-brand-mist/70">
              Send an instant login email to part-time collaborators. They click once and land inside Mirai.
            </p>
            <form onSubmit={submitMagicLink} className="flex flex-col gap-2">
              <label className="flex flex-col gap-1 text-[0.6rem] uppercase tracking-[0.35em] text-brand-mist/60">
                Email address
                <input
                  type="email"
                  value={magicEmail}
                  onChange={(event) => setMagicEmail(event.target.value)}
                  placeholder="collaborator@mirai.ai"
                  className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-brand-mist/50 focus:outline-none"
                  autoComplete="email"
                />
              </label>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-magnolia/80 px-3 py-2 text-sm font-semibold text-[#0b1022] transition hover:bg-brand-magnolia"
                disabled={isLoading || pendingAction === 'magic'}
              >
                {pendingAction === 'magic' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                {pendingAction === 'magic' ? 'Sending…' : 'Email me a link'}
              </button>
            </form>
            {renderFeedback(magicFeedback)}
          </article>

          <article className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0b1026]/80 p-5">
            <div className="flex items-center gap-2 text-white">
              <UserPlus className="h-4 w-4 text-brand-mist/70" />
              <h3 className="text-sm font-semibold">Email & password</h3>
            </div>
            <p className="text-[0.75rem] text-brand-mist/70">
              Founders and core admins create a credential login so they can manage billing, teams, and releases.
            </p>
            <div className="flex gap-2 text-[0.65rem]">
              <button
                type="button"
                className={`flex-1 rounded-md border border-white/10 px-3 py-2 font-semibold transition ${
                  credentialMode === 'signin'
                    ? 'bg-brand-magnolia/20 text-white'
                    : 'bg-black/30 text-brand-mist/70 hover:text-white'
                }`}
                onClick={() => setCredentialMode('signin')}
              >
                Sign in
              </button>
              <button
                type="button"
                className={`flex-1 rounded-md border border-white/10 px-3 py-2 font-semibold transition ${
                  credentialMode === 'signup'
                    ? 'bg-brand-magnolia/20 text-white'
                    : 'bg-black/30 text-brand-mist/70 hover:text-white'
                }`}
                onClick={() => setCredentialMode('signup')}
              >
                Create account
              </button>
            </div>
            <form onSubmit={submitCredentials} className="flex flex-col gap-2">
              <label className="flex flex-col gap-1 text-[0.6rem] uppercase tracking-[0.35em] text-brand-mist/60">
                Email
                <input
                  type="email"
                  value={credentialsEmail}
                  onChange={(event) => setCredentialsEmail(event.target.value)}
                  placeholder="founder@mirai.ai"
                  className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-brand-mist/50 focus:outline-none"
                  autoComplete={credentialMode === 'signin' ? 'email' : 'new-email'}
                />
              </label>
              <label className="flex flex-col gap-1 text-[0.6rem] uppercase tracking-[0.35em] text-brand-mist/60">
                Password
                <input
                  type="password"
                  value={credentialsPassword}
                  onChange={(event) => setCredentialsPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-brand-mist/50 focus:outline-none"
                  autoComplete={credentialMode === 'signin' ? 'current-password' : 'new-password'}
                />
              </label>
              {credentialMode === 'signup' ? (
                <label className="flex flex-col gap-1 text-[0.6rem] uppercase tracking-[0.35em] text-brand-mist/60">
                  Username
                  <input
                    type="text"
                    value={credentialsUsername}
                    onChange={(event) => setCredentialsUsername(event.target.value)}
                    placeholder="mirai-founder"
                    className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-brand-mist/50 focus:outline-none"
                    autoComplete="username"
                  />
                </label>
              ) : null}
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-bayou/70 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-bayou"
                disabled={isLoading || pendingAction === 'credentials'}
              >
                {pendingAction === 'credentials' ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                {credentialMode === 'signin'
                  ? pendingAction === 'credentials'
                    ? 'Signing in…'
                    : 'Sign in'
                  : pendingAction === 'credentials'
                  ? 'Creating…'
                  : 'Create account'}
              </button>
            </form>
            {renderFeedback(credentialsFeedback)}
          </article>

          <article className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0b1026]/80 p-5">
            <div className="flex items-center gap-2 text-white">
              <ShieldCheck className="h-4 w-4 text-brand-mist/70" />
              <h3 className="text-sm font-semibold">Google single sign-on</h3>
            </div>
            <p className="text-[0.75rem] text-brand-mist/70">
              Route internal admins through Google Workspace so their Mirai access mirrors your directory.
            </p>
            <button
              type="button"
              onClick={startGoogle}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1b2650] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#23306a]"
              disabled={isLoading || pendingAction === 'google'}
            >
              {pendingAction === 'google' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              {pendingAction === 'google' ? 'Redirecting…' : 'Continue with Google'}
            </button>
            {renderFeedback(googleFeedback)}
          </article>

          <article className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0b1026]/80 p-5">
            <div className="flex items-center gap-2 text-white">
              <Wallet className="h-4 w-4 text-brand-mist/70" />
              <h3 className="text-sm font-semibold">Connect a wallet</h3>
            </div>
            <p className="text-[0.75rem] text-brand-mist/70">
              Producers who manage on-chain drops can sign with their wallet to approve releases directly from the marketplace.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => connectWallet(connectWithMetamask)}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-[#101737] px-3 py-2 text-sm font-semibold text-white transition hover:border-brand-magnolia/60"
                disabled={pendingAction === 'wallet'}
              >
                <WalletMinimal className="h-4 w-4" /> Metamask
              </button>
              <button
                type="button"
                onClick={() => connectWallet(connectWithCoinbase)}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-[#101737] px-3 py-2 text-sm font-semibold text-white transition hover:border-brand-magnolia/60"
                disabled={pendingAction === 'wallet'}
              >
                <WalletMinimal className="h-4 w-4" /> Coinbase Wallet
              </button>
              <button
                type="button"
                onClick={() => connectWallet(connectWithWalletConnect)}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-[#101737] px-3 py-2 text-sm font-semibold text-white transition hover:border-brand-magnolia/60"
                disabled={pendingAction === 'wallet'}
              >
                <WalletMinimal className="h-4 w-4" /> WalletConnect
              </button>
              {address ? (
                <button
                  type="button"
                  onClick={disconnectCurrentWallet}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-[#16204b] px-3 py-2 text-sm font-semibold text-white transition hover:border-brand-magnolia/60"
                  disabled={pendingAction === 'wallet'}
                >
                  <LogOut className="h-4 w-4" /> Disconnect
                </button>
              ) : null}
            </div>
            {address ? (
              <p className="break-all text-[0.68rem] text-brand-magnolia/80">Connected wallet: {address}</p>
            ) : null}
            {renderFeedback(walletFeedback)}
          </article>
        </div>
      </section>

      <section className="grid gap-4 rounded-3xl border border-dashed border-white/15 bg-[#0b1026]/60 p-6 text-[0.8rem] text-brand-mist/70 lg:grid-cols-3">
        <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-[#101737]/80 p-4">
          <h3 className="text-sm font-semibold text-white">Founder cockpit</h3>
          <p>
            Keep your own login anchored to email + password or a wallet. That unlocks billing, contract deploys,
            and deleting sensitive data.
          </p>
        </div>
        <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-[#101737]/80 p-4">
          <h3 className="text-sm font-semibold text-white">Admin desk</h3>
          <p>
            Invite operations teammates via Google or credentials so they can manage rosters and review releases
            without touching web3 approvals.
          </p>
        </div>
        <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-[#101737]/80 p-4">
          <h3 className="text-sm font-semibold text-white">Contributor lane</h3>
          <p>
            Magic links are perfect for rotating creatives. Each invite expires quickly and keeps your main login
            separate from guest access.
          </p>
        </div>
      </section>

      {user ? (
        <section className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-[#0d142c]/70 p-6 text-sm text-brand-mist/70">
          <h2 className="text-lg font-semibold text-white">Already done here?</h2>
          <p>
            Head to the <Link href="/admin" className="text-brand-magnolia underline">admin control center</Link>
            {" "}to invite teammates or update access levels.
          </p>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-[#101737] px-3 py-2 text-sm font-semibold text-white transition hover:border-brand-magnolia/60 md:w-auto"
            disabled={pendingAction === 'signout'}
          >
            {pendingAction === 'signout' ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            Sign out on this device
          </button>
        </section>
      ) : (
        <section className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-[#0d142c]/70 p-6 text-sm text-brand-mist/70">
          <h2 className="text-lg font-semibold text-white">Need founder access?</h2>
          <p>
            Create the main credentials login first, then invite collaborators. Once the founder slot exists, you can
            hand off daily management to admins.
          </p>
          <Link
            href="/admin"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-magnolia/80 px-3 py-2 text-sm font-semibold text-[#0b1022] transition hover:bg-brand-magnolia md:w-auto"
          >
            Go to admin hub <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      )}

      {pendingAction === 'google' ? (
        <section className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0b1026]/80 px-4 py-3 text-[0.72rem] text-brand-mist/70">
          <Loader2 className="h-4 w-4 animate-spin text-brand-magnolia" />
          Redirecting to Google… keep this tab open to complete the flow.
        </section>
      ) : null}

      {status === 'unauthenticated' && user && (
        <section className="flex items-center gap-2 rounded-2xl border border-[#ff8fa3]/30 bg-[#2a0b20] px-4 py-3 text-[0.72rem] text-[#ffb3c4]">
          <ShieldAlert className="h-4 w-4" />
          Your session expired. Sign in again to regain access.
        </section>
      )}
    </div>
  )
}
