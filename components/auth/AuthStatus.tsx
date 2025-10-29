'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, LogIn, LogOut, ShieldCheck, UserCircle2 } from 'lucide-react'
import { useAuth } from './AuthProvider'

export default function AuthStatus() {
  const { status, user, signOut } = useAuth()
  const [pending, setPending] = useState(false)

  const handleSignOut = async () => {
    if (pending) return
    setPending(true)
    try {
      await signOut()
    } finally {
      setPending(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#0b1026]/80 px-3 py-2 text-xs text-brand-mist/70">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-magnolia" />
        Checking session…
      </div>
    )
  }

  if (!user) {
    return (
      <Link
        href="/auth"
        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#101737] px-3 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white transition hover:border-brand-magnolia/60 hover:text-brand-magnolia"
      >
        <LogIn className="h-3.5 w-3.5" />
        Sign in
      </Link>
    )
  }

  return (
    <div className="inline-flex items-center gap-3 rounded-lg border border-white/10 bg-[#0b1026]/80 px-3 py-2 text-xs text-white">
      <span className="flex items-center gap-1 text-brand-mist/80">
        <UserCircle2 className="h-4 w-4 text-brand-magnolia" />
        {user.email}
      </span>
      <Link
        href="/profile"
        className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-[#161f3e] px-2.5 py-1 text-[0.7rem] font-semibold transition hover:border-brand-magnolia/60"
      >
        <UserCircle2 className="h-3.5 w-3.5" />
        Account
      </Link>
      <span className="hidden items-center gap-1 rounded-full bg-brand-magnolia/10 px-2 py-1 text-[0.6rem] uppercase tracking-[0.35em] text-brand-magnolia sm:inline-flex">
        <ShieldCheck className="h-3 w-3" /> Active session
      </span>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-[#161f3e] px-2.5 py-1 text-[0.7rem] font-semibold transition hover:border-brand-magnolia/60"
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
        Sign out
      </button>
    </div>
import { FormEvent, useMemo, useState } from 'react'
import {
  Loader2,
  LogOut,
  Mail,
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
import { useAuth } from './AuthProvider'

export default function AuthStatus() {
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
  const [magicFeedback, setMagicFeedback] = useState<string | null>(null)

  const [credentialMode, setCredentialMode] = useState<'signin' | 'signup'>('signin')
  const [credentialsEmail, setCredentialsEmail] = useState('')
  const [credentialsPassword, setCredentialsPassword] = useState('')
  const [credentialsUsername, setCredentialsUsername] = useState('')
  const [credentialsFeedback, setCredentialsFeedback] = useState<string | null>(null)

  const [googleFeedback, setGoogleFeedback] = useState<string | null>(null)
  const [walletFeedback, setWalletFeedback] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<
    'magic' | 'credentials' | 'google' | 'wallet' | null
  >(null)

  const isLoading = status === 'loading'
import { Loader2, LogOut, Mail } from 'lucide-react'
import { useAuth } from './AuthProvider'

export default function AuthStatus() {
  const { status, user, signInWithEmail, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isLoading = status === 'loading' || submitting

  const heading = useMemo(() => {
    if (user?.email) {
      return `Signed in as ${user.email}`
    }

    return 'Choose how you’d like to access Mirai'
  }, [user?.email])

  const submitMagicLink = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMagicFeedback(null)

    if (!magicEmail) {
      setMagicFeedback('Enter an email to receive a one-click sign-in link.')
      return
    }

    setPendingAction('magic')
    const result = await signInWithMagicLink(magicEmail)

    if (result.error) {
      setMagicFeedback('We could not deliver the link. Double-check the email and try again.')
    } else {
      setMagicFeedback('Check your inbox for a secure link from Mirai to finish signing in.')
      setMagicEmail('')
    }

    setPendingAction(null)
  }

  const submitCredentials = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCredentialsFeedback(null)

    if (!credentialsEmail || !credentialsPassword) {
      setCredentialsFeedback('Email and password are required to continue.')
      return
    }

    if (credentialMode === 'signup' && !credentialsUsername) {
      setCredentialsFeedback('Pick a username so teammates can recognise the account.')
      return
    }

    setPendingAction('credentials')
    const result =
      credentialMode === 'signin'
        ? await signInWithCredentials(credentialsEmail, credentialsPassword)
        : await signUpWithCredentials(
            credentialsEmail,
            credentialsPassword,
            credentialsUsername,
          )

    if (result.error) {
      setCredentialsFeedback(
        credentialMode === 'signin'
          ? 'We could not verify those details. Reset the password or try another method.'
          : 'We could not create the account. Confirm the email is unique and try again.',
      )
    } else {
      if (credentialMode === 'signup') {
        setCredentialsFeedback('Account created! Confirm the sign-up email to activate it.')
      }
    }

    setPendingAction(null)
  }

  const startGoogle = async () => {
    setGoogleFeedback(null)
    setPendingAction('google')

    const result = await signInWithGoogle()

    if (result.error) {
      setGoogleFeedback('Google rejected the request. Check your Supabase configuration and try again.')
      setPendingAction(null)
    }
    // On success Supabase will redirect; leave the loading indicator in place until then.
  }

  const connectWallet = async (connector: () => Promise<unknown>) => {
    setWalletFeedback(null)
    setPendingAction('wallet')
    try {
      await connector()
      setWalletFeedback('Wallet connected. You can use it to approve marketplace actions.')
    } catch (error) {
      console.error('connectWallet:', error)
      setWalletFeedback('We could not connect to the wallet. Approve the request and try again.')
    } finally {
      setPendingAction(null)
    }
  }

  const disconnectCurrentWallet = async () => {
    setWalletFeedback(null)
    setPendingAction('wallet')
    try {
      await disconnectWallet()
      setWalletFeedback('Wallet disconnected from this session.')
    } finally {
      setPendingAction(null)
    }
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-white/10 bg-[#0d142c]/80 p-4 text-xs text-brand-mist/80">
      <header className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-white">{heading}</h2>
        <p className="text-[0.7rem] text-brand-mist/70">
          Mix and match wallet, password, or Google sign-in so founders and collaborators can work the way
          they prefer.
        </p>
      </header>

      {user ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[0.7rem] text-white">
          <ShieldCheck className="h-4 w-4 text-brand-magnolia" />
          <span className="font-medium">Session active</span>
          <span className="text-brand-mist/70">{user.email}</span>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-[#101737] px-2 py-1 text-xs font-semibold text-white transition hover:border-brand-magnolia/60 hover:text-brand-magnolia"
            disabled={isLoading || pendingAction !== null}
          >
            {isLoading || pendingAction === 'magic' || pendingAction === 'credentials' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <LogOut className="h-3.5 w-3.5" />
            )}
            Sign out
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-[#0b1026]/80 p-4">
          <div className="flex items-center gap-2 text-white">
            <Mail className="h-4 w-4 text-brand-mist/70" />
            <h3 className="text-sm font-semibold">Magic link (email)</h3>
          </div>
          <p className="text-[0.7rem] text-brand-mist/70">
            Send yourself or a teammate a one-click email to enter the dashboard without setting a password.
          </p>
          <form onSubmit={submitMagicLink} className="flex flex-col gap-2">
            <label className="flex flex-col gap-1 text-[0.65rem] uppercase tracking-[0.35em] text-brand-mist/60">
              Email address
              <input
                type="email"
                value={magicEmail}
                onChange={(event) => setMagicEmail(event.target.value)}
                placeholder="founder@mirai.ai"
                className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-brand-mist/50 focus:outline-none"
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-magnolia/80 px-3 py-2 text-sm font-semibold text-[#0b1022] transition hover:bg-brand-magnolia"
              disabled={isLoading || pendingAction === 'magic'}
            >
              {pendingAction === 'magic' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {pendingAction === 'magic' ? 'Sending link…' : 'Send magic link'}
            </button>
          </form>
          {magicFeedback ? <p className="text-[0.65rem] text-brand-magnolia/80">{magicFeedback}</p> : null}
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-[#0b1026]/80 p-4">
          <div className="flex items-center gap-2 text-white">
            <UserPlus className="h-4 w-4 text-brand-mist/70" />
            <h3 className="text-sm font-semibold">Email & password</h3>
          </div>
          <p className="text-[0.7rem] text-brand-mist/70">
            Keep a traditional login for founder control. Use the toggles below to register or sign in.
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
              Sign up
            </button>
          </div>
          <form onSubmit={submitCredentials} className="flex flex-col gap-2">
            <label className="flex flex-col gap-1 text-[0.65rem] uppercase tracking-[0.35em] text-brand-mist/60">
              Email
              <input
                type="email"
                value={credentialsEmail}
                onChange={(event) => setCredentialsEmail(event.target.value)}
                placeholder="you@mirai.ai"
                className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-brand-mist/50 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-[0.65rem] uppercase tracking-[0.35em] text-brand-mist/60">
              Password
              <input
                type="password"
                value={credentialsPassword}
                onChange={(event) => setCredentialsPassword(event.target.value)}
                placeholder="••••••••"
                className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-brand-mist/50 focus:outline-none"
              />
            </label>
            {credentialMode === 'signup' ? (
              <label className="flex flex-col gap-1 text-[0.65rem] uppercase tracking-[0.35em] text-brand-mist/60">
                Username
                <input
                  type="text"
                  value={credentialsUsername}
                  onChange={(event) => setCredentialsUsername(event.target.value)}
                  placeholder="mirai-founder"
                  className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-brand-mist/50 focus:outline-none"
                />
              </label>
            ) : null}
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-bayou/60 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-bayou"
              disabled={isLoading || pendingAction === 'credentials'}
            >
              {pendingAction === 'credentials' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {credentialMode === 'signin'
                ? pendingAction === 'credentials'
                  ? 'Signing in…'
                  : 'Sign in'
                : pendingAction === 'credentials'
                ? 'Creating account…'
                : 'Create account'}
            </button>
          </form>
          {credentialsFeedback ? (
            <p className="text-[0.65rem] text-brand-magnolia/80">{credentialsFeedback}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-[#0b1026]/80 p-4">
          <div className="flex items-center gap-2 text-white">
            <ShieldCheck className="h-4 w-4 text-brand-mist/70" />
            <h3 className="text-sm font-semibold">Google single sign-on</h3>
          </div>
          <p className="text-[0.7rem] text-brand-mist/70">
            Route teammates through your Supabase Google provider so they can collaborate with the same
            workspace identity they use elsewhere.
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
          {googleFeedback ? <p className="text-[0.65rem] text-brand-magnolia/80">{googleFeedback}</p> : null}
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-[#0b1026]/80 p-4">
          <div className="flex items-center gap-2 text-white">
            <Wallet className="h-4 w-4 text-brand-mist/70" />
            <h3 className="text-sm font-semibold">Connect a wallet</h3>
          </div>
          <p className="text-[0.7rem] text-brand-mist/70">
            Link Metamask or another EVM wallet to approve drops, mint passes, and sign admin actions on-chain.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => connectWallet(connectWithMetamask)}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-[#101737] px-3 py-2 text-sm font-semibold text-white transition hover:border-brand-magnolia/60"
              disabled={pendingAction === 'wallet'}
            >
              <WalletMinimal className="h-4 w-4" /> Connect Metamask
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
                className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-[#1d274a] px-3 py-2 text-sm font-semibold text-white transition hover:border-brand-magnolia/60"
                disabled={pendingAction === 'wallet'}
              >
                <LogOut className="h-4 w-4" /> Disconnect
              </button>
            ) : null}
          </div>
          {address ? (
            <p className="break-all text-[0.65rem] text-brand-magnolia/80">Connected wallet: {address}</p>
          ) : null}
          {walletFeedback ? <p className="text-[0.65rem] text-brand-magnolia/80">{walletFeedback}</p> : null}
        </div>
      </div>
    return 'Sign in to sync your Mirai data'
  }, [user?.email])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFeedback(null)

    if (!email) {
      setFeedback('Enter an email to receive a magic link.')
      return
    }

    setSubmitting(true)
    const result = await signInWithEmail(email)

    if (result?.error) {
      setFeedback('We could not deliver the sign-in link. Double-check the email and try again.')
    } else {
      setEmail('')
      setFeedback('Check your inbox for a sign-in link from Mirai!')
    }

    setSubmitting(false)
  }

  return (
    <section className="flex flex-col gap-2 rounded-xl border border-white/10 bg-[#0d142c]/80 px-4 py-3 text-xs text-brand-mist/80">
      <h2 className="text-sm font-semibold text-white">{heading}</h2>

      {user ? (
        <button
          type="button"
          onClick={signOut}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-semibold text-white transition hover:border-brand-magnolia/60 hover:text-brand-magnolia"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />} Sign out
        </button>
      ) : (
        <form onSubmit={submit} className="flex w-full flex-col gap-2">
          <label className="flex flex-col gap-1 text-[0.7rem] uppercase tracking-[0.4em] text-brand-mist/60">
            Email
            <span className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white">
              <Mail className="h-4 w-4 text-brand-mist/70" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent text-sm text-white placeholder:text-brand-mist/50 focus:outline-none"
              />
            </span>
          </label>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-magnolia/80 px-3 py-2 font-semibold text-[#0b1022] transition hover:bg-brand-magnolia"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isLoading ? 'Sending link...' : 'Send magic link'}
          </button>
        </form>
      )}

      {feedback ? <p className="text-[0.7rem] text-brand-magnolia/80">{feedback}</p> : null}
    </section>
  )
}
