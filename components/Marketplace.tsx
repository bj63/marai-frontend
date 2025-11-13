'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, CircuitBoard, Heart, MessageCircle, Share2, Sparkles } from 'lucide-react'

import MarketplaceAvatarPreview from './MarketplaceAvatarPreview'

const mockDrops: Array<{
  id: string
  title: string
  vibe: string
  prompt: string
  palette: [string, string]
  accent: string
}> = [
  {
    id: 'E-204',
    title: 'Aurora Bloom',
    vibe: 'Elation Flux',
    prompt: 'Glitched sakura petals refracting through neon rain as Mirai smiles into the lens.',
    palette: ['#A47CFF', '#3CE0B5'],
    accent: '#FF9ECF',
  },
  {
    id: 'L-087',
    title: 'Luminous Drift',
    vibe: 'Calm Pulse',
    prompt: 'Soft ocean fog carrying holographic koi that respond to Amaris’ breathing rhythm.',
    palette: ['#2E3BB5', '#6CE0FF'],
    accent: '#B68CFF',
  },
  {
    id: 'S-133',
    title: 'Spectrum Hearts',
    vibe: 'Curiosity Bloom',
    prompt: 'Fragmented portraits stitched from community voice notes and emotional telemetry.',
    palette: ['#FF9ECF', '#FFE483'],
    accent: '#8DEFFF',
  },
  {
    id: 'R-311',
    title: 'Radiant Cipher',
    vibe: 'Reverie Loop',
    prompt: 'A crystalline mask animating with lyrics from the next synth ballad drop.',
    palette: ['#3CE0B5', '#7A5CFF'],
    accent: '#FFD8FF',
  },
  {
    id: 'V-452',
    title: 'Violet Afterglow',
    vibe: 'Midnight Echo',
    prompt: 'Shattered spotlights painting micro-expressions across Mirai’s future tour stage.',
    palette: ['#5D3EFF', '#120F35'],
    accent: '#FF78CF',
  },
  {
    id: 'N-901',
    title: 'Nebula Chorus',
    vibe: 'Joywave',
    prompt: 'Deep space choir rendering emotional frequencies as floating vinyl shards.',
    palette: ['#1D1B4E', '#5DE4C7'],
    accent: '#EFD6FF',
  },
]

type PlanSectionContent = {
  name: string
  detail: string
  meta?: string
}

type PlanSectionDescriptor = {
  id: string
  title: string
  subtitle: string
  accent?: string
  variant?: 'grid' | 'timeline'
  items: PlanSectionContent[]
  footerNote?: string
}

