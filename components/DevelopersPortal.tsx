import Link from 'next/link'
import {
  Activity,
  BadgeCheck,
  CloudCog,
  Code2,
  Layers,
  PlugZap,
  Rocket,
  ShieldCheck,
  Webhook,
} from 'lucide-react'

const integrationTracks = [
  {
    title: 'Feed & autopost launches',
    description:
      'Queue reflective lessons, daily quests, or milestone recaps using the creative autopost endpoints. The feed handles distribution, captions, and reactions for you.',
    icon: Rocket,
  },
  {
    title: 'Relational chat companions',
    description:
      'Trigger Amaris follow-ups or schedule reflective prompts so every health game keeps players emotionally regulated inside the chat surface.',
    icon: Activity,
  },
  {
    title: 'Avatar stage cues',
    description:
      'Broadcast new movement presets or expressive states by pairing your webhook calls with the live avatar controls already wired into the platform.',
    icon: Layers,
  },
]

const apiEndpoints = [
  {
    method: 'POST',
    path: '/api/autoposts/creative',
    label: 'Campaign builder',
    summary: 'Generate a fully-scored lesson drop with sentiment targets, insights, and media attachments.',
    payload: ['title', 'body', 'audience', 'scheduledAt', 'emotion', 'callToAction'],
  },
  {
    method: 'POST',
    path: '/api/autoposts',
    label: 'Direct autopost',
    summary: 'Schedule a bespoke update from your own system using the exact voice you want delivered.',
    payload: ['body', 'mood', 'metadata', 'hashtags', 'scheduledAt'],
  },
  {
    method: 'POST',
    path: '/api/autoposts/release-due',
    label: 'Release queue trigger',
    summary: 'Prompt Mirai to publish any lessons whose release window has arrived when your app needs an instant drop.',
    payload: ['releaseUntil'],
  },
  {
    method: 'GET',
    path: '/api/developers/manifest',
    label: 'Capability manifest',
    summary: 'Fetch the latest base URL, supported surfaces, and rate-limit expectations for third-party builders.',
    payload: [],
  },
]

const launchChecklist = [
  {
    heading: 'Authenticate with Supabase tokens',
    detail:
      'Issue a service role or user session token, then exchange it for an API header in your app. Every call maps back to a real MarAI identity.',
  },
  {
    heading: 'Call the manifest to align environments',
    detail:
      'Read the manifest on boot so your integration automatically follows the staging or production base URL being served to the user.',
  },
  {
    heading: 'Model your lesson metadata',
    detail:
      'Reuse the autopost metadata schema—sentiment signals, inspiration tags, optional media—to keep analytics and feed hints consistent.',
  },
  {
    heading: 'Publish into familiar surfaces',
    detail:
      'Send scheduled drops to the feed or trigger Amaris chat follow-ups so players experience your health quests inside existing journeys.',
  },
]

const pricingSignals = [
  {
    tier: 'Starter sandbox',
    price: 'Included',
    notes: [
      'Mock data + offline mode',
      'Up to 500 autopost previews / month',
      'Ideal for prototyping quest flows',
    ],
  },
  {
    tier: 'Growth',
    price: '$149 / month',
    notes: [
      '50k authenticated API calls',
      'Shared Supabase project storage',
      'Insights + sentiment analytics',
    ],
  },
  {
    tier: 'Federation',
    price: 'Let’s design it together',
    notes: [
      'Unlimited surfaces + custom quotas',
      'Private webhooks & dedicated support',
      'Revenue share for marketplace drops',
    ],
  },
]

