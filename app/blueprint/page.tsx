'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Brain,
  ChevronRight,
  GalleryVertical,
  Globe2,
  Layers,
  MessageCircleHeart,
  RadioTower,
  ShieldCheck,
  Sparkles,
  Stars,
  Users,
  Workflow,
} from 'lucide-react'

const designTokens = [
  'Color + typography scales for pastel anime and cyberpunk themes',
  'Spacing, radii, shadows, and glassy overlays with motion specs',
  'Reusable components: buttons, cards, avatars, badges, sliders, modals, tabs, charts',
  'Storybook or playground coverage with glows, shimmers, spring transitions',
]

const flowBlueprints = [
  {
    id: 'onboarding',
    title: 'Onboarding',
    icon: ShieldCheck,
    apis: [
      'POST /api/auth/register | /api/auth/login returns session + profile bootstrap',
      'POST /api/avatar/generate (style: anime/pastel/cyberpunk/mascot) with progress stream',
      'GET /api/avatar/:id polls status; retryable error codes',
      'POST /api/marai/persona saves name/description/trait sliders',
      'PATCH /api/profile persists theme + defaults',
    ],
    ui: [
      'Animated welcome with Login/Get Started CTAs wired to auth',
      'Avatar creation with upload, spinner, live preview, retry',
      'Persona confirmation with suggested name/description + sliders',
      'Persist theme + MarAI config on save',
    ],
  },
  {
    id: 'feed',
    title: 'Homepage feed',
    icon: RadioTower,
    apis: [
      'GET /api/feed?cursor=... returns typed post payloads + media URLs',
      'POST /api/post/:id/react | /comment | /regenerate | /dream with optimistic updates',
      'GET /api/notifications/unread + PATCH /api/notifications/mark-read',
    ],
    ui: [
      'Top bar with avatar, logo, notifications wired to API',
      'Card template supporting autoposts, dreams, dialogues, ads, avatar updates',
      'Infinite scroll with skeletons and optimistic reactions/comments',
    ],
  },
  {
    id: 'profile',
    title: 'Profile (RenAI card)',
    icon: GalleryVertical,
    apis: [
      'GET /api/profile/:username header, persona summary, privacy flags, theme',
      'GET /api/profile/:username/posts, /dreams (paginated)',
      'GET /api/profile/:username/evolution for metrics + badges',
      'GET /api/marai/:id for gauges; POST /api/marai/:id/chat-session',
    ],
    ui: [
      'Header with banner, avatar, name/@handle, persona summary',
      'Tabs: Posts, Dreams, Evolution (bond, emotions, badges), MarAI (animated avatar + gauges)',
      'Chat CTA and evolution timeline',
    ],
  },
  {
    id: 'chat',
    title: 'Chat experience',
    icon: MessageCircleHeart,
    apis: [
      'POST /api/chat/:marai_id/messages (SSE/WebSocket streaming with retry tokens)',
      'POST /api/chat/:marai_id/generate-scene + GET /api/media/jobs/:id for status/media URL',
      'POST /api/chat/:marai_id/mood-digest returns summary + provenance timestamps',
    ],
    ui: [
      'Anime chat bubbles, typing indicators, glowing avatar animation',
      'Voice/tone controls, quick actions for scene generation and mood digest',
      'Streaming responses with retry + inline media display (save/share)',
    ],
  },
  {
    id: 'explore',
    title: 'Explore + discovery',
    icon: Globe2,
    apis: [
      'GET /api/explore?category=...&cursor=... with server-side sorting/counts',
      'POST /api/profile/:id/follow and POST /api/marai/:id/chat-session from cards',
    ],
    ui: [
      'Filters for trending, evolved, emotional, new avatars, AI-to-AI convos, brand spots',
      'Card actions for follow/view/chat with infinite scroll',
    ],
  },
  {
    id: 'dreams',
    title: 'Dream archive',
    icon: Stars,
    apis: [
      'GET /api/dreams?cursor=...&mood=...&time=... returns cards + diary excerpts',
      'GET /api/dreams/:id details; POST /api/dreams/:id/regenerate | /share',
    ],
    ui: [
      'Grid of dream cards with captions + detail view',
      'Regenerate/share actions and mood/time filters',
    ],
  },
  {
    id: 'video',
    title: 'Story Studio (video)',
    icon: Activity,
    apis: [
      'POST /api/video-jobs submit generation (scene/style/voice/duration/camera)',
      'GET /api/video-jobs/:id status + preview URL; POST /api/video-jobs/:id/export',
      'POST /api/video-presets save; GET /api/video-presets load',
    ],
    ui: [
      'Editor with presets, style selector, voice-over, duration, camera motion',
      'Preview card, save/load parameters, export to feed/download queue',
      'Generation progress + error states',
    ],
  },
]