const planSections: PlanSectionDescriptor[] = [
  {
    id: 'surfaces',
    title: 'Product surfaces',
    subtitle:
      'Four complementary touchpoints help collectors, bidders, and genesis creators navigate evolving NFTs without leaving the MarAI universe.',
    accent: 'linear-gradient(135deg, rgba(164,124,255,0.25), rgba(60,224,181,0.25))',
    items: [
      {
        name: 'Marketplace landing grid',
        detail:
          'Responsive masonry and carousel layouts spotlight live reserve auctions, new emotion evolutions, and secondary listings with filters for emotion tier, cohort, and auction state.',
        meta: 'Discovery',
      },
      {
        name: 'Token detail view',
        detail:
          'Dedicated token pages merge on-chain metadata — lineage, emotion proofs, tokenURI — with social energy like bids, comments, and provenance updates to drive confident bidding.',
        meta: 'Acquisition',
      },
      {
        name: 'Creator cockpit',
        detail:
          'Genesis holders mint, refresh emotion states, and configure auction parameters behind gated controls that sync with the hybrid intelligence pipeline.',
        meta: 'Supply',
      },
      {
        name: 'Collector portfolio',
        detail:
          'A profile tab summarises owned NFTs, bidding history, and routed royalties so collectors can measure impact without leaving their account hub.',
        meta: 'Retention',
      },
    ],
  },
  {
    id: 'integration',
    title: 'Data & contract integration',
    subtitle:
      'Smart contracts, backend workers, and Supabase primitives stitch together the on-chain narrative so the UI can stay reactive.',
    accent: 'linear-gradient(135deg, rgba(60,224,181,0.25), rgba(255,158,207,0.25))',
    items: [
      {
        name: 'On-chain contracts',
        detail:
          'Interact with MarAIEvolvingNFT for minting, emotion reads, and lineage, while MarAIAuctionFactory + MarAIAuction orchestrate reserve auctions and royalty routing.',
        meta: 'Solidity',
      },
      {
        name: 'Backend bridge',
        detail:
          'Extend relational_visual_engine.mint_entity_nft so the pipeline triggers contract calls and emits events whenever NFTs mint or evolve, powering live refreshes.',
        meta: 'Hybrid intelligence',
      },
      {
        name: 'Supabase schema',
        detail:
          'New tables for listings, auction snapshots, and bid history mirror the feed schema, enabling simple queries and websocket updates that hydrate React Query caches.',
        meta: 'Realtime data',
      },
    ],
    footerNote:
      'Surface split breakdowns from RoyaltyRouter.primarySplits() and royaltyInfo so every bid highlights how value flows back to collaborators.',
  },
  {
    id: 'frontend',
    title: 'Frontend architecture',
    subtitle:
      'Next.js routes, shared primitives, and wallet connectivity ensure the marketplace feels cohesive with the rest of MarAI.',
    accent: 'linear-gradient(135deg, rgba(255,158,207,0.25), rgba(164,124,255,0.25))',
    items: [
      {
        name: 'Route structure',
        detail:
          'Under app/marketplace ship routes for the landing grid, token detail pages, and creator tools, while reusing primitives like AuctionCard and EmotionBadge.',
        meta: 'Next.js',
      },
      {
        name: 'State management',
        detail:
          'React Query (or SWR) hydrates listings from Supabase views and gracefully falls back to on-chain reads whenever wallets connect or cache stales.',
        meta: 'Data',
      },
      {
        name: 'Wallet connectivity',
        detail:
          'RainbowKit or wagmi connectors handle auth, network switching, and session tokens that link wallet addresses to mirai_profile records for gated actions.',
        meta: 'Access',
      },
    ],
  },
  {
    id: 'flows',
    title: 'Core auction flows',
    subtitle:
      'From discovery to primary settlement, each step keeps collectors informed and keeps state in sync with the chain.',
    variant: 'timeline',
    items: [
      {
        name: 'Discover & filter',
        detail:
          'Query marketplace_listings_view for live auctions sorted by end time, applying emotion-tier filters and optimistic websocket updates as bids land.',
      },
      {
        name: 'Auction participation',
        detail:
          'Submit bids via MarAIAuction.bid() through wagmi and optimistically append entries to Supabase, handling BidTooLow and AuctionEnded reverts gracefully.',
      },
      {
        name: 'Primary settlement',
        detail:
          'Listen for AuctionFinalized to mark listings as sold, refresh provenance, and display royalty breakdowns from RoyaltyRouter with reserve-miss fallbacks.',
      },
      {
        name: 'Emotion evolution',
        detail:
          'Owners trigger updateEmotionState through the backend pipeline, refreshing the emotion timeline and highlighting newly unlocked tiers.',
      },
      {
        name: 'Secondary sales',
        detail:
          'Expose ERC-2981 compatible listings with royaltyInfo previews and outbound calls-to-action for partner marketplaces.',
      },
    ],
  },
  {
    id: 'creator-tooling',
    title: 'Creator tooling rollout',
    subtitle:
      'Give genesis collaborators the guardrails they need to launch evolving drops confidently.',
    items: [
      {
        name: 'Gated access policies',
        detail:
          'Supabase RLS ties wallet addresses and genesis IDs to cockpit permissions so only approved creators can mint or schedule auctions.',
        meta: 'Trust',
      },
      {
        name: 'Guided launch wizard',
        detail:
          'Step-by-step wizards capture metadata, story, visuals, and lineage settings before hitting the mint endpoint.',
        meta: 'Experience',
      },
      {
        name: 'Emotion-aware previews',
        detail:
          'Preview cards fetch token URI payloads and baseline emotion states, letting creators validate the drop before it goes live.',
        meta: 'Quality',
      },
    ],
  },
  {
    id: 'observability',
    title: 'Observability & QA',
    subtitle:
      'Tight feedback loops keep launches on track and ensure the UI matches on-chain truth.',
    items: [
      {
        name: 'Event tracing',
        detail:
          'Mirror auction lifecycle events into Supabase so dashboards highlight live stats and alert the team when anomalies hit.',
        meta: 'Telemetry',
      },
      {
        name: 'End-to-end testing',
        detail:
          'Playwright simulations validate wallet connections, bid placement, countdown behaviour, and emotion refreshes.',
        meta: 'QA',
      },
      {
        name: 'Contract integration tests',
        detail:
          'Hardhat or Foundry scripts confirm reserve checks, royalty routing, and error messaging before any UI ships.',
        meta: 'Verification',
      },
    ],
  },
]

