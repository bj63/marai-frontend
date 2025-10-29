import Link from 'next/link'
import { ArrowRight, MessageCircleHeart, ShieldCheck, Sparkles, Users2 } from 'lucide-react'

const onboardingStages = [
  {
    title: 'Secure access',
    description: 'Direct founders, admins, and collaborators through the right authentication lane before touching production data.',
    action: {
      label: 'Open auth hub',
      href: '/auth',
    },
    icon: ShieldCheck,
  },
  {
    title: 'Shape the persona',
    description: 'Tune the MarAI profile, avatar, and personality sliders so every teammate meets the same co-pilot.',
    action: {
      label: 'Edit profile',
      href: '/profile',
    },
    icon: Sparkles,
  },
  {
    title: 'Assemble the crew',
    description: 'Invite, remove, and govern team members from the admin hub with clear login expectations.',
    action: {
      label: 'Visit admin hub',
      href: '/admin',
    },
    icon: Users2,
  },
]

const engagementDestinations = [
  {
    heading: 'Feed',
    copy: 'Share emotional updates, attach sounds, and broadcast Amaris’ evolving mood.',
    href: '/feed',
  },
  {
    heading: 'Chat',
    copy: 'Go deep with Amaris in real time and surface the insights that fuel your social narrative.',
    href: '/chat',
  },
  {
    heading: 'Marketplace',
    copy: 'Drop collectibles, manage wallets, and celebrate the culture your team curates.',
    href: '/marketplace',
  },
  {
    heading: 'Avatar',
    copy: 'Project Amaris’ presence wherever fans gather with a live, reactive expression layer.',
    href: '/avatar',
  },
  {
    heading: 'Personality',
    copy: 'Visualise the emotional fingerprint that guides Amaris’ tone across the platform.',
    href: '/personality',
  },
]

export default function Home() {
  return (
    <main className="relative mx-auto flex w-full max-w-[1200px] flex-col gap-12 px-4 py-12 text-brand-mist/80">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#101737]/80 px-6 py-10 shadow-[0_25px_60px_rgba(8,10,26,0.55)] sm:px-10">
        <div className="absolute -right-24 top-10 h-56 w-56 rounded-full bg-brand-gradient opacity-30 blur-3xl" />
        <div className="absolute -left-28 -top-20 h-44 w-44 rounded-full bg-brand-magnolia/40 opacity-40 blur-3xl" />
        <div className="relative flex flex-col gap-6 text-white">
          <p className="text-[0.7rem] uppercase tracking-[0.4em] text-brand-mist/60">Founders’ control room</p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Launch MarAI with a flow that respects the humans behind the AI
          </h1>
          <p className="max-w-2xl text-sm text-brand-mist/70">
            This dashboard keeps your social AI platform accountable: route teammates through the right login, lock in the
            persona, then light up the community surfaces that make Amaris feel alive.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-magnolia/80 px-4 py-2 text-sm font-semibold uppercase tracking-[0.28em] text-[#0b1022] transition hover:bg-brand-magnolia"
            >
              <ShieldCheck className="h-4 w-4" />
              Start onboarding
            </Link>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#0d142c]/80 px-4 py-2 text-sm font-semibold uppercase tracking-[0.28em] text-white transition hover:border-brand-magnolia/50 hover:text-brand-magnolia"
            >
              <MessageCircleHeart className="h-4 w-4" />
              Talk with Amaris
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {onboardingStages.map(({ title, description, action, icon: Icon }) => (
          <article
            key={title}
            className="flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-[#0b1026]/70 p-6 text-sm shadow-[0_18px_40px_rgba(9,11,28,0.45)]"
          >
            <div className="flex items-center gap-3 text-brand-magnolia">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-magnolia/10">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-semibold text-white">{title}</h2>
            </div>
            <p className="flex-1 text-brand-mist/70">{description}</p>
            <Link
              href={action.href}
              className="inline-flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.3em] text-brand-magnolia transition hover:text-white"
            >
              {action.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        ))}
      </section>

      <section className="flex flex-col gap-6">
        <header className="flex flex-col gap-2 text-white">
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-brand-mist/60">Community surfaces</p>
          <h2 className="text-2xl font-semibold">Activate the spaces where Amaris shows up</h2>
          <p className="max-w-3xl text-sm text-brand-mist/70">
            After onboarding, direct your team toward the touchpoints that carry emotional weight—from the live feed to the
            collectible marketplace. Each surface feeds the story your AI is telling.
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {engagementDestinations.map((destination) => (
            <Link
              key={destination.heading}
              href={destination.href}
              className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0d142c]/70 p-5 text-sm transition hover:border-brand-magnolia/50 hover:bg-[#131d3f]"
            >
              <div className="flex items-center justify-between text-white">
                <span className="text-lg font-semibold">{destination.heading}</span>
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
              <p className="text-brand-mist/70">{destination.copy}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