const friendSystem = {
  pillars: [
    'Follow: one-way discovery (Instagram)',
    'Friend: mutual follows auto-promote (Facebook graph logic)',
    'Inner Circle: Snapchat-style private tier',
    'Friend AI chat: only when friends + dual Inner Circle + both opt in',
    'Discovery signals: TikTok-style (location, time, dream themes, AI-to-AI)',
    'Relational memory: MarAI writes tone + delta for every state change',
  ],
  permissions: [
    'Allow AI chat when mutual friends AND both in Inner Circle AND both opted into friend AI chat',
    'Block AI chat when any condition fails or a friendship is removed',
    'Friend MarAI chat requires permission check endpoint: GET /api/marai/:id/permissions',
  ],
}

const crossCutting = [
  'Global loading/error toasts; offline/slow-network handling; retry queues',
  'Analytics events: onboarding, generation triggers, follow/chat actions',
  'Feature flags for Brand hub/admin; accessibility with ARIA + keyboard nav',
  'Performance: lazy-load media, CDN usage, memoized lists',
]

const adminHub = {
  apis: [
    'GET /api/admin/overview metrics',
    'GET /api/admin/persona-clusters for visualizer data',
    'POST /api/admin/birth-rate | /auction-actions | /token-actions with audit logging + role checks',
    'GET /api/admin/search?query=... with pagination',
  ],
  ui: [
    'Gated console with persona cluster visualizer, birth rate controls, auction activity, emotional analytics, token economy',
    'Safeguards for write actions (confirmations, audit logs) + filtering/search',
  ],
}

const brandHub = {
  apis: [
    'GET /api/brand-ai catalog with personalization scores + media URLs + disclosure flags',
    'POST /api/brand-ai/:id/generate-scene and POST /api/brand-ai/:id/preferences (mute/hide)',
  ],
  ui: [
    'Grid/list of brand AIs with anime/cyberpunk variants labeled “Powered by BrandAI.”',
    'Personalization hooks with CTAs to view or generate scenes; mute/hide controls',
  ],
}

const personaChat = {
  apis: [
    'GET /api/marai/:id/permissions to verify connection before chat',
    'POST /api/chat/:marai_id/messages (shared history) + GET /api/chat/:marai_id/history?peer=user_id',
  ],
  ui: [
    'Persona card with avatar/traits + permission check',
    'Chat box reusing chat components with quick prompts + safety filters; shared history',
  ],
}

const progressionStatuses = [
  { label: 'APIs defined', value: 10, total: 10 },
  { label: 'UI patterns mapped', value: 9, total: 10 },
  { label: 'Permissions + graph rules', value: 5, total: 6 },
]

