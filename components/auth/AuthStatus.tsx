'use client'

import { FormEvent, useMemo, useState } from 'react'
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
