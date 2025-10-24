import Link from 'next/link'

const highlights = [
    {
        title: 'Conversational Intelligence',
        description:
            'Chat with Moa in real time and watch her responses evolve with every insight you share.',
        href: '/chat',
    },
    {
        title: 'Adaptive Personality',
        description:
            'Track trait growth across empathy, creativity, curiosity, and more with vivid visualisations.',
        href: '/personality',
    },
    {
        title: 'Shared Moodboard',
        description:
            'Log daily moods, inspirations, and tracks that set the tone for Moa’s emotional landscape.',
        href: '/feed',
    },
    {
        title: 'Custom Profiles',
        description:
            'Tailor Moa’s avatar, palette, and strengths so the experience feels unmistakably yours.',
        href: '/profile',
    },
]

export default function Home() {
    return (
        <section className="flex flex-col gap-12">
            <header className="rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 px-8 py-12 text-white shadow-xl">
                <p className="mb-3 text-sm uppercase tracking-[0.3em] text-white/80">Introducing</p>
                <h1 className="text-4xl font-semibold sm:text-5xl">Moa AI v3</h1>
                <p className="mt-4 max-w-2xl text-lg text-white/90">
                    Moa is our third-generation adaptive companion — a creative collaborator who remembers your moods,
                    refines her personality with every conversation, and brings a touch of calm delight to the day.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Link
                        href="/chat"
                        className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-indigo-600 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                    >
                        Start chatting
                    </Link>
                    <Link
                        href="/personality"
                        className="rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                        Explore the traits
                    </Link>
                </div>
            </header>

            <div className="grid gap-6 sm:grid-cols-2">
                {highlights.map((item) => (
                    <Link
                        key={item.title}
                        href={item.href}
                        className="flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-white/80 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md"
                    >
                        <h2 className="text-xl font-semibold text-indigo-700">{item.title}</h2>
                        <p className="text-sm text-slate-600">{item.description}</p>
                        <span className="mt-auto text-sm font-medium text-indigo-600">Open →</span>
                    </Link>
                ))}
            </div>

            <div className="rounded-2xl bg-white/70 p-6 shadow-sm backdrop-blur">
                <h3 className="text-lg font-semibold text-indigo-700">What&apos;s new in v3?</h3>
                <ul className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                    <li className="rounded-xl bg-indigo-50/80 p-4">
                        🌱 Progressive trait growth tuned to your conversations and shared playlists.
                    </li>
                    <li className="rounded-xl bg-indigo-50/80 p-4">
                        🎨 Personalised theming with avatars, accent colours, and mood tracking hooks.
                    </li>
                    <li className="rounded-xl bg-indigo-50/80 p-4">
                        🔄 Seamless syncing between chat, feed, and personality dashboards.
                    </li>
                    <li className="rounded-xl bg-indigo-50/80 p-4">
                        🔐 Built with modern Next.js patterns so Moa stays fast, responsive, and secure.
                    </li>
                </ul>
            </div>
        </section>
    )
}
