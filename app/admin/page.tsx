'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Loader2, PlusCircle, ShieldCheck, Trash2, Users } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import { addTeamMember, getTeamMembers, removeTeamMember, type TeamMember } from '@/lib/supabaseApi'

interface TeamFormState {
  name: string
  email: string
  role: TeamMember['role']
  loginMethod: TeamMember['login_method']
}

const defaultFormState: TeamFormState = {
  name: '',
  email: '',
  role: 'collaborator',
  loginMethod: 'magic-link',
}

const roleCopy: Record<TeamMember['role'], string> = {
  founder: 'Full control over billing, blockchain, and team permissions.',
  admin: 'Manage collaborators, campaigns, and playlists without blockchain keys.',
  collaborator: 'Limited access for musicians, designers, and support staff.',
}

const loginLabels: Record<TeamMember['login_method'], string> = {
  wallet: 'Wallet (Metamask / WalletConnect)',
  google: 'Google SSO',
  'magic-link': 'Magic link (email)',
  password: 'Email & password',
}

export default function AdminPage() {
  const { user, status } = useAuth()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loadingMembers, setLoadingMembers] = useState(true)
  const [formState, setFormState] = useState<TeamFormState>(defaultFormState)
  const [formFeedback, setFormFeedback] = useState<string | null>(null)
  const [savingMember, setSavingMember] = useState(false)
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const loadMembers = async () => {
      if (status !== 'authenticated') {
        setMembers([])
        setLoadingMembers(false)
        return
      }

      setLoadingMembers(true)
      const data = await getTeamMembers()
      if (!active) return
      setMembers(data)
      setLoadingMembers(false)
    }

    loadMembers()

    return () => {
      active = false
    }
  }, [status])

  const founderFallback = useMemo<TeamMember | null>(() => {
    if (!user?.email) return null

    return {
      id: 'founder-local',
      email: user.email,
      name: (user.user_metadata as { username?: string })?.username ?? 'Founder',
      role: 'founder',
      login_method: 'password',
      status: 'active',
      created_at: new Date().toISOString(),
    }
  }, [user?.email, user?.user_metadata])

  const visibleMembers = useMemo(() => {
    if (members.length > 0) return members
    return founderFallback ? [founderFallback] : []
  }, [members, founderFallback])

  const submitTeamMember = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormFeedback(null)

    if (status !== 'authenticated') {
      setFormFeedback('Sign in as the founder to invite teammates.')
      return
    }

    if (!formState.email) {
      setFormFeedback('Enter an email so we know where to send the invitation.')
      return
    }

    if (formState.role !== 'founder' && !formState.name) {
      setFormFeedback('Add a name to help the team keep track of who owns the login.')
      return
    }

    setSavingMember(true)
    const { member, error } = await addTeamMember({
      email: formState.email,
      name: formState.name || null,
      role: formState.role,
      login_method: formState.loginMethod,
    })

    if (error || !member) {
      setFormFeedback('We could not create the invitation. Double-check the Supabase table permissions.')
    } else {
      setMembers((previous) => [...previous, member])
      setFormState(defaultFormState)
      setFormFeedback('Invitation created! The teammate will receive an onboarding email shortly.')
    }

    setSavingMember(false)
  }

  const removeMember = async (member: TeamMember) => {
    if (member.role === 'founder') return
    if (status !== 'authenticated') {
      setFormFeedback('Sign in again to adjust the roster.')
      return
    }
    setRemovingMemberId(member.id)
    const result = await removeTeamMember(member.id)

    if (result.error) {
      setFormFeedback('We could not remove that teammate. Try again or review Supabase RLS policies.')
    } else {
      setMembers((previous) => previous.filter((entry) => entry.id !== member.id))
    }

    setRemovingMemberId(null)
  }

  if (status === 'loading') {
    return (
      <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center gap-4 px-4 py-20 text-brand-mist/70">
        <Loader2 className="h-6 w-6 animate-spin text-brand-magnolia" />
        Checking your permissions…
      </div>
    )
  }

  if (!user) {
    return (
      <div className="relative mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-20 text-brand-mist/70">
        <header className="flex flex-col gap-2 text-white">
          <p className="text-[0.7rem] uppercase tracking-[0.4em] text-brand-mist/60">Admin control center</p>
          <h1 className="text-3xl font-semibold">Sign in to manage the organisation</h1>
        </header>
        <p className="text-sm">
          You need a founder or admin account to view the roster, invite teammates, or revoke access. Head to the sign-in hub to
          authenticate first.
        </p>
        <Link
          href="/auth"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-magnolia/80 px-4 py-2 text-sm font-semibold text-[#0b1022] transition hover:bg-brand-magnolia md:self-start"
        >
          Go to account access
        </Link>
      </div>
    )
  }

  return (
    <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 text-brand-mist/80">
      <header className="flex flex-col gap-2">
        <p className="text-[0.7rem] uppercase tracking-[0.4em] text-brand-mist/60">Admin control center</p>
        <h1 className="text-3xl font-semibold text-white">Own your Mirai organisation</h1>
        <p className="max-w-2xl text-sm text-brand-mist/70">
          Coordinate wallet signers, email logins, and Google access from one dashboard. The founder retains elevated permissions,
          while admins and collaborators can plug into the workflows they need.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0d142c]/70 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Team roster</h2>
              <p className="text-[0.75rem] text-brand-mist/70">
                Invite admins, revoke access, and keep the founder seat reserved for yourself.
              </p>
            </div>
            <Users className="h-6 w-6 text-brand-magnolia" />
          </div>

          <div className="flex flex-col gap-3">
            {loadingMembers ? (
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#101737] px-4 py-3 text-sm text-white">
                <Loader2 className="h-4 w-4 animate-spin text-brand-magnolia" /> Loading team members…
              </div>
            ) : visibleMembers.length > 0 ? (
              visibleMembers.map((member) => (
                <article
                  key={member.id}
                  className="flex flex-col gap-1 rounded-lg border border-white/10 bg-[#0b1026] px-4 py-3 text-sm text-white"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-white">{member.name || member.email}</span>
                    <span className="rounded-full bg-brand-magnolia/10 px-2 py-1 text-[0.65rem] uppercase tracking-[0.35em] text-brand-magnolia">
                      {member.role}
                    </span>
                    <span className="rounded-full bg-white/5 px-2 py-1 text-[0.65rem] uppercase tracking-[0.35em] text-brand-mist/70">
                      {loginLabels[member.login_method]}
                    </span>
                    {member.role === 'founder' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#16204b] px-2 py-1 text-[0.65rem] font-medium text-brand-magnolia">
                        <ShieldCheck className="h-3.5 w-3.5" /> You
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[0.7rem] text-brand-mist/70">{member.email}</p>
                  <p className="text-[0.65rem] text-brand-mist/60">{roleCopy[member.role]}</p>
                  {member.role !== 'founder' ? (
                    <button
                      type="button"
                      onClick={() => removeMember(member)}
                      className="mt-2 inline-flex items-center gap-2 self-start rounded-md border border-white/10 bg-[#161f3e] px-3 py-1 text-[0.7rem] font-semibold text-white transition hover:border-brand-magnolia/50"
                      disabled={removingMemberId === member.id}
                    >
                      {removingMemberId === member.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      Remove access
                    </button>
                  ) : null}
                </article>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-white/20 bg-[#101737] px-4 py-6 text-center text-sm text-brand-mist/70">
                No teammates yet. Use the form to send the first invite.
              </div>
            )}
          </div>

          <form onSubmit={submitTeamMember} className="mt-2 flex flex-col gap-3 rounded-xl border border-white/10 bg-[#101737]/80 p-4">
            <div className="flex items-center gap-2 text-white">
              <PlusCircle className="h-4 w-4 text-brand-mist/70" />
              <h3 className="text-sm font-semibold">Invite a teammate</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-[0.65rem] uppercase tracking-[0.35em] text-brand-mist/60">
                Name
                <input
                  type="text"
                  value={formState.name}
                  onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Alex from A&R"
                  className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-brand-mist/50 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 text-[0.65rem] uppercase tracking-[0.35em] text-brand-mist/60">
                Email
                <input
                  type="email"
                  value={formState.email}
                  onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="collaborator@mirai.ai"
                  className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-brand-mist/50 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 text-[0.65rem] uppercase tracking-[0.35em] text-brand-mist/60">
                Role
                <select
                  value={formState.role}
                  onChange={(event) => setFormState((prev) => ({ ...prev, role: event.target.value as TeamMember['role'] }))}
                  className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="founder">Founder</option>
                  <option value="admin">Admin</option>
                  <option value="collaborator">Collaborator</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-[0.65rem] uppercase tracking-[0.35em] text-brand-mist/60">
                Login method
                <select
                  value={formState.loginMethod}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      loginMethod: event.target.value as TeamMember['login_method'],
                    }))
                  }
                  className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="magic-link">Magic link (email)</option>
                  <option value="password">Email & password</option>
                  <option value="google">Google SSO</option>
                  <option value="wallet">Wallet (Metamask / WalletConnect)</option>
                </select>
              </label>
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-magnolia/80 px-3 py-2 text-sm font-semibold text-[#0b1022] transition hover:bg-brand-magnolia"
              disabled={savingMember}
            >
              {savingMember ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
              {savingMember ? 'Sending invite…' : 'Send invite'}
            </button>
            {formFeedback ? <p className="text-[0.65rem] text-brand-magnolia/80">{formFeedback}</p> : null}
          </form>
        </div>

        <aside className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0d142c]/70 p-6">
          <h2 className="text-lg font-semibold text-white">How everything connects</h2>
          <p className="text-[0.75rem] text-brand-mist/70">
            Keep the founder seat anchored to your email or wallet, then layer other sign-in methods for each squad. Mirai stitches
            Supabase auth with Thirdweb wallets so you can route people by responsibility.
          </p>
          <ul className="flex flex-col gap-3 text-[0.75rem] text-brand-mist/70">
            <li className="rounded-lg border border-white/10 bg-[#101737] px-3 py-2">
              <span className="block font-semibold text-white">Founder cockpit</span>
              Use email + password or a wallet to run billing, deploy drops, and approve contract updates.
            </li>
            <li className="rounded-lg border border-white/10 bg-[#101737] px-3 py-2">
              <span className="block font-semibold text-white">Admin desk</span>
              Admins rely on Google SSO or magic links to triage creators, tweak profiles, and monitor feed activity.
            </li>
            <li className="rounded-lg border border-white/10 bg-[#101737] px-3 py-2">
              <span className="block font-semibold text-white">Collaborator lane</span>
              Collaborators hop in with lightweight magic links to submit music, art, or updates without full admin powers.
            </li>
          </ul>
          <div className="rounded-lg border border-white/10 bg-[#101737] px-3 py-3 text-[0.7rem] text-brand-mist/70">
            <p className="font-semibold text-white">Need to adjust Supabase policies?</p>
            <p>
              Review the{' '}
              <Link href="https://supabase.com/docs/guides/auth" className="text-brand-magnolia underline">
                Supabase auth guide
              </Link>{' '}
              and ensure the <code className="rounded bg-black/40 px-1 py-0.5 text-[0.65rem]">team_members</code> table allows the
              service role to insert and delete rows.
            </p>
          </div>
        </aside>
      </section>
    </div>
  )
}
