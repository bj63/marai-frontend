import './globals.css'
import Link from 'next/link'
import { Providers } from './providers'

export const metadata = {
    title: 'Moa AI v3 — Your Adaptive Companion',
    description: 'The third-generation Moa AI that learns and grows with you.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className="bg-gradient-to-br from-indigo-100 via-pink-100 to-white min-h-screen text-gray-900 font-sans">
        <Providers>
            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* 🧭 Global Navigation */}
                <nav className="flex justify-center gap-6 mb-8 text-sm text-indigo-700 font-medium">
                    <Link href="/" className="hover:text-indigo-900 transition">Home</Link>
                    <Link href="/chat" className="hover:text-indigo-900 transition">Chat</Link>
                    <Link href="/marketplace" className="hover:text-indigo-900 transition">Marketplace</Link>
                    <Link href="/personality" className="hover:text-indigo-900 transition">Personality</Link>
                    <Link href="/feed" className="hover:text-indigo-900 transition">Feed</Link>
                    <Link href="/profile" className="hover:text-indigo-900 transition">Profile</Link>
                </nav>

                {/* 🌸 Page Content */}
                <main className="bg-white/70 backdrop-blur-md rounded-2xl shadow-md p-6">
                    {children}
                </main>

                {/* 🪞 Footer */}
                <footer className="mt-10 text-center text-xs text-gray-500">
                    © {new Date().getFullYear()} Moa AI v3 — Growing Together 🌸
                </footer>
            </div>
        </Providers>
        </body>
        </html>
    )
}
