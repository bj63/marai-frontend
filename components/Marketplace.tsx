'use client'

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

function MockDropCard({ id, title, vibe, prompt, palette, accent }: (typeof mockDrops)[number]) {
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
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="text-sm leading-6 text-white/75">{prompt}</p>
        <div className="mt-auto flex items-center gap-3 pt-2 text-[0.65rem] uppercase tracking-[0.32em] text-white/70">
          <span className="inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
          <span>Mock NFT concept</span>
          <span className="ml-auto rounded-full border border-white/20 px-2 py-1 text-[0.6rem] text-white/80">
            Render preview
          </span>
        </div>
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

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {mockDrops.map((drop) => (
            <MockDropCard key={drop.id} {...drop} />
          ))}
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
