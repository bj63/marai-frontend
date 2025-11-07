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
    heading: 'Developers',
    copy: 'Plug third-party health quests into every surface with manifest-driven APIs.',
    href: '/developers',
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
    <main className="page-shell" data-width="wide">
      <section className="surface-panel surface-panel--hero">
        <div className="absolute -right-24 top-10 h-56 w-56 rounded-full bg-brand-gradient opacity-30 blur-3xl" />
        <div className="absolute -left-28 -top-20 h-44 w-44 rounded-full bg-brand-magnolia/40 opacity-40 blur-3xl" />
        <div className="relative flex flex-col gap-6 text-white">
          <p className="section-label text-brand-mist/70">Founders’ control room</p>
          <h1 className="section-title heading-balance text-4xl md:text-5xl">
            Launch MarAI with a flow that respects the humans behind the AI
          </h1>
          <p className="section-description max-w-2xl text-brand-mist/70">
            This dashboard keeps your social AI platform accountable: route teammates through the right login, lock in the
            persona, then light up the community surfaces that make Amaris feel alive.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/auth" className="button-primary">
              <ShieldCheck className="h-4 w-4" />
              Start onboarding
            </Link>
            <Link href="/chat" className="button-secondary">
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
            className="surface-card surface-card--interactive h-full text-sm"
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
        <header className="section-header text-white">
          <p className="section-label text-brand-mist/60">Community surfaces</p>
          <h2 className="section-title text-2xl">Activate the spaces where Amaris shows up</h2>
          <p className="section-description max-w-3xl text-brand-mist/70">
            After onboarding, direct your team toward the touchpoints that carry emotional weight—from the live feed to the
            collectible marketplace. Each surface feeds the story your AI is telling.
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {engagementDestinations.map((destination) => (
            <Link
              key={destination.heading}
              href={destination.href}
              className="surface-card surface-card--interactive group text-sm"
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