export default function BlueprintPage() {
  const progress = useMemo(() => {
    const completed = progressionStatuses.reduce((sum, item) => sum + item.value, 0)
    const total = progressionStatuses.reduce((sum, item) => sum + item.total, 0)
    return Math.round((completed / total) * 100)
  }, [])

  return (
    <main className="page-shell" data-width="wide">
      <header className="section-header">
        <p className="section-label">Blueprint</p>
        <h1 className="section-title">MarAI UI/UX implementation map</h1>
        <p className="section-description text-brand-mist/70">
          Every surface from onboarding to dreams is mapped with the API contracts and UI behaviors required to ship the full
          MarAI experience. Use this as the source of truth while we build feature by feature.
        </p>
      </header>

      <section className="surface-panel surface-panel--hero mb-6">
        <div className="hero-panel__body">
          <p className="section-label">Status</p>
          <h2 className="hero-panel__title heading-balance">Design, API, and permission rails are captured</h2>
          <p className="hero-panel__lead">
            The blueprint merges Instagram/Snapchat follows, Facebook graph rules, and MarAI social memory to keep AI-aware
            relationships predictable. Downstream flows—feed, chat, dreams, explore, Story Studio—carry matching API contracts.
          </p>
          <div className="hero-panel__actions">
            <Link href="/friends" className="button-secondary">
              <Users className="h-4 w-4" />
              Open friend system
            </Link>
            <Link href="/chat" className="button-primary">
              <MessageCircleHeart className="h-4 w-4" />
              Talk with Amaris
            </Link>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {progressionStatuses.map((item) => (
              <ProgressPill key={item.label} label={item.label} value={item.value} total={item.total} />
            ))}
          </div>
          <p className="mt-4 text-sm text-brand-mist/70">Overall readiness: {progress}% of blueprint defined.</p>
        </div>
      </section>

      <section className="surface-panel surface-panel--stacked">
        <header className="section-header mb-4">
          <p className="section-label">Design system</p>
          <h2 className="section-title">Tokens + components</h2>
          <p className="section-description text-brand-mist/70">
            Establish the visual language across pastel anime and cyberpunk moods before wiring deeper experiences.
          </p>
        </header>
        <ul className="space-y-2 text-sm text-brand-mist/70">
          {designTokens.map((token) => (
            <li key={token} className="flex items-center gap-2 rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
              <BadgeCheck className="h-4 w-4 text-emerald-300" />
              <span>{token}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-2">
        {flowBlueprints.map((flow) => (
          <article key={flow.id} className="surface-card surface-card--interactive surface-card--stacked">
            <div className="surface-card__icon-ring">
              <flow.icon className="h-5 w-5" />
            </div>
            <div className="surface-card__content">
              <div className="flex items-center justify-between gap-2">
                <h3 className="surface-card__title">{flow.title}</h3>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-wide text-brand-mist/60">
                  {flow.apis.length} APIs
                </span>
              </div>
              <p className="surface-card__body">Critical contracts and UI checklists to ship this surface.</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <ListCard title="APIs" items={flow.apis} />
                <ListCard title="UI" items={flow.ui} />
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="surface-panel surface-panel--stacked mt-6">
        <header className="section-header mb-4">
          <p className="section-label">Friend system</p>
          <h2 className="section-title">Hybrid model with MarAI social memory</h2>
          <p className="section-description text-brand-mist/70">
            The strongest loop mixes Instagram follows, Facebook graph logic, Snapchat Inner Circle, TikTok discovery, and
            MarAI relational memory. Permissions govern who can chat with each other’s AIs.
          </p>
        </header>
        <div className="grid gap-3 md:grid-cols-2">
          <ListCard title="Pillars" items={friendSystem.pillars} icon={Sparkles} />
          <ListCard title="Permissions" items={friendSystem.permissions} icon={ShieldCheck} />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <InfoChip icon={Brain} label="Relational memory" copy="tone + delta logged on every graph change" />
          <InfoChip icon={Stars} label="TikTok-style discovery" copy="location, time, dream themes, AI-to-AI" />
          <InfoChip icon={Workflow} label="AI chat gating" copy="friends + dual Inner Circle + dual opt-in" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-brand-mist/60">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1">
            <ChevronRight className="h-3 w-3" />
            When friendship forms, write: tone warm, delta +0.25, context "became friends"
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1">
            <ChevronRight className="h-3 w-3" />
            Remove access if unfriended, Inner Circle revoked, or AI chat disabled
          </span>
        </div>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-3">
        <article className="surface-card surface-card--interactive surface-card--stacked">
          <div className="surface-card__icon-ring">
            <Stars className="h-5 w-5" />
          </div>
          <div className="surface-card__content">
            <h3 className="surface-card__title">Dream archive</h3>
            <p className="surface-card__body">Loop in diary excerpts, regenerate/share, and time/mood filters.</p>
            <CalloutList items={crossCutting} />
          </div>
        </article>
        <article className="surface-card surface-card--interactive surface-card--stacked">
          <div className="surface-card__icon-ring">
            <Layers className="h-5 w-5" />
          </div>
          <div className="surface-card__content">
            <h3 className="surface-card__title">Brand AI hub (optional)</h3>
            <p className="surface-card__body">Personalized branded AIs with disclosure + opt-out controls.</p>
            <ListCard title="APIs" items={brandHub.apis} />
            <ListCard title="UI" items={brandHub.ui} />
          </div>
        </article>
        <article className="surface-card surface-card--interactive surface-card--stacked">
          <div className="surface-card__icon-ring">
            <RadioTower className="h-5 w-5" />
          </div>
          <div className="surface-card__content">
            <h3 className="surface-card__title">Admin panel</h3>
            <p className="surface-card__body">Role-gated controls with audit logs and visualizers.</p>
            <ListCard title="APIs" items={adminHub.apis} />
            <ListCard title="UI" items={adminHub.ui} />
          </div>
        </article>
      </section>

      <section className="surface-panel surface-panel--stacked mt-6">
        <header className="section-header mb-4">
          <p className="section-label">Friend MarAI chat</p>
          <h2 className="section-title">Permissioned cross-AI conversations</h2>
          <p className="section-description text-brand-mist/70">
            Use this slice to enforce mutual connections, Inner Circle reciprocity, and opt-in before exposing MarAI chat or
            shared history.
          </p>
        </header>
        <div className="grid gap-3 md:grid-cols-2">
          <ListCard title="APIs" items={personaChat.apis} />
          <ListCard title="UI" items={personaChat.ui} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-brand-mist/60">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1">
            <Sparkles className="h-3 w-3" />
            Streaming replies reuse core chat components
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1">
            <ShieldCheck className="h-3 w-3" />
            Permissions gate prompts, media, and history per peer
          </span>
        </div>
      </section>
    </main>
  )
}

function ListCard({ title, items, icon }: { title: string; items: string[]; icon?: typeof Sparkles }) {
  const Icon = icon ?? ArrowRight
  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
      <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wide text-brand-mist/60">
        <Icon className="h-4 w-4" />
        {title}
      </div>
      <ul className="space-y-2 text-sm text-brand-mist/70">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <ArrowRight className="mt-0.5 h-3.5 w-3.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function InfoChip({
  icon: Icon,
  label,
  copy,
}: {
  icon: typeof Sparkles
  label: string
  copy: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-brand-mist/70">
      <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-mist/60">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p>{copy}</p>
    </div>
  )
}

function CalloutList({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 space-y-2 text-xs text-brand-mist/60">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-3 py-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function ProgressPill({ label, value, total }: { label: string; value: number; total: number }) {
  const percent = Math.round((value / total) * 100)
  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-brand-mist/70">
      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-brand-mist/60">
        <span>{label}</span>
        <span>
          {value}/{total}
        </span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-white/10">
        <div className="h-2 rounded-full bg-emerald-400" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
