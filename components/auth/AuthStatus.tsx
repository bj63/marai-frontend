'use client'

import { FormEvent, useMemo, useState } from 'react'
import { Loader2, LogOut, Mail, ShieldCheck, UserPlus } from 'lucide-react'

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

  const [magicEmail, setMagicEmail] = useState('')
  const [magicFeedback, setMagicFeedback] = useState<string | null>(null)

  const [credentialMode, setCredentialMode] = useState<'signin' | 'signup'>('signin')
  const [credentialsEmail, setCredentialsEmail] = useState('')
  const [credentialsPassword, setCredentialsPassword] = useState('')
  const [credentialsUsername, setCredentialsUsername] = useState('')
  const [credentialsFeedback, setCredentialsFeedback] = useState<string | null>(null)

  const [googleFeedback, setGoogleFeedback] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<'magic' | 'credentials' | 'google' | null>(null)

  const isLoading = status === 'loading'

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
        : await signUpWithCredentials(credentialsEmail, credentialsPassword, credentialsUsername)

    if (result.error) {
      setCredentialsFeedback(
        credentialMode === 'signin'
          ? 'We could not verify those details. Reset the password or try another method.'
          : 'We could not create the account. Confirm the email is unique and try again.',
      )
    } else if (credentialMode === 'signup') {
      setCredentialsFeedback('Account created! Confirm the sign-up email to activate it.')
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
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-white/10 bg-[#0d142c]/80 p-4 text-xs text-brand-mist/80">
      <header className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-white">{heading}</h2>
        <p className="text-[0.7rem] text-brand-mist/70">
          Mix and match wallet, password, or Google sign-in so founders and collaborators can work the way they prefer.
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
          {credentialsFeedback ? <p className="text-[0.65rem] text-brand-magnolia/80">{credentialsFeedback}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-[#0b1026]/80 p-4">
          <div className="flex items-center gap-2 text-white">
            <ShieldCheck className="h-4 w-4 text-brand-mist/70" />
            <h3 className="text-sm font-semibold">Google single sign-on</h3>
          </div>
          <p className="text-[0.7rem] text-brand-mist/70">
            Route teammates through your Supabase Google provider so they can collaborate with the same workspace identity they use elsewhere.
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
            <ShieldCheck className="h-4 w-4 text-brand-mist/70" />
            <h3 className="text-sm font-semibold">Wallet support on hold</h3>
          </div>
          <p className="text-[0.7rem] text-brand-mist/70">
            We paused on-chain connections while we stabilise authentication. The marketplace UI will light back up once
            wallets return.
          </p>
          <div className="rounded-lg border border-dashed border-white/15 bg-black/30 px-3 py-2 text-[0.65rem] text-brand-mist/60">
            Need to run a contract action? Ping <a href="mailto:founders@mirai.ai" className="text-brand-magnolia underline">founders@mirai.ai</a>{' '}
            and we’ll process it manually until Web3 is back online.
          </div>
        </div>
      </div>
    </section>
  )
}
