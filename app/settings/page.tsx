'use client'

import { useEffect, useState } from 'react'
import { Loader2, Save, ShieldCheck, Wallet } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { getUserSettings, saveUserSettings, type UserSettings } from '@/lib/supabaseApi'

interface SettingsForm {
  profile_visibility: 'public' | 'private'
  share_activity: boolean
  preferred_login: 'password' | 'google' | 'magic-link' | 'wallet' | ''
  wallet_address: string
}

const defaultForm: SettingsForm = {
  profile_visibility: 'public',
  share_activity: true,
  preferred_login: '',
  wallet_address: '',
}

export default function SettingsPage() {
  const { status, user } = useAuth()
  const [form, setForm] = useState<SettingsForm>(defaultForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    if (status !== 'authenticated' || !user?.id) {
      setLoading(false)
      return
    }

    let active = true

    const load = async () => {
      setLoading(true)
      const record = await getUserSettings(user.id)
      if (!active) return

      if (record) {
        setForm({
          profile_visibility: record.profile_visibility,
          share_activity: record.share_activity,
          preferred_login: record.preferred_login ?? '',
          wallet_address: record.wallet_address ?? '',
        })
      }
      setLoading(false)
    }

    load()

    return () => {
      active = false
    }
  }, [status, user?.id])

  const handleSave = async () => {
    if (!user?.id) return
    setSaving(true)
    setFeedback(null)

    const payload: Partial<UserSettings> = {
      profile_visibility: form.profile_visibility,
      share_activity: form.share_activity,
      preferred_login: form.preferred_login || null,
      wallet_address: form.wallet_address || null,
    }

    const { error } = await saveUserSettings(user.id, payload)
    if (error) {
      setFeedback('We could not save your preferences right now. Double-check Supabase policies and try again.')
      setSaving(false)
      return
    }

    setFeedback('Settings saved! Your privacy preferences now apply across the app.')
    setSaving(false)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-brand-mist/70">
        <Loader2 className="h-5 w-5 animate-spin text-brand-magnolia" />
        <span className="ml-2 text-sm">Loading your settings…</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center gap-4 text-center text-brand-mist/80">
        <ShieldCheck className="h-8 w-8 text-brand-magnolia" />
        <h1 className="text-2xl font-semibold text-white">Sign in to manage privacy</h1>
        <p className="text-sm text-brand-mist/70">Connect your account to control visibility, sharing, and wallet preferences.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-12 text-brand-mist/80">
      <header className="flex flex-col gap-2 text-white">
        <p className="text-[0.7rem] uppercase tracking-[0.35em] text-brand-mist/60">Settings</p>
        <h1 className="text-3xl font-semibold">Control how MarAI shows up for you</h1>
        <p className="text-sm text-brand-mist/70">Adjust privacy, sharing, and wallet configuration to match your operating model.</p>
      </header>

      {feedback ? (
        <div className="rounded-xl border border-brand-magnolia/40 bg-brand-magnolia/10 px-4 py-3 text-sm text-brand-magnolia">
          {feedback}
        </div>
      ) : null}

      <div className="space-y-6 rounded-2xl border border-white/10 bg-[#101737]/70 p-6 text-sm text-brand-mist/80">
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-white">Visibility</h2>
          <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#111c3a]/60 px-4 py-3">
            <input
              type="radio"
              name="visibility"
              value="public"
              checked={form.profile_visibility === 'public'}
              onChange={() => setForm((previous) => ({ ...previous, profile_visibility: 'public' }))}
            />
            <div className="flex flex-col">
              <span className="text-sm text-white">Public profile</span>
              <span className="text-xs text-brand-mist/60">Anyone can view your feed posts and follow you.</span>
            </div>
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#111c3a]/60 px-4 py-3">
            <input
              type="radio"
              name="visibility"
              value="private"
              checked={form.profile_visibility === 'private'}
              onChange={() => setForm((previous) => ({ ...previous, profile_visibility: 'private' }))}
            />
            <div className="flex flex-col">
              <span className="text-sm text-white">Private federation</span>
              <span className="text-xs text-brand-mist/60">Only approved collaborators can view your updates.</span>
            </div>
          </label>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-white">Sharing</h2>
          <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#111c3a]/60 px-4 py-3">
            <input
              type="checkbox"
              checked={form.share_activity}
              onChange={(event) => setForm((previous) => ({ ...previous, share_activity: event.target.checked }))}
            />
            <span className="text-sm text-brand-mist/70">Broadcast my feed activity to followers</span>
          </label>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-white">Preferred login</h2>
          <select
            value={form.preferred_login}
            onChange={(event) => setForm((previous) => ({ ...previous, preferred_login: event.target.value as SettingsForm['preferred_login'] }))}
            className="w-full rounded-md border border-white/10 bg-[#111c3a] px-3 py-2 text-sm text-white"
          >
            <option value="">No preference</option>
            <option value="password">Email + password</option>
            <option value="google">Google SSO</option>
            <option value="magic-link">Magic link</option>
            <option value="wallet">Wallet</option>
          </select>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Wallet className="h-4 w-4" /> Wallet connection
          </h2>
          <input
            type="text"
            value={form.wallet_address}
            onChange={(event) => setForm((previous) => ({ ...previous, wallet_address: event.target.value }))}
            placeholder="0x…"
            className="w-full rounded-md border border-white/10 bg-[#111c3a] px-3 py-2 text-sm text-white placeholder:text-brand-mist/50 focus:outline-none"
          />
          <p className="text-xs text-brand-mist/60">Store a preferred address so marketplace and wallet logins default to the right account.</p>
        </section>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="self-start inline-flex items-center gap-2 rounded-md bg-brand-magnolia/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#0b1022] transition hover:bg-brand-magnolia disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save preferences
      </button>
    </div>
  )
}