function PlanSection({
  id,
  title,
  subtitle,
  accent,
  items,
  variant = 'grid',
  footerNote,
}: PlanSectionDescriptor) {
  return (
    <section
      id={id}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0c132d]/75 px-6 py-8 shadow-[0_24px_60px_rgba(6,10,32,0.55)]"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{
          background: accent,
        }}
      />
      <header className="relative mb-6 space-y-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.6rem] uppercase tracking-[0.4em] text-brand-mist/70">
          <CircuitBoard className="h-3 w-3" />
          {title}
        </span>
        <p className="text-sm text-brand-mist/80">{subtitle}</p>
      </header>
      {variant === 'timeline' ? (
        <ol className="relative space-y-4">
          {items.map((item, index) => (
            <li
              key={item.name}
              className="group flex gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/85 transition hover:border-brand-magnolia/40 hover:bg-white/5"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-magnolia/20 text-xs font-semibold text-brand-magnolia">
                {index + 1}
              </span>
              <div className="space-y-1">
                <h3 className="font-semibold text-white">{item.name}</h3>
                <p className="text-sm text-brand-mist/80">{item.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.name}
              className="group flex h-full flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-brand-magnolia/40 hover:bg-white/5"
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.32em] text-brand-mist/60">
                <span>{item.meta ?? 'Strategy'}</span>
                <ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-white">{item.name}</h3>
                <p className="text-sm text-brand-mist/80">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {footerNote ? (
        <p className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs uppercase tracking-[0.32em] text-brand-mist/70">
          {footerNote}
        </p>
      ) : null}
    </section>
  )
}

function MockDropCard({ id, title, vibe, prompt, palette, accent }: (typeof mockDrops)[number]) {
  const [liked, setLiked] = useState(false)
  const [showInsight, setShowInsight] = useState(false)
  const [shareToast, setShareToast] = useState<'idle' | 'copied' | 'error'>('idle')
  const initialReactions = useMemo(() => {
    const base = 220
    const idSeed = id.charCodeAt(0) + id.charCodeAt(id.length - 1)
    return {
      likes: base + idSeed,
      comments: Math.max(12, Math.round(idSeed / 3)),
    }
  }, [id])

  const [likes, setLikes] = useState(initialReactions.likes)
  const [comments] = useState(initialReactions.comments)

  const toggleLike = () => {
    setLiked((next) => {
      const updated = !next
      setLikes((count) => count + (updated ? 1 : -1))
      return updated
    })
  }

  const handleShare = async () => {
    const summary = `${title} – ${vibe}\n${prompt}`
    try {
      await navigator?.clipboard?.writeText(summary)
      setShareToast('copied')
    } catch (error) {
      setShareToast('error')
    }
    setTimeout(() => setShareToast('idle'), 2200)
  }

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_55px_rgba(10,12,34,0.55)] transition-transform duration-300 ease-out hover:-translate-y-1 hover:border-brand-magnolia/60">
      <div
        className="absolute inset-0 -z-10 opacity-70 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `linear-gradient(135deg, ${palette[0]}, ${palette[1]})`,
        }}
      />
      <div className="absolute -bottom-16 right-[-20%] h-40 w-40 rounded-full bg-white/20 blur-3xl" />
      <div className="absolute -top-12 left-[-25%] h-36 w-36 rounded-full bg-brand-magnolia/30 blur-3xl" />

      <div className="relative flex h-full flex-col gap-5">
        <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.38em] text-white/70">
          <span>{id}</span>
          <span>{vibe}</span>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="text-sm leading-6 text-white/75">{prompt}</p>
          <div className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.32em] text-white/70">
            <Sparkles className="h-3 w-3" />
            <span>AI staged lighting preset</span>
          </div>
        </div>
        <div className="mt-auto flex items-center gap-3 pt-2 text-[0.65rem] uppercase tracking-[0.32em] text-white/70">
          <span className="inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
          <span>Mock NFT concept</span>
          <button
            type="button"
            onClick={handleShare}
            className="ml-auto inline-flex items-center gap-1 rounded-full border border-white/20 px-2 py-1 text-[0.6rem] text-white/80 transition hover:border-white/40 hover:bg-white/10"
          >
            <Share2 className="h-3 w-3" />
            Share
          </button>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-white/15 bg-black/20 px-4 py-2 text-[0.65rem] uppercase tracking-[0.32em] text-white/80 backdrop-blur">
          <button
            type="button"
            onClick={toggleLike}
            className="inline-flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.32em] text-white/80 transition hover:text-white"
            aria-pressed={liked}
          >
            <Heart className={`h-4 w-4 transition ${liked ? 'fill-current text-brand-magnolia' : ''}`} />
            {likes}
          </button>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            {comments}
          </div>
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowInsight(true)}
              onMouseLeave={() => setShowInsight(false)}
              className="inline-flex items-center gap-1 rounded-full border border-white/20 px-2 py-1 text-[0.6rem] text-white/80 transition hover:border-white/40 hover:bg-white/10"
            >
              Insight
            </button>
            <div
              className={`absolute right-0 top-full z-20 mt-2 w-52 rounded-2xl border border-white/20 bg-[#0b1129]/95 p-3 text-[0.6rem] leading-5 text-white/80 shadow-[0_12px_30px_rgba(5,8,25,0.5)] transition duration-200 ${
                showInsight ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
            >
              Synth designers flagged this drop for fans who match the <span className="font-semibold">{vibe}</span> vibe.
            </div>
          </div>
        </div>
          {shareToast !== 'idle' && (
            <div
              className={`mt-3 rounded-2xl border border-white/20 px-3 py-2 text-[0.6rem] uppercase tracking-[0.32em] ${shareToast === 'copied' ? 'bg-brand-mint/20 text-brand-mist' : 'bg-[#2b1b2b]/70 text-[#ffc6ff]'}`}
            >
              {shareToast === 'copied' ? 'Concept copied to clipboard' : 'Clipboard share unavailable'}
            </div>
          )}
        </div>
      </article>
    )
  }

export default function Marketplace() {
  return (
    <div className="relative isolate overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background:
            'radial-gradient(circle at 15% 20%, rgba(164, 124, 255, 0.25), transparent 55%), radial-gradient(circle at 80% 10%, rgba(60, 224, 181, 0.2), transparent 45%), radial-gradient(circle at 50% 100%, rgba(255, 158, 207, 0.18), transparent 50%)',
        }}
      />
      <div className="absolute inset-0 -z-10 bg-[#090d23]/70 backdrop-blur-[60px]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-16 text-brand-mist/85">
        <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#101737]/80 px-8 py-10 shadow-[0_35px_80px_rgba(6,10,28,0.6)]">
          <div className="absolute -right-24 top-8 h-48 w-48 rounded-full bg-brand-gradient opacity-30 blur-3xl" />
          <div className="absolute -left-16 -top-20 h-40 w-40 rounded-full bg-brand-magnolia/30 opacity-60 blur-3xl" />
          <div className="relative flex flex-col gap-6 text-white">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.5em] text-brand-mist/70">
              Coming soon
            </span>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              Mirai Marketplace is warming up in the design lab
            </h1>
            <p className="max-w-3xl text-sm text-brand-mist/75">
              We&apos;re teaching the image generator to mint emotional collectibles that pulse with Amaris&apos; mood swings.
              Until the contracts go live, explore the concept art renders our studio is iterating on for the launch drop.
            </p>
            <div className="grid gap-4 text-xs uppercase tracking-[0.4em] text-brand-mist/60 sm:grid-cols-3">
              {[
                'Dynamic drops scored to live emotional data',
                'Wallet integrations land with the production release',
                'Curated previews refresh with every creative sprint',
              ].map((item) => (
                <span key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-[0.68rem]">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </header>

        <MarketplaceAvatarPreview />

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {mockDrops.map((drop) => (
            <MockDropCard key={drop.id} {...drop} />
          ))}
        </section>

        <section className="space-y-6">
          <div className="mx-auto max-w-3xl text-center text-white">
            <h2 className="text-3xl font-semibold">The marketplace roadmap is wired in</h2>
            <p className="mt-3 text-sm text-brand-mist/75">
              We translated the internal blueprint into an actionable launch plan so design, engineering, and growth teams can sprint in sync.
            </p>
          </div>
          <div className="grid gap-6">
            {planSections.map((section) => (
              <PlanSection key={section.id} {...section} />
            ))}
          </div>
        </section>

        <footer className="rounded-3xl border border-white/10 bg-[#0c132d]/80 px-6 py-8 shadow-[0_28px_65px_rgba(5,8,24,0.55)]">
          <div className="flex flex-col gap-4 text-white md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Want first dibs when minting opens?</h2>
              <p className="text-sm text-brand-mist/75">
                Join the creator waitlist and we&apos;ll drop the smart contract walkthrough, wallet checklist, and launch date as
                soon as they&apos;re production ready.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-2xl border border-brand-magnolia/60 bg-brand-magnolia/20 px-5 py-3 text-xs font-semibold uppercase tracking-[0.42em] text-brand-magnolia transition hover:border-brand-magnolia hover:bg-brand-magnolia/30"
            >
              Join the waitlist
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