export default function DevelopersPortal() {
  return (
    <div className="relative isolate overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background:
            'radial-gradient(circle at 20% 15%, rgba(255, 158, 207, 0.18), transparent 50%), radial-gradient(circle at 80% 25%, rgba(60, 224, 181, 0.18), transparent 45%), radial-gradient(circle at 50% 95%, rgba(164, 124, 255, 0.16), transparent 55%)',
        }}
      />
      <div className="absolute inset-0 -z-10 bg-[#070c20]/85 backdrop-blur-[55px]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-16 text-brand-mist/85">
        <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0c1331]/80 px-8 py-12 shadow-[0_38px_90px_rgba(5,10,38,0.6)]">
          <div className="absolute -right-16 top-10 h-44 w-44 rounded-full bg-brand-gradient opacity-30 blur-3xl" />
          <div className="absolute -left-20 -top-12 h-40 w-40 rounded-full bg-brand-magnolia/35 opacity-60 blur-3xl" />
          <div className="relative flex flex-col gap-6 text-white">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.5em] text-brand-mist/70">
              <PlugZap className="h-3.5 w-3.5" />
              Integrations
            </span>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">Bring your health quests into the Mirai experience</h1>
            <p className="max-w-2xl text-brand-mist/70">
              Empower coaches, studios, and wellness labs to run their own teaching apps. Authenticate with Supabase, drop your
              lessons through the autopost queue, and let Amaris handle the emotional follow-through across feed, chat, and avatar.
            </p>
            <div className="flex flex-wrap gap-3 text-sm uppercase tracking-[0.35em]">
              <Link href="/api/developers/manifest" className="button-primary">
                <Code2 className="h-4 w-4" />
                Fetch manifest
              </Link>
              <Link href="mailto:build@marai.studio" className="button-secondary">
                <ShieldCheck className="h-4 w-4" />
                Request credentials
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          {integrationTracks.map(({ title, description, icon: Icon }) => (
            <article key={title} className="surface-card surface-card--interactive h-full">
              <div className="flex items-center gap-3 text-brand-magnolia">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-magnolia/10">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="text-lg font-semibold text-white">{title}</h2>
              </div>
              <p className="text-sm text-brand-mist/70">{description}</p>
            </article>
          ))}
        </section>

        <section className="space-y-6">
          <header className="section-header text-white">
            <p className="section-label text-brand-mist/60">API surface</p>
            <h2 className="section-title text-2xl">Use the same endpoints MarAI ships internally</h2>
            <p className="section-description max-w-3xl text-brand-mist/70">
              Every endpoint is available from your integration once you pass a valid Supabase session token. Start with the manifest,
              then wire the autopost queue into your quest cadence.
            </p>
          </header>
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm text-white/80">
              <thead className="bg-white/5 text-[0.65rem] uppercase tracking-[0.35em] text-brand-mist/60">
                <tr>
                  <th scope="col" className="px-4 py-3">Method</th>
                  <th scope="col" className="px-4 py-3">Path</th>
                  <th scope="col" className="px-4 py-3">Purpose</th>
                  <th scope="col" className="px-4 py-3">Key fields</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-[0.85rem]">
                {apiEndpoints.map(({ method, path, label, summary, payload }) => (
                  <tr key={`${method}-${path}`} className="transition hover:bg-white/5">
                    <td className="whitespace-nowrap px-4 py-4 font-semibold uppercase tracking-[0.3em] text-brand-magnolia">
                      {method}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 font-mono text-xs text-brand-mist/80">{path}</td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-white">{label}</p>
                      <p className="text-brand-mist/70">{summary}</p>
                    </td>
                    <td className="px-4 py-4 text-brand-mist/70">{payload.length > 0 ? payload.join(', ') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="surface-card h-full">
              <h3 className="text-lg font-semibold text-white">Bootstrapping call</h3>
              <p className="text-sm text-brand-mist/70">
                Use the manifest to match whatever environment the dashboard is targeting. Your integration should cache the
                response for a few minutes and refresh if requests fail.
              </p>
              <pre className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-black/60 p-4 text-xs text-brand-mist/80">
{`fetch('/api/developers/manifest')
  .then((res) => res.json())
  .then((manifest) => {
    const { baseUrl, endpoints } = manifest
    // Use baseUrl + endpoint.path for server-to-server calls
  })`}
              </pre>
            </div>
            <div className="surface-card h-full">
              <h3 className="text-lg font-semibold text-white">Webhook expectations</h3>
              <p className="text-sm text-brand-mist/70">
                Production integrations can register a webhook to receive publication receipts or failure events. Include your
                callback URL when requesting credentials so we can bind it to your workspace.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-brand-mist/65">
                <li className="flex items-start gap-2">
                  <Webhook className="mt-1 h-4 w-4 text-brand-magnolia" />
                  <span>
                    <span className="font-medium text-white">autopost.released</span> — delivered when an entry hits the feed with
                    resolved metadata.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CloudCog className="mt-1 h-4 w-4 text-brand-magnolia" />
                  <span>
                    <span className="font-medium text-white">autopost.failed</span> — triggered if validation or delivery breaks so
                    your system can retry.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <header className="section-header text-white">
            <p className="section-label text-brand-mist/60">Launch checklist</p>
            <h2 className="section-title text-2xl">Design your own teaching universe without leaving MarAI</h2>
          </header>
          <ol className="grid gap-4 md:grid-cols-2">
            {launchChecklist.map(({ heading, detail }, index) => (
              <li key={heading} className="surface-card surface-card--interactive relative h-full pl-12">
                <span className="absolute left-5 top-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/10 text-sm font-semibold text-brand-magnolia">
                  {index + 1}
                </span>
                <h3 className="text-lg font-semibold text-white">{heading}</h3>
                <p className="text-sm text-brand-mist/70">{detail}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="space-y-6">
          <header className="section-header text-white">
            <p className="section-label text-brand-mist/60">Pricing guidance</p>
            <h2 className="section-title text-2xl">Meter usage on the same levers we do internally</h2>
            <p className="section-description max-w-3xl text-brand-mist/70">
              Align your pricing with Supabase storage, autopost volume, and emotional analytics compute. Every tier keeps the
              developer story simple while protecting platform resources.
            </p>
          </header>
          <div className="grid gap-4 md:grid-cols-3">
            {pricingSignals.map(({ tier, price, notes }) => (
              <article key={tier} className="surface-card surface-card--interactive flex h-full flex-col">
                <div className="flex items-center justify-between text-white">
                  <h3 className="text-lg font-semibold">{tier}</h3>
                  <BadgeCheck className="h-5 w-5 text-brand-magnolia" />
                </div>
                <p className="text-2xl font-semibold text-brand-magnolia">{price}</p>
                <ul className="mt-4 space-y-2 text-sm text-brand-mist/70">
                  {notes.map((note) => (
                    <li key={note} className="flex items-start gap-2">
                      <ShieldCheck className="mt-1 h-4 w-4 text-brand-magnolia" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <footer className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d122d]/80 px-8 py-10 shadow-[0_30px_70px_rgba(5,10,38,0.55)]">
          <div className="absolute -right-16 bottom-0 h-40 w-40 rounded-full bg-brand-magnolia/30 opacity-40 blur-3xl" />
          <div className="absolute -left-14 top-0 h-36 w-36 rounded-full bg-brand-gradient/40 opacity-40 blur-3xl" />
          <div className="relative flex flex-col gap-4 text-white md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Ready to ship your first quest?</h2>
              <p className="text-sm text-brand-mist/70">
                Share your use case and we’ll align on scopes, quotas, and the emotional beats your audience needs.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm uppercase tracking-[0.35em]">
              <Link href="mailto:build@marai.studio" className="button-primary">
                <PlugZap className="h-4 w-4" />
                Talk with us
              </Link>
              <Link href="/business" className="button-tertiary">
                <CloudCog className="h-4 w-4" />
                Explore analytics
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
