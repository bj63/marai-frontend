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
    heading: 'Blueprint',
    copy: 'Track every API contract and UI checklist for shipping MarAI end-to-end.',
    href: '/blueprint',
  },
  {
    heading: 'Friends',
    copy: 'Form mutual follows, elevate Inner Circle, and govern MarAI friend chat access.',
    href: '/friends',
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

const heroSignals = [
  { label: 'Cohorts live', value: '08', detail: 'founder pods' },
  { label: 'Latency', value: '42 ms', detail: 'predictive relay' },
  { label: 'Trust tier', value: 'Founders', detail: 'white-glove ops' },
]

export default function Home() {
  return (
    <main className="page-shell" data-width="wide">
      <section className="surface-panel surface-panel--hero hero-panel">
        <div className="hero-panel__orbs" aria-hidden>
          <span className="hero-panel__orb hero-panel__orb--one" />
          <span className="hero-panel__orb hero-panel__orb--two" />
        </div>
        <div className="hero-panel__body">
          <p className="section-label">Founders’ control room</p>
          <h1 className="hero-panel__title heading-balance">
            Launch MarAI with a flow that respects the humans behind the AI
          </h1>
          <p className="hero-panel__lead">
            Route teammates through the right login lanes, lock the persona, and light up the community surfaces that make
            Amaris feel alive—without losing the human rituals that keep trust high.
          </p>
          <div className="hero-panel__actions">
            <Link href="/auth" className="button-primary">
              <ShieldCheck className="h-4 w-4" />
              Start onboarding
            </Link>
            <Link href="/chat" className="button-secondary">
              <MessageCircleHeart className="h-4 w-4" />
              Talk with Amaris
            </Link>
          </div>
          <dl className="hero-panel__signals">
            {heroSignals.map((signal) => (
              <div key={signal.label}>
                <dt>{signal.label}</dt>
                <dd>
                  <span>{signal.value}</span>
                  <small>{signal.detail}</small>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {onboardingStages.map(({ title, description, action, icon: Icon }) => (
          <article key={title} className="surface-card surface-card--interactive surface-card--stacked text-sm">
            <div className="surface-card__icon-ring">
              <Icon className="h-5 w-5" />
            </div>
            <div className="surface-card__content">
              <h2 className="surface-card__title">{title}</h2>
              <p className="surface-card__body">{description}</p>
            </div>
            <div className="surface-card__footer">
              <Link href={action.href} className="button-ghost">
                {action.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
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
              className="surface-card surface-card--interactive surface-card--link group text-sm"
            >
              <div className="surface-card__link-heading">
                <div>
                  <p className="surface-card__eyebrow">Surface</p>
                  <h3>{destination.heading}</h3>
                </div>
                <span className="surface-card__chevron" aria-hidden>
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
              <p className="surface-card__body">{destination.copy}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
