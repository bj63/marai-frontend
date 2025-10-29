'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Compass, Loader2, Search } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { searchDirectory, type SearchResult } from '@/lib/supabaseApi'

export default function ExplorePage() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [debounced, setDebounced] = useState('')

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query), 300)
    return () => clearTimeout(id)
  }, [query])

  useEffect(() => {
    if (!debounced.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    let active = true

    const runSearch = async () => {
      setLoading(true)
      const matches = await searchDirectory(debounced)
      if (!active) return
      setResults(matches)
      setLoading(false)
    }

    runSearch()

    return () => {
      active = false
    }
  }, [debounced])

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12 text-brand-mist/80">
      <header className="flex flex-col gap-2 text-white">
        <p className="text-[0.7rem] uppercase tracking-[0.35em] text-brand-mist/60">Explore</p>
        <h1 className="text-3xl font-semibold">Discover federations, posts, and collaborators</h1>
        <p className="text-sm text-brand-mist/70">Search across public profiles and feed entries to grow your social graph.</p>
      </header>

      <div className="flex items-center gap-3 rounded-full border border-white/10 bg-[#101737]/70 px-4 py-3">
        <Search className="h-4 w-4 text-brand-mist/60" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search profiles, posts, or tags"
          className="flex-1 bg-transparent text-sm text-white placeholder:text-brand-mist/50 focus:outline-none"
        />
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#101737]/70 p-6 text-sm text-brand-mist/70">
            <Loader2 className="h-4 w-4 animate-spin text-brand-magnolia" /> Scanning the network…
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-[#0f1737]/60 p-6 text-center text-sm text-brand-mist/70">
            {debounced
              ? 'No matches yet. Try searching for a teammate, federation ID, or post keyword.'
              : 'Start typing to find federations and mood posts.'}
          </div>
        ) : (
          results.map((result) => (
            <motion.a
              key={result.id}
              href={result.href}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#101737]/70 px-4 py-4 text-sm transition hover:border-brand-magnolia/40 hover:text-white"
            >
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-[0.3em] text-brand-mist/60">{result.type}</span>
                <span className="text-base font-semibold text-white">{result.title}</span>
                {result.subtitle ? <span className="text-xs text-brand-mist/60">{result.subtitle}</span> : null}
              </div>
              <Compass className="h-5 w-5 text-brand-magnolia" />
            </motion.a>
          ))
        )}
      </div>

      {!user ? (
        <p className="text-center text-xs text-brand-mist/50">Sign in to follow results and save them to your roster.</p>
      ) : null}
    </div>
  )
}
